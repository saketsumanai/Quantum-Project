"""
Quantum Knowledge Base Indexing Pipeline
==========================================
Owner: Manas Thakur (@heremanasthakur) — Quantum Mathematics, Theory & AI Co-Lead
Branch: feature/member-3-math-ai-manas
Task: TSK-11 — Local Curriculum Vector Indexing & Embeddings

Ingests quantum computing textbooks, research papers, and curriculum JSON into
a local ChromaDB vector store using CPU sentence-transformers (all-MiniLM-L6-v2).
Produces semantic search functionality for the AI Tutor RAG pipeline.

Usage::

    indexer = QuantumKnowledgeIndexer()
    indexer.build_from_curriculum("backend/data/curriculum/modules.json")
    indexer.add_pdf_books("data/books/")

    # Query
    results = indexer.search("How does the Grover diffusion operator work?", k=5)
"""

from __future__ import annotations

import json
import logging
import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Chunk Data Model
# ---------------------------------------------------------------------------

@dataclass
class TextChunk:
    """A single chunk of text ready for embedding."""
    chunk_id: str
    text: str
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        self.text = self.text.strip()


# ---------------------------------------------------------------------------
# Text Chunker
# ---------------------------------------------------------------------------

class RecursiveTextChunker:
    """
    Splits long texts into overlapping chunks of `chunk_size` tokens
    with `overlap` tokens of context carried forward.

    Strategy mirrors LangChain RecursiveCharacterTextSplitter but is
    dependency-free, operating on whitespace-tokenized word counts.
    """

    def __init__(self, chunk_size: int = 500, overlap: int = 50) -> None:
        if chunk_size <= 0:
            raise ValueError("chunk_size must be positive")
        if overlap < 0 or overlap >= chunk_size:
            raise ValueError("overlap must be in [0, chunk_size)")
        self.chunk_size = chunk_size
        self.overlap = overlap

    def split(self, text: str, base_id: str = "chunk") -> list[TextChunk]:
        """Split text into overlapping word-based chunks."""
        words = text.split()
        if not words:
            return []

        chunks: list[TextChunk] = []
        start = 0
        idx = 0

        while start < len(words):
            end = min(start + self.chunk_size, len(words))
            chunk_text = " ".join(words[start:end])
            chunks.append(
                TextChunk(
                    chunk_id=f"{base_id}_chunk{idx:04d}",
                    text=chunk_text,
                    metadata={"start_word": start, "end_word": end},
                )
            )
            idx += 1
            if end == len(words):
                break
            start = end - self.overlap

        return chunks


# ---------------------------------------------------------------------------
# Curriculum Loader
# ---------------------------------------------------------------------------

class CurriculumLoader:
    """
    Loads the structured quantum curriculum JSON and converts each module's
    content (title, description, learning objectives, math content) into
    searchable text chunks.
    """

    def __init__(self, chunker: Optional[RecursiveTextChunker] = None) -> None:
        self.chunker = chunker or RecursiveTextChunker(chunk_size=500, overlap=50)

    def load(self, curriculum_path: str | Path) -> list[TextChunk]:
        path = Path(curriculum_path)
        if not path.exists():
            raise FileNotFoundError(f"Curriculum file not found: {path}")

        with open(path, encoding="utf-8") as f:
            data = json.load(f)

        modules = data.get("modules", [])
        all_chunks: list[TextChunk] = []

        for module in modules:
            chunks = self._module_to_chunks(module)
            all_chunks.extend(chunks)

        logger.info(
            "Loaded %d chunks from %d curriculum modules.", len(all_chunks), len(modules)
        )
        return all_chunks

    def _module_to_chunks(self, module: dict) -> list[TextChunk]:
        """Convert a single curriculum module dict to text chunks."""
        parts: list[str] = []

        title = module.get("title", "")
        slug = module.get("slug", module.get("id", "unknown"))
        description = module.get("description", "")
        objectives = module.get("learning_objectives", [])
        math_content = module.get("mathematical_content", {})
        concepts = module.get("key_concepts", [])

        parts.append(f"Module: {title}")
        parts.append(f"Description: {description}")

        if objectives:
            parts.append("Learning Objectives: " + " | ".join(objectives))

        if concepts:
            parts.append("Key Concepts: " + ", ".join(concepts))

        # Flatten math content to natural-language strings
        for key, value in math_content.items():
            if isinstance(value, str):
                parts.append(f"{key.replace('_', ' ').title()}: {value}")
            elif isinstance(value, dict):
                for sub_key, sub_val in value.items():
                    parts.append(
                        f"{key.replace('_', ' ').title()} - {sub_key}: {sub_val}"
                    )

        full_text = "\n".join(parts)
        base_metadata = {
            "source": "curriculum",
            "module_id": module.get("id", slug),
            "module_slug": slug,
            "module_title": title,
            "difficulty": module.get("difficulty", "unknown"),
        }

        raw_chunks = self.chunker.split(full_text, base_id=f"curriculum_{slug}")
        for chunk in raw_chunks:
            chunk.metadata.update(base_metadata)

        return raw_chunks


# ---------------------------------------------------------------------------
# PDF Book Loader (text extraction)
# ---------------------------------------------------------------------------

class PDFBookLoader:
    """
    Extracts plain text from quantum computing PDF textbooks and research papers
    in the data/books/ directory, then splits into indexed chunks.

    Falls back gracefully if PyMuPDF (fitz) is not installed, logging a warning.
    """

    def __init__(self, chunker: Optional[RecursiveTextChunker] = None) -> None:
        self.chunker = chunker or RecursiveTextChunker(chunk_size=500, overlap=50)
        self._fitz_available = self._check_fitz()

    @staticmethod
    def _check_fitz() -> bool:
        try:
            import fitz  # noqa: F401  (PyMuPDF)
            return True
        except ImportError:
            logger.warning(
                "PyMuPDF (fitz) not installed. PDF ingestion disabled. "
                "Install with: pip install PyMuPDF"
            )
            return False

    def load_directory(self, books_dir: str | Path) -> list[TextChunk]:
        books_path = Path(books_dir)
        if not books_path.exists():
            logger.warning("Books directory not found: %s", books_path)
            return []

        if not self._fitz_available:
            logger.warning("Skipping PDF ingestion (PyMuPDF not available).")
            return []

        import fitz  # type: ignore

        all_chunks: list[TextChunk] = []
        pdf_files = list(books_path.glob("*.pdf"))
        logger.info("Found %d PDF files in %s", len(pdf_files), books_path)

        for pdf_path in pdf_files:
            try:
                doc = fitz.open(str(pdf_path))
                text_pages = [page.get_text("text") for page in doc]
                full_text = "\n".join(text_pages)
                doc.close()

                # Clean extracted text
                full_text = self._clean_pdf_text(full_text)

                stem = pdf_path.stem[:40]  # truncate long filenames
                chunks = self.chunker.split(full_text, base_id=f"book_{stem}")
                for chunk in chunks:
                    chunk.metadata.update({
                        "source": "textbook",
                        "filename": pdf_path.name,
                        "stem": stem,
                    })
                all_chunks.extend(chunks)
                logger.info(
                    "Indexed '%s': %d chunks", pdf_path.name, len(chunks)
                )
            except Exception as exc:
                logger.error("Failed to index '%s': %s", pdf_path.name, exc)

        return all_chunks

    @staticmethod
    def _clean_pdf_text(text: str) -> str:
        """Remove PDF artifacts: page numbers, headers, excessive whitespace."""
        # Remove standalone page numbers
        text = re.sub(r"^\s*\d+\s*$", "", text, flags=re.MULTILINE)
        # Collapse multiple blank lines
        text = re.sub(r"\n{3,}", "\n\n", text)
        # Remove hyphenation across lines
        text = re.sub(r"-\n(\w)", r"\1", text)
        return text.strip()


# ---------------------------------------------------------------------------
# Vector Store Wrapper (ChromaDB)
# ---------------------------------------------------------------------------

class QuantumVectorStore:
    """
    Lightweight ChromaDB wrapper with sentence-transformer embeddings.
    Collection name: 'quantum_knowledge'.

    All embeddings use 'all-MiniLM-L6-v2' running purely on CPU,
    producing 384-dimensional dense vectors.
    """

    COLLECTION_NAME = "quantum_knowledge"
    EMBEDDING_MODEL = "all-MiniLM-L6-v2"

    def __init__(self, persist_directory: str = "backend/data/vector_store") -> None:
        self.persist_directory = persist_directory
        self._client = None
        self._collection = None
        self._embedder = None

    def _lazy_init(self) -> None:
        """Lazy-initialize ChromaDB and sentence-transformers on first use."""
        if self._client is not None:
            return

        try:
            import chromadb  # type: ignore
            from sentence_transformers import SentenceTransformer  # type: ignore
        except ImportError as exc:
            raise ImportError(
                f"Missing dependency: {exc}. "
                "Install with: pip install chromadb sentence-transformers"
            ) from exc

        os.makedirs(self.persist_directory, exist_ok=True)
        self._client = chromadb.PersistentClient(path=self.persist_directory)
        self._collection = self._client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
        self._embedder = SentenceTransformer(self.EMBEDDING_MODEL)
        logger.info(
            "ChromaDB initialized at '%s' with model '%s'.",
            self.persist_directory,
            self.EMBEDDING_MODEL,
        )

    def add_chunks(self, chunks: list[TextChunk], batch_size: int = 64) -> int:
        """Embed and add chunks to the vector store. Returns count added."""
        if not chunks:
            return 0

        self._lazy_init()

        added = 0
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i : i + batch_size]
            texts = [c.text for c in batch]
            ids = [c.chunk_id for c in batch]
            metadatas = [c.metadata for c in batch]

            embeddings = self._embedder.encode(
                texts, show_progress_bar=False, normalize_embeddings=True
            ).tolist()

            self._collection.upsert(
                ids=ids,
                embeddings=embeddings,
                documents=texts,
                metadatas=metadatas,
            )
            added += len(batch)
            logger.debug("Upserted batch %d/%d (%d chunks)", i // batch_size + 1,
                         math.ceil(len(chunks) / batch_size), len(batch))

        logger.info("Added %d chunks to vector store.", added)
        return added

    def search(
        self,
        query: str,
        k: int = 5,
        source_filter: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        """
        Semantic similarity search.

        Args:
            query: Natural language query string.
            k: Number of top results to return.
            source_filter: If set, filters by metadata['source'] == source_filter.

        Returns:
            List of dicts with keys: text, metadata, distance, similarity.
        """
        self._lazy_init()

        where = {"source": source_filter} if source_filter else None

        query_embedding = self._embedder.encode(
            [query], normalize_embeddings=True
        ).tolist()

        results = self._collection.query(
            query_embeddings=query_embedding,
            n_results=k,
            where=where,
            include=["documents", "metadatas", "distances"],
        )

        output = []
        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]
        dists = results.get("distances", [[]])[0]

        for doc, meta, dist in zip(docs, metas, dists):
            output.append({
                "text": doc,
                "metadata": meta,
                "distance": dist,
                "similarity": 1.0 - dist,  # cosine: similarity = 1 - distance
            })

        return output

    def count(self) -> int:
        """Return total number of vectors in the store."""
        self._lazy_init()
        return self._collection.count()


# ---------------------------------------------------------------------------
# Main Indexer Facade (TSK-11 Entry Point)
# ---------------------------------------------------------------------------

import math


class QuantumKnowledgeIndexer:
    """
    Top-level facade for building and querying the quantum knowledge base.

    Called by:
    - Apurva's RAG pipeline (Hybrid RAG / TSK-09) for retrieval
    - Team setup scripts for initial ingestion

    Usage::

        indexer = QuantumKnowledgeIndexer()
        indexer.build_from_curriculum("backend/data/curriculum/modules.json")
        indexer.add_pdf_books("data/books/")

        results = indexer.search("Grover diffusion operator")
        for r in results:
            print(r["similarity"], r["text"][:200])
    """

    def __init__(
        self,
        persist_directory: str = "backend/data/vector_store",
        chunk_size: int = 500,
        overlap: int = 50,
    ) -> None:
        chunker = RecursiveTextChunker(chunk_size=chunk_size, overlap=overlap)
        self._curriculum_loader = CurriculumLoader(chunker=chunker)
        self._pdf_loader = PDFBookLoader(chunker=chunker)
        self._store = QuantumVectorStore(persist_directory=persist_directory)

    def build_from_curriculum(self, curriculum_path: str | Path) -> int:
        """Ingest curriculum JSON modules into the vector store."""
        logger.info("Building knowledge base from curriculum: %s", curriculum_path)
        chunks = self._curriculum_loader.load(curriculum_path)
        added = self._store.add_chunks(chunks)
        logger.info("Curriculum ingestion complete: %d chunks indexed.", added)
        return added

    def add_pdf_books(self, books_directory: str | Path) -> int:
        """Ingest PDF textbooks from the books directory."""
        logger.info("Ingesting PDF books from: %s", books_directory)
        chunks = self._pdf_loader.load_directory(books_directory)
        if not chunks:
            logger.warning("No chunks extracted from PDF books.")
            return 0
        added = self._store.add_chunks(chunks)
        logger.info("PDF ingestion complete: %d chunks indexed.", added)
        return added

    def search(
        self,
        query: str,
        k: int = 5,
        source_filter: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        """Semantic search over the full quantum knowledge base."""
        return self._store.search(query, k=k, source_filter=source_filter)

    def total_chunks(self) -> int:
        """Return total number of indexed chunks."""
        return self._store.count()
