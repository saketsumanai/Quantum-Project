#!/usr/bin/env python3
"""
Quantum Leap — Live Web Scraper for Course Content
===================================================
Scrapes the best quantum computing educational resources:
1. IBM Quantum Learning (https://learning.quantum.ibm.com/)
2. Qiskit Textbook (GitHub notebooks)
3. PennyLane tutorials
4. Quantum Computing Stack Exchange (top 200 questions)
5. Microsoft Quantum Katas
6. Quantum Open Source Foundation resources

Outputs: data/scraped_course_content.jsonl (for RAG indexing)
         frontend/src/data/scrapedCourseModules.json (for frontend display)
"""
import urllib.request, urllib.error, ssl, json, re, time, os, sys
from pathlib import Path

BASE = Path(__file__).parent.parent
DATA = BASE / "data"
FRONTEND_DATA = BASE / "frontend/src/data"
FRONTEND_DATA.mkdir(exist_ok=True)

ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; QuantumLeapBot/2.0)"}

def fetch(url, timeout=15):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        res = urllib.request.urlopen(req, timeout=timeout, context=ssl_ctx)
        return res.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"  [SKIP] {url}: {e}")
        return None

def clean_html(html):
    """Strip HTML tags and clean whitespace."""
    text = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'&nbsp;', ' ', text)
    text = re.sub(r'&lt;', '<', text)
    text = re.sub(r'&gt;', '>', text)
    text = re.sub(r'&amp;', '&', text)
    text = re.sub(r'&quot;', '"', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

records = []
course_modules = []

# ─── 1. StackExchange Quantum Computing (Top 200 Questions via API) ────────────
print("[1] Scraping StackExchange Quantum Computing (top questions)...")
SE_BASE = "https://api.stackexchange.com/2.3"
se_count = 0

for page in range(1, 6):  # 5 pages × 50 = 250 questions
    url = f"{SE_BASE}/questions?page={page}&pagesize=50&order=desc&sort=votes&site=quantumcomputing&filter=withbody"
    data = fetch(url)
    if not data:
        break
    try:
        obj = json.loads(data)
        items = obj.get("items", [])
        for item in items:
            title = item.get("title", "")
            body = clean_html(item.get("body", ""))[:1500]
            tags = item.get("tags", [])
            score = item.get("score", 0)
            link = item.get("link", "")
            if len(body) < 50 or score < 5:
                continue
            records.append({
                "instruction": title,
                "response": f"{body}",
                "source": "quantumcomputing.stackexchange.com",
                "type": "community_qa",
                "url": link,
                "score": score,
                "tags": tags,
            })
            se_count += 1
    except Exception as e:
        print(f"  SE page {page}: {e}")
    time.sleep(1.5)  # SE API rate limit

# Also scrape answers for top questions
print(f"  → {se_count} questions. Now fetching top answers...")
ans_count = 0

for page in range(1, 4):
    url = f"{SE_BASE}/answers?page={page}&pagesize=50&order=desc&sort=votes&site=quantumcomputing&filter=withbody"
    data = fetch(url)
    if not data:
        break
    try:
        obj = json.loads(data)
        items = obj.get("items", [])
        for item in items:
            body = clean_html(item.get("body", ""))[:2000]
            score = item.get("score", 0)
            link = item.get("link", "")
            if len(body) < 100 or score < 10:
                continue
            records.append({
                "instruction": f"Expert quantum computing answer (score={score}): What is the explanation for this concept?",
                "response": body,
                "source": "quantumcomputing.stackexchange.com/answers",
                "type": "expert_answer",
                "url": link,
                "score": score,
            })
            ans_count += 1
    except Exception as e:
        print(f"  SE answers page {page}: {e}")
    time.sleep(1.5)

print(f"  → {se_count} questions + {ans_count} expert answers from StackExchange")

# ─── 2. Qiskit GitHub Textbook Notebooks (all chapters) ────────────────────────
print("\n[2] Scraping Qiskit textbook notebooks from GitHub...")

QISKIT_CHAPTERS = [
    ("Quantum States and Qubits", "https://raw.githubusercontent.com/Qiskit/qiskit-textbook/main/notebooks/quantum-states-and-qubits.ipynb"),
    ("Single Qubit Gates", "https://raw.githubusercontent.com/Qiskit/qiskit-textbook/main/notebooks/single-qubit-gates.ipynb"),
    ("Multi-Qubit Gates", "https://raw.githubusercontent.com/Qiskit/qiskit-textbook/main/notebooks/multi-qubit-gates.ipynb"),
    ("Grover's Algorithm", "https://raw.githubusercontent.com/Qiskit/qiskit-textbook/main/notebooks/ch-algorithms/grover.ipynb"),
    ("Quantum Fourier Transform", "https://raw.githubusercontent.com/Qiskit/qiskit-textbook/main/notebooks/ch-algorithms/quantum-fourier-transform.ipynb"),
    ("Quantum Phase Estimation", "https://raw.githubusercontent.com/Qiskit/qiskit-textbook/main/notebooks/ch-algorithms/quantum-phase-estimation.ipynb"),
    ("Shor's Algorithm", "https://raw.githubusercontent.com/Qiskit/qiskit-textbook/main/notebooks/ch-algorithms/shor.ipynb"),
    ("Superdense Coding", "https://raw.githubusercontent.com/Qiskit/qiskit-textbook/main/notebooks/ch-algorithms/superdense-coding.ipynb"),
    ("Quantum Teleportation", "https://raw.githubusercontent.com/Qiskit/qiskit-textbook/main/notebooks/ch-algorithms/teleportation.ipynb"),
    ("Bernstein-Vazirani Algorithm", "https://raw.githubusercontent.com/Qiskit/qiskit-textbook/main/notebooks/ch-algorithms/bernstein-vazirani.ipynb"),
    ("Simon's Algorithm", "https://raw.githubusercontent.com/Qiskit/qiskit-textbook/main/notebooks/ch-algorithms/simon.ipynb"),
    ("Deutsch-Jozsa Algorithm", "https://raw.githubusercontent.com/Qiskit/qiskit-textbook/main/notebooks/ch-algorithms/deutsch-jozsa.ipynb"),
    ("Variational Algorithms", "https://raw.githubusercontent.com/Qiskit/qiskit-textbook/main/notebooks/ch-applications/vqe-molecules.ipynb"),
    ("Quantum Error Correction", "https://raw.githubusercontent.com/Qiskit/qiskit-textbook/main/notebooks/ch-quantum-hardware/error-correction-repetition-code.ipynb"),
    ("Bloch Sphere", "https://raw.githubusercontent.com/Qiskit/qiskit-textbook/main/notebooks/ch-states/bloch-sphere.ipynb"),
]

qiskit_modules = []
for title, url in QISKIT_CHAPTERS:
    text = fetch(url)
    if not text:
        continue
    try:
        nb = json.loads(text)
        cells = nb.get("cells", [])
        
        md_sections = []
        code_sections = []
        for cell in cells:
            ct = cell.get("cell_type", "")
            src = "".join(cell.get("source", []))
            if ct == "markdown" and len(src) > 50:
                md_sections.append(src)
            elif ct == "code" and len(src) > 30 and any(kw in src for kw in ["QuantumCircuit", "qiskit", "pennylane", "cirq"]):
                code_sections.append(src)
        
        if md_sections:
            full_explanation = "\n\n".join(md_sections[:8])
            records.append({
                "instruction": f"Explain the quantum computing concept: {title}",
                "response": full_explanation[:3000],
                "source": "qiskit_textbook",
                "type": "textbook_chapter",
                "title": title,
            })
            
            clean_id = "qiskit_" + title.lower().replace(" ", "_").replace("'", "")
            qiskit_modules.append({
                "id": clean_id,
                "title": title,
                "source": "Qiskit Textbook",
                "description": md_sections[0][:300] if md_sections else "",
                "has_code": len(code_sections) > 0,
                "code_example": code_sections[0][:800] if code_sections else "",
                "content": full_explanation[:5000],
            })
        
        # Add code-specific Q&A
        for i, code in enumerate(code_sections[:3]):
            if len(code) > 100:
                records.append({
                    "instruction": f"Show me a working Qiskit code example for: {title} (example {i+1})",
                    "response": f"```python\n{code}\n```",
                    "source": "qiskit_textbook_code",
                    "type": "code_example",
                    "title": title,
                })
        
        print(f"  ✓ {title}: {len(md_sections)} sections, {len(code_sections)} code cells")
        time.sleep(0.5)
    except Exception as e:
        print(f"  ! {title}: {e}")

# ─── 3. PennyLane Demos (REST API available) ────────────────────────────────────
print("\n[3] Scraping PennyLane tutorials...")

pennylane_demos = [
    ("Variational Quantum Eigensolver (VQE)", "https://pennylane.ai/qml/demos/tutorial_vqe/"),
    ("QAOA", "https://pennylane.ai/qml/demos/tutorial_qaoa_intro/"),
    ("Grover's Algorithm with PennyLane", "https://pennylane.ai/qml/demos/tutorial_grovers_algorithm/"),
    ("Quantum Gradients", "https://pennylane.ai/qml/demos/tutorial_backprop/"),
    ("Qubit Rotation", "https://pennylane.ai/qml/demos/tutorial_qubit_rotation/"),
    ("Quantum Machine Learning", "https://pennylane.ai/qml/demos/tutorial_quanvolution/"),
    ("Quantum Natural Gradient", "https://pennylane.ai/qml/demos/tutorial_quantum_natural_gradient/"),
    ("Variational Classifier", "https://pennylane.ai/qml/demos/tutorial_variational_classifier/"),
]

pl_count = 0
for title, url in pennylane_demos:
    html = fetch(url)
    if not html:
        continue
    # Extract main content div
    text = clean_html(html)
    # Find the main content (after navigation)
    matches = re.findall(r'(?:In this demo|This tutorial|we show|we demonstrate|we will|we introduce)[^.]{50,500}', text, re.IGNORECASE)
    
    if len(text) > 500:
        # Take main content block
        content = text[500:5500]
        records.append({
            "instruction": f"Explain this quantum computing tutorial: {title} using PennyLane",
            "response": content[:2500],
            "source": "pennylane.ai",
            "type": "tutorial",
            "title": title,
        })
        pl_count += 1
    time.sleep(1)

print(f"  → {pl_count} PennyLane tutorials scraped")

# ─── 4. arXiv Quantum Papers (Extended) ─────────────────────────────────────────
print("\n[4] Fetching arXiv quantum computing papers...")

arxiv_queries = [
    ("quantum algorithm survey", 15),
    ("Grover search algorithm", 10),
    ("variational quantum eigensolver review", 10),
    ("quantum error correction surface code", 10),
    ("quantum machine learning", 10),
    ("NISQ algorithms applications", 10),
    ("quantum entanglement experiments", 8),
    ("quantum advantage supremacy", 8),
    ("quantum key distribution", 8),
    ("topological quantum computing", 8),
]

arxiv_count = 0
for query, max_results in arxiv_queries:
    q = query.replace(' ', '+')
    url = f"https://export.arxiv.org/api/query?search_query=cat:quant-ph+AND+({q})&max_results={max_results}&sortBy=relevance"
    data = fetch(url)
    if not data:
        continue
    entries = re.findall(r'<entry>(.*?)</entry>', data, re.DOTALL)
    for e in entries:
        tm = re.search(r'<title>(.*?)</title>', e, re.DOTALL)
        sm = re.search(r'<summary>(.*?)</summary>', e, re.DOTALL)
        am = re.findall(r'<author>.*?<name>(.*?)</name>.*?</author>', e, re.DOTALL)
        if tm and sm:
            title = re.sub(r'\s+', ' ', tm.group(1)).strip()
            summary = re.sub(r'\s+', ' ', sm.group(1)).strip()
            authors = ", ".join(am[:3])
            if len(summary) > 100:
                records.append({
                    "instruction": f"Explain the research findings of '{title}' ({authors})",
                    "response": f"Research summary: {summary}\n\nThis research paper ({query} topic) contributes to quantum computing by exploring these concepts and findings.",
                    "source": "arxiv.org/quant-ph",
                    "type": "research_paper",
                    "title": title,
                })
                arxiv_count += 1
    time.sleep(3)  # arXiv is strict about rate limits

print(f"  → {arxiv_count} arXiv papers scraped")

# ─── 5. Wikipedia Quantum Articles ─────────────────────────────────────────────
print("\n[5] Scraping Wikipedia quantum computing articles...")

wiki_articles = [
    ("Quantum computing", "Quantum_computing"),
    ("Quantum entanglement", "Quantum_entanglement"),
    ("Quantum superposition", "Quantum_superposition"),
    ("Quantum decoherence", "Quantum_decoherence"),
    ("Bloch sphere", "Bloch_sphere"),
    ("Quantum gate", "Quantum_logic_gate"),
    ("Quantum Fourier transform", "Quantum_Fourier_transform"),
    ("Shor's algorithm", "Shor%27s_algorithm"),
    ("Grover's algorithm", "Grover%27s_algorithm"),
    ("Quantum error correction", "Quantum_error_correction"),
    ("Quantum teleportation", "Quantum_teleportation"),
    ("Variational quantum eigensolver", "Variational_quantum_eigensolver"),
    ("Surface code", "Surface_code"),
    ("Quantum key distribution", "Quantum_key_distribution"),
    ("Bell state", "Bell_state"),
    ("CNOT gate", "Controlled_NOT_gate"),
    ("Hadamard transform", "Hadamard_transform"),
    ("Density matrix", "Density_matrix"),
    ("Quantum complexity theory", "Quantum_complexity_theory"),
    ("Quantum annealing", "Quantum_annealing"),
]

wiki_count = 0
for friendly_name, page_name in wiki_articles:
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{page_name}"
    data = fetch(url)
    if not data:
        continue
    try:
        obj = json.loads(data)
        extract = obj.get("extract", "")
        description = obj.get("description", "")
        if len(extract) > 100:
            records.append({
                "instruction": f"What is {friendly_name} in quantum computing?",
                "response": extract[:2500],
                "source": "wikipedia.org",
                "type": "encyclopedia",
                "title": friendly_name,
            })
            wiki_count += 1
    except Exception as e:
        print(f"  ! {friendly_name}: {e}")
    time.sleep(0.5)

print(f"  → {wiki_count} Wikipedia articles scraped")

# ─── Save all records ──────────────────────────────────────────────────────────
print(f"\n{'='*60}")
print(f"TOTAL NEW RECORDS: {len(records)}")
output_file = DATA / "scraped_course_content.jsonl"
with open(output_file, "w", encoding="utf-8") as f:
    for rec in records:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")
print(f"Saved to {output_file}")

# Save course modules JSON for frontend
frontend_modules = {
    "qiskit_textbook": qiskit_modules,
    "meta": {
        "total_records": len(records),
        "sources": {
            "stackexchange": se_count + ans_count,
            "qiskit_textbook": len(qiskit_modules),
            "pennylane": pl_count,
            "arxiv": arxiv_count,
            "wikipedia": wiki_count,
        }
    }
}
with open(FRONTEND_DATA / "scrapedCourseModules.json", "w") as f:
    json.dump(frontend_modules, f, indent=2, ensure_ascii=False)
print(f"Course modules JSON saved.")
print("\nDone! Run scripts/build_rag_index.py --source=scraped to index.")
