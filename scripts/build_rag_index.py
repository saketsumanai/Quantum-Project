#!/usr/bin/env python3
"""
Quantum Leap — ChromaDB RAG Production Indexing Pipeline
=========================================================
Architectural Specification:
1. Model Context Alignment:
   - SentenceTransformer('all-MiniLM-L6-v2') max sequence length = 256 tokens.
   - Chunks are sized at 150 target words (~230-250 tokens with quantum physics notation)
     to guarantee 100% of chunk content is embedded without truncation.
   - Overlap: 25 words (~17%) for continuous semantic context.

2. Hierarchical Recursive Chunking:
   - Paragraph boundary priority (\\n\\n) -> Sentence boundary priority (. ? !) -> Word fallback.
   - Preserves mathematical equations (Dirac notation, Pauli operators, stabilizers) intact.

3. Page-Aware Extraction & Metadata Enrichment:
   - Tracks 1-indexed page_number for every chunk.
   - Correlates with data/books/quantum_library_150.json for author, title, category, and URL.

4. Multi-Source Knowledge Unification:
   - 76 PDF textbooks and seminal papers from data/books/
   - 8 Structured Curriculum Tracks from backend/data/curriculum/modules.json
   - 150 Foundational Source Summaries from data/books/quantum_library_150.json

5. Unified Target:
   - Path: data/vector_store/quantum_books/
   - Collection: quantum_books
   - Metric: Cosine similarity
"""

import os
import sys
import re
import time
import json
import argparse
import unicodedata
from pathlib import Path
from typing import List, Dict, Any, Optional

# Enforce PyTorch backend for sentence-transformers to avoid Keras 3 / TensorFlow conflicts
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, PROJECT_ROOT)

BOOKS_DIR = os.path.join(PROJECT_ROOT, "data", "books")
CATALOG_PATH = os.path.join(BOOKS_DIR, "quantum_library_150.json")
CURRICULUM_PATH = os.path.join(PROJECT_ROOT, "backend", "data", "curriculum", "modules.json")
VECTOR_STORE_DIR = os.path.join(PROJECT_ROOT, "data", "vector_store", "quantum_books")
COLLECTION_NAME = "quantum_books"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

TARGET_CHUNK_WORDS = 150
OVERLAP_WORDS = 25
MIN_CHUNK_WORDS = 30
BATCH_SIZE = 64


# ---------------------------------------------------------------------------
# Text Cleaning & Normalization
# ---------------------------------------------------------------------------

def clean_extracted_text(text: str) -> str:
    """Normalize unicode, strip noise headers/footers, and repair hyphenation."""
    if not text:
        return ""
    # NFKC Unicode normalization for mathematical symbols and ligatures
    text = unicodedata.normalize("NFKC", text)
    # Remove standalone page numbers on single lines
    text = re.sub(r"^\s*\d+\s*$", "", text, flags=re.MULTILINE)
    # Repair hyphenated words split across lines: e.g. "super-\nposition" -> "superposition"
    text = re.sub(r"(\b[a-zA-Z]+)-\s*\n\s*([a-zA-Z]+\b)", r"\1\2", text)
    # Strip arXiv watermark headers
    text = re.sub(r"arXiv:\S+", "", text)
    # Replace non-breaking spaces with standard space
    text = text.replace("\xa0", " ")
    # Normalize horizontal whitespace
    text = re.sub(r"[ \t]+", " ", text)
    # Collapse 3+ newlines into double newlines (paragraphs)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


# ---------------------------------------------------------------------------
# Hierarchical Recursive Chunker (256-Token Safe)
# ---------------------------------------------------------------------------

def hierarchical_chunk_text(
    text: str,
    target_words: int = TARGET_CHUNK_WORDS,
    overlap_words: int = OVERLAP_WORDS,
    min_chunk_words: int = MIN_CHUNK_WORDS,
) -> List[str]:
    """
    Split text hierarchically to preserve semantic structure and fit within
    the 256-token embedding context window.
    Order of precedence: Paragraphs (\\n\\n) -> Sentences (. ? !) -> Word windows.
    """
    if not text or not text.strip():
        return []

    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    semantic_units: List[str] = []

    for paragraph in paragraphs:
        p_words = paragraph.split()
        if len(p_words) <= target_words:
            semantic_units.append(paragraph)
        else:
            # Paragraph exceeds target size; split along sentence boundaries
            sentences = re.split(r"(?<=[.!?])\s+", paragraph)
            curr_sent_block: List[str] = []
            curr_count = 0
            for s in sentences:
                s_words = s.split()
                if not s_words:
                    continue
                if curr_count + len(s_words) > target_words and curr_sent_block:
                    semantic_units.append(" ".join(curr_sent_block))
                    curr_sent_block = [s]
                    curr_count = len(s_words)
                else:
                    curr_sent_block.append(s)
                    curr_count += len(s_words)
            if curr_sent_block:
                semantic_units.append(" ".join(curr_sent_block))

    # Assemble units into overlapping chunks of target_words
    chunks: List[str] = []
    current_chunk_words: List[str] = []

    for unit in semantic_units:
        u_words = unit.split()
        if not u_words:
            continue

        # If a single sentence or equation block still exceeds target_words, window by words
        if len(u_words) > target_words:
            start = 0
            while start < len(u_words):
                end = min(start + target_words, len(u_words))
                sub_chunk = " ".join(u_words[start:end])
                if len(sub_chunk.split()) >= min_chunk_words:
                    chunks.append(sub_chunk)
                start += target_words - overlap_words
            continue

        if len(current_chunk_words) + len(u_words) <= target_words:
            current_chunk_words.extend(u_words)
        else:
            if len(current_chunk_words) >= min_chunk_words:
                chunks.append(" ".join(current_chunk_words))
            overlap_prefix = (
                current_chunk_words[-overlap_words:]
                if len(current_chunk_words) > overlap_words
                else current_chunk_words
            )
            current_chunk_words = overlap_prefix + u_words

    if len(current_chunk_words) >= min_chunk_words:
        chunks.append(" ".join(current_chunk_words))

    return chunks


# ---------------------------------------------------------------------------
# Metadata Catalog & Lookup
# ---------------------------------------------------------------------------

def load_catalog_map() -> Dict[str, Dict[str, Any]]:
    """Load data/books/quantum_library_150.json into a searchable map."""
    catalog_map = {}
    if not os.path.exists(CATALOG_PATH):
        return catalog_map

    try:
        with open(CATALOG_PATH, encoding="utf-8") as f:
            data = json.load(f)
            library = data.get("library", [])
            for item in library:
                # Key by title tokens
                title = item.get("title", "")
                author = item.get("author", "")
                slug = re.sub(r"[^a-zA-Z0-9]+", "_", title.lower()).strip("_")
                catalog_map[slug] = item
                # Also store by raw item ID
                catalog_map[f"id_{item.get('id')}"] = item
    except Exception as e:
        print(f"[Warning] Could not load catalog map: {e}")
    return catalog_map


def match_pdf_metadata(filename: str, catalog_map: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    """Find matching metadata for a PDF file from the 150-book catalog."""
    stem = Path(filename).stem.lower()
    clean_stem = re.sub(r"[^a-zA-Z0-9]+", " ", stem).strip()

    best_match = None
    best_score = 0

    for item in catalog_map.values():
        if not isinstance(item, dict) or "title" not in item:
            continue
        title = item.get("title", "").lower()
        author = item.get("author", "").lower()

        # Check token overlaps
        title_words = set(re.findall(r"\w+", title))
        stem_words = set(re.findall(r"\w+", clean_stem))
        overlap = len(title_words.intersection(stem_words))

        if author:
            author_surnames = [part for part in re.findall(r"\b[a-z]{4,}\b", author)]
            for surname in author_surnames:
                if surname in stem_words:
                    overlap += 2

        if overlap > best_score:
            best_score = overlap
            best_match = item

    if best_match and best_score >= 2:
        return {
            "title": best_match.get("title", Path(filename).stem),
            "author": best_match.get("author", "Quantum Literature"),
            "category": best_match.get("category", "Quantum Computing"),
            "year": best_match.get("year", 2024),
            "url": best_match.get("url", ""),
        }

    # Fallback to parsed stem
    title_fallback = Path(filename).stem.replace("_", " ")
    return {
        "title": title_fallback,
        "author": "Quantum Research",
        "category": "Quantum Foundations & Algorithms",
        "year": 2024,
        "url": "",
    }


# ---------------------------------------------------------------------------
# Corpus Extraction: PDFs, Curriculum, and Catalog
# ---------------------------------------------------------------------------

def extract_pdf_chunks_page_aware(
    pdf_path: str,
    meta_info: Dict[str, Any],
    max_pages: Optional[int] = None,
) -> List[Dict[str, Any]]:
    """Extract page-by-page chunks with page numbers and enriched metadata."""
    import pypdf

    filename = os.path.basename(pdf_path)
    doc_name = Path(pdf_path).stem
    results = []

    try:
        reader = pypdf.PdfReader(pdf_path)
        num_pages = len(reader.pages)
        limit = min(num_pages, max_pages) if max_pages else num_pages

        chunk_counter = 0
        for page_idx in range(limit):
            page_num = page_idx + 1
            try:
                page_text = reader.pages[page_idx].extract_text()
            except Exception:
                continue

            cleaned = clean_extracted_text(page_text)
            if not cleaned or len(cleaned.split()) < MIN_CHUNK_WORDS:
                continue

            page_chunks = hierarchical_chunk_text(cleaned)
            for pc in page_chunks:
                chunk_id = f"pdf__{doc_name}__p{page_num:03d}__c{chunk_counter:04d}"
                results.append({
                    "id": chunk_id,
                    "text": pc,
                    "metadata": {
                        "source": filename,
                        "doc_name": doc_name,
                        "title": meta_info.get("title", doc_name),
                        "author": meta_info.get("author", "Quantum Research"),
                        "category": meta_info.get("category", "General Quantum Computing"),
                        "page_number": page_num,
                        "total_pages": num_pages,
                        "chunk_index": chunk_counter,
                        "chunk_type": "textbook",
                    },
                })
                chunk_counter += 1

    except Exception as exc:
        print(f"  [Error] Could not process {filename}: {exc}")

    return results


def extract_curriculum_chunks() -> List[Dict[str, Any]]:
    """Extract structured curriculum modules from backend/data/curriculum/modules.json."""
    if not os.path.exists(CURRICULUM_PATH):
        return []

    results = []
    try:
        with open(CURRICULUM_PATH, encoding="utf-8") as f:
            data = json.load(f)

        modules = data.get("modules", [])
        for m in modules:
            mod_id = m.get("id", "")
            title = m.get("title", "")
            slug = m.get("slug", "")
            desc = m.get("description", "")
            difficulty = m.get("difficulty", "intermediate")
            objectives = m.get("learning_objectives", [])
            math_content = m.get("mathematical_content", {})
            concepts = m.get("key_concepts", [])

            # Compose unified structured document
            lines = [
                f"Curriculum Module: {title} ({mod_id})",
                f"Difficulty Level: {difficulty}",
                f"Overview: {desc}",
            ]
            if objectives:
                lines.append("Learning Objectives: " + " | ".join(objectives))
            if concepts:
                lines.append("Key Concepts: " + ", ".join(concepts))

            for key, val in math_content.items():
                k_label = key.replace("_", " ").title()
                if isinstance(val, str):
                    lines.append(f"{k_label} Formula: {val}")
                elif isinstance(val, dict):
                    for sub_k, sub_v in val.items():
                        lines.append(f"{k_label} - {sub_k}: {sub_v}")

            full_text = "\n\n".join(lines)
            chunks = hierarchical_chunk_text(full_text, target_words=140, overlap_words=20)

            for idx, c_text in enumerate(chunks):
                chunk_id = f"curriculum__{slug}__c{idx:03d}"
                results.append({
                    "id": chunk_id,
                    "text": c_text,
                    "metadata": {
                        "source": "curriculum_modules.json",
                        "doc_name": slug,
                        "title": title,
                        "author": "Quantum Leap Curriculum Engine",
                        "category": "Interactive Curriculum",
                        "page_number": 1,
                        "difficulty": difficulty,
                        "chunk_index": idx,
                        "chunk_type": "curriculum",
                    },
                })
    except Exception as e:
        print(f"[Warning] Failed to extract curriculum chunks: {e}")

    return results


def extract_catalog_chunks() -> List[Dict[str, Any]]:
    """Extract reference summary chunks from data/books/quantum_library_150.json."""
    if not os.path.exists(CATALOG_PATH):
        return []

    results = []
    try:
        with open(CATALOG_PATH, encoding="utf-8") as f:
            data = json.load(f)

        library = data.get("library", [])
        for item in library:
            item_id = item.get("id", 0)
            title = item.get("title", "")
            author = item.get("author", "")
            cat = item.get("category", "")
            year = item.get("year", "")
            summary = item.get("training_vector_summary", "")
            concepts = ", ".join(item.get("key_concepts", []))

            text_content = (
                f"Quantum Reference Source: {title}\n"
                f"Author: {author} ({year})\n"
                f"Field: {cat}\n"
                f"Key Theoretical Concepts: {concepts}\n"
                f"Summary: {summary}"
            )

            chunk_id = f"catalog__{item_id:03d}"
            results.append({
                "id": chunk_id,
                "text": text_content,
                "metadata": {
                    "source": "quantum_library_150.json",
                    "doc_name": f"source_{item_id:03d}",
                    "title": title,
                    "author": author,
                    "category": cat,
                    "page_number": 1,
                    "chunk_index": 0,
                    "chunk_type": "catalog",
                },
            })
    except Exception as e:
        print(f"[Warning] Failed to extract catalog chunks: {e}")

    return results


# ---------------------------------------------------------------------------
# ChromaDB Indexing Engine
# ---------------------------------------------------------------------------

def build_index(
    max_books: Optional[int] = None,
    max_pages_per_book: Optional[int] = None,
    force_rebuild: bool = False,
    skip_pdfs: bool = False,
) -> bool:
    """Main indexing pipeline."""
    import chromadb
    from sentence_transformers import SentenceTransformer

    print("\n" + "=" * 64)
    print("Quantum Leap - Production RAG Knowledge Base Indexer")
    print("=" * 64)

    os.makedirs(VECTOR_STORE_DIR, exist_ok=True)
    chroma_client = chromadb.PersistentClient(path=VECTOR_STORE_DIR)

    if force_rebuild:
        try:
            chroma_client.delete_collection(COLLECTION_NAME)
            print(f"[*] Cleared existing ChromaDB collection: {COLLECTION_NAME}")
        except Exception:
            pass

    collection = chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )

    existing_ids = set(collection.get(include=[])["ids"])
    print(f"[*] ChromaDB collection '{COLLECTION_NAME}' currently holds {len(existing_ids)} chunks.")

    print(f"[*] Loading embedding model: {EMBEDDING_MODEL} (max_seq_length=256)...")
    t_model_0 = time.time()
    model = SentenceTransformer(EMBEDDING_MODEL)
    print(f"[+] Model loaded in {time.time() - t_model_0:.2f}s.")

    all_candidate_chunks: List[Dict[str, Any]] = []

    # 1. Ingest Curriculum Modules
    print("\n[*] Processing Curriculum Modules...")
    curriculum_chunks = extract_curriculum_chunks()
    all_candidate_chunks.extend(curriculum_chunks)
    print(f"[+] Generated {len(curriculum_chunks)} curriculum chunks.")

    # 2. Ingest 150-Source Catalog
    print("[*] Processing 150-Source Reference Catalog...")
    catalog_chunks = extract_catalog_chunks()
    all_candidate_chunks.extend(catalog_chunks)
    print(f"[+] Generated {len(catalog_chunks)} catalog summary chunks.")

    # 3. Ingest PDF Textbooks
    if not skip_pdfs and os.path.exists(BOOKS_DIR):
        catalog_map = load_catalog_map()
        pdf_files = sorted([f for f in os.listdir(BOOKS_DIR) if f.lower().endswith(".pdf")])
        if max_books:
            pdf_files = pdf_files[:max_books]

        print(f"\n[*] Processing {len(pdf_files)} PDF manuscripts from {BOOKS_DIR}...")
        for idx, pdf_name in enumerate(pdf_files):
            pdf_path = os.path.join(BOOKS_DIR, pdf_name)
            meta = match_pdf_metadata(pdf_name, catalog_map)
            t_extract = time.time()
            pdf_chunks = extract_pdf_chunks_page_aware(
                pdf_path,
                meta_info=meta,
                max_pages=max_pages_per_book,
            )
            all_candidate_chunks.extend(pdf_chunks)
            print(
                f"  [{idx + 1:02d}/{len(pdf_files):02d}] {pdf_name[:45]:<45} "
                f"-> {len(pdf_chunks):3d} chunks ({time.time() - t_extract:.1f}s)"
            )

    # 4. Filter already-indexed chunks
    new_chunks = [c for c in all_candidate_chunks if c["id"] not in existing_ids]
    skipped_count = len(all_candidate_chunks) - len(new_chunks)

    print(f"\n[*] Chunk Aggregation Complete:")
    print(f"    Total candidate chunks: {len(all_candidate_chunks)}")
    print(f"    Already indexed (skip): {skipped_count}")
    print(f"    New chunks to embed   : {len(new_chunks)}")

    if not new_chunks:
        print("[+] Vector store is completely up to date. No new embeddings needed.")
        print("=" * 64 + "\n")
        return True

    # 5. Batch Embed and Upsert
    print(f"\n[*] Embedding and inserting in batches of {BATCH_SIZE}...")
    total_added = 0
    t_embed_start = time.time()

    for i in range(0, len(new_chunks), BATCH_SIZE):
        batch = new_chunks[i:i + BATCH_SIZE]
        texts = [c["text"] for c in batch]
        ids = [c["id"] for c in batch]
        metadatas = [c["metadata"] for c in batch]

        embeddings = model.encode(
            texts,
            show_progress_bar=False,
            normalize_embeddings=True,
        ).tolist()

        collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
        )
        total_added += len(batch)
        print(f"  Processed batch {i // BATCH_SIZE + 1}/{(len(new_chunks) + BATCH_SIZE - 1) // BATCH_SIZE} ({total_added}/{len(new_chunks)} chunks)")

    t_total = time.time() - t_embed_start
    final_count = collection.count()

    print("\n" + "=" * 64)
    print("Indexing Complete Successfully:")
    print(f"  New Chunks Inserted : {total_added}")
    print(f"  Total Vectors in DB : {final_count}")
    print(f"  Time Elapsed        : {t_total:.1f}s")
    print(f"  Storage Location    : {VECTOR_STORE_DIR}")
    print("=" * 64 + "\n")
    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Quantum Leap RAG Indexer")
    parser.add_argument("--force-rebuild", action="store_true", help="Clear and re-index from scratch")
    parser.add_argument("--max-books", type=int, default=None, help="Limit number of PDF books to index")
    parser.add_argument("--pages-per-book", type=int, default=None, help="Limit pages per book (for fast testing)")
    parser.add_argument("--skip-pdfs", action="store_true", help="Index only curriculum and catalog")
    args = parser.parse_args()

    success = build_index(
        max_books=args.max_books,
        max_pages_per_book=args.pages_per_book,
        force_rebuild=args.force_rebuild,
        skip_pdfs=args.skip_pdfs,
    )
    sys.exit(0 if success else 1)
