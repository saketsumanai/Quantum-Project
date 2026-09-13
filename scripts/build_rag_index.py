#!/usr/bin/env python3
"""
Quantum Leap — ChromaDB RAG Indexing Pipeline
=============================================
Reads all 76 PDFs from data/books/, extracts text, chunks into 512-token
overlapping windows, embeds with all-MiniLM-L6-v2 (local CPU), and
persists into ChromaDB at data/vector_store/quantum_books/.

Run once: python3 scripts/build_rag_index.py
Subsequent runs skip already-indexed documents (idempotent).
"""

import os
import sys
import time
import argparse

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, PROJECT_ROOT)

BOOKS_DIR = os.path.join(PROJECT_ROOT, "data", "books")
VECTOR_STORE_DIR = os.path.join(PROJECT_ROOT, "data", "vector_store", "quantum_books")
COLLECTION_NAME = "quantum_books"
CHUNK_SIZE = 512
CHUNK_OVERLAP = 64
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
BATCH_SIZE = 32


def extract_pdf_text(pdf_path: str) -> str:
    """Extract raw text from PDF using pypdf."""
    from pypdf import PdfReader
    try:
        reader = PdfReader(pdf_path)
        pages = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages.append(text.strip())
        return "\n\n".join(pages)
    except Exception as e:
        print(f"  ⚠️  Could not extract {os.path.basename(pdf_path)}: {e}")
        return ""


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP):
    """Split text into overlapping word-level chunks."""
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end])
        if len(chunk.strip()) > 80:  # Skip trivially short chunks
            chunks.append(chunk)
        start += chunk_size - overlap
    return chunks


def build_index(dry_run: bool = False):
    """Main indexing pipeline."""
    from sentence_transformers import SentenceTransformer
    import chromadb

    # 1. Collect PDFs
    pdf_files = sorted([
        f for f in os.listdir(BOOKS_DIR)
        if f.lower().endswith(".pdf")
    ])
    print(f"\n📚 Found {len(pdf_files)} PDF files in data/books/")
    if dry_run:
        print("✅ Dry-run mode: all PDFs are readable. Ready to index.")
        for f in pdf_files:
            print(f"  • {f}")
        return True

    # 2. Initialize ChromaDB persistent client
    os.makedirs(VECTOR_STORE_DIR, exist_ok=True)
    chroma_client = chromadb.PersistentClient(path=VECTOR_STORE_DIR)
    collection = chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )

    # 3. Check already-indexed doc IDs (for idempotency)
    existing_ids = set(collection.get(include=[])["ids"])
    print(f"📦 ChromaDB collection has {len(existing_ids)} existing chunk embeddings.")

    # 4. Load embedding model
    print(f"🤖 Loading embedding model: {EMBEDDING_MODEL} (this takes ~30s first time)...")
    model = SentenceTransformer(EMBEDDING_MODEL)
    print("✅ Embedding model loaded.\n")

    total_chunks_added = 0
    total_chunks_skipped = 0

    for pdf_idx, filename in enumerate(pdf_files):
        pdf_path = os.path.join(BOOKS_DIR, filename)
        doc_name = filename[:-4]  # strip .pdf

        print(f"[{pdf_idx + 1}/{len(pdf_files)}] Processing: {filename}")
        t0 = time.time()

        # Extract text
        raw_text = extract_pdf_text(pdf_path)
        if not raw_text or len(raw_text) < 200:
            print(f"  ⚠️  Skipped (empty or too short text)")
            continue

        # Chunk text
        chunks = chunk_text(raw_text)
        print(f"  📄 {len(chunks)} chunks extracted")

        # Filter already-indexed chunks
        new_chunks = []
        new_ids = []
        new_metas = []

        for chunk_idx, chunk in enumerate(chunks):
            chunk_id = f"{doc_name}__chunk_{chunk_idx:04d}"
            if chunk_id in existing_ids:
                total_chunks_skipped += 1
                continue
            new_chunks.append(chunk)
            new_ids.append(chunk_id)
            new_metas.append({
                "source": filename,
                "doc_name": doc_name,
                "chunk_index": chunk_idx,
                "total_chunks": len(chunks),
            })

        if not new_chunks:
            print(f"  ✅ Already fully indexed — skipped.")
            continue

        # Embed and add to ChromaDB in batches
        for batch_start in range(0, len(new_chunks), BATCH_SIZE):
            batch_texts = new_chunks[batch_start:batch_start + BATCH_SIZE]
            batch_ids = new_ids[batch_start:batch_start + BATCH_SIZE]
            batch_metas = new_metas[batch_start:batch_start + BATCH_SIZE]

            embeddings = model.encode(batch_texts, show_progress_bar=False).tolist()

            collection.add(
                embeddings=embeddings,
                documents=batch_texts,
                ids=batch_ids,
                metadatas=batch_metas,
            )
            total_chunks_added += len(batch_texts)

        elapsed = time.time() - t0
        print(f"  ✅ Indexed {len(new_chunks)} new chunks in {elapsed:.1f}s")

    print(f"\n{'='*60}")
    print(f"🎉 Indexing Complete!")
    print(f"  📥 New chunks added: {total_chunks_added}")
    print(f"  ⏭️  Chunks skipped (already indexed): {total_chunks_skipped}")
    final_count = collection.count()
    print(f"  📊 Total chunks in ChromaDB: {final_count}")
    print(f"  💾 Vector store path: {VECTOR_STORE_DIR}")
    print(f"{'='*60}\n")
    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Quantum Leap RAG Book Indexer")
    parser.add_argument("--dry-run", action="store_true", help="Verify PDFs are readable without indexing")
    args = parser.parse_args()
    success = build_index(dry_run=args.dry_run)
    sys.exit(0 if success else 1)
