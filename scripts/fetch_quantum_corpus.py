#!/usr/bin/env python3
"""
Quantum Corpus Ingestion & Downloader Script
AI-Powered Interactive Quantum Algorithm Learning Platform (SIH 2026)

This script manages the automated download, verification, and text extraction
of curated quantum computing textbooks and research papers into the local
knowledge store for ChromaDB vector embeddings.
"""

import os
import sys
import json
import urllib.request
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("QuantumCorpus")

CATALOG_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "books", "quantum_library_150.json")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "books")

def load_catalog():
    if not os.path.exists(CATALOG_PATH):
        logger.error(f"Catalog file not found: {CATALOG_PATH}")
        sys.exit(1)
    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def download_book(entry):
    pdf_url = entry.get("pdf_url")
    if not pdf_url or not pdf_url.endswith(".pdf"):
        logger.info(f"Skipping {entry['title']} (no direct open-access PDF link or proprietary reference)")
        return False
    
    filename = entry.get("local_path", "").split("/")[-1]
    if not filename:
        safe_title = "".join(c if c.isalnum() else "_" for c in entry["title"])[:50]
        filename = f"{safe_title}.pdf"
    
    target_path = os.path.join(OUTPUT_DIR, filename)
    if os.path.exists(target_path):
        logger.info(f"[EXISTS] {filename} ({os.path.getsize(target_path) // 1024} KB)")
        return True

    logger.info(f"[DOWNLOADING] {entry['title']} from {pdf_url}...")
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    req = urllib.request.Request(pdf_url, headers=headers)
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response, open(target_path, "wb") as out_file:
            out_file.write(response.read())
        logger.info(f"[DOWNLOAD COMPLETE] Saved to {target_path}")
        return True
    except Exception as e:
        logger.warning(f"[FAILED] Could not download {entry['title']}: {e}")
        return False

def main():
    logger.info("Initializing Quantum Corpus Pipeline...")
    catalog = load_catalog()
    total = len(catalog.get("library", []))
    logger.info(f"Loaded {total} core entries from library catalog.")
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    success_count = 0
    for entry in catalog.get("library", []):
        if download_book(entry):
            success_count += 1
            
    logger.info(f"Corpus sync finished. Total available: {success_count}/{total}")

if __name__ == "__main__":
    main()
