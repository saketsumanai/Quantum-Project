#!/usr/bin/env python3
"""
Quantum Leap — Massive Dataset Downloader
Downloads 30,000+ quantum computing instruction-response pairs.
"""
import os, sys, json, re, time, urllib.request, urllib.error, ssl
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_FILE = DATA_DIR / "huge_quantum_training_dataset.jsonl"

ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE
HEADERS = {"User-Agent": "Mozilla/5.0 (QuantumLeapAI/1.0)"}

def fetch_url(url, timeout=30):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        res = urllib.request.urlopen(req, timeout=timeout, context=ssl_ctx)
        return res.read()
    except Exception as e:
        print(f"  [WARN] Failed {url}: {e}")
        return None

def load_stackexchange_quantum():
    print("\n[1] StackExchange Quantum Computing (23,891 pairs)...")
    try:
        from huggingface_hub import hf_hub_download
        import pyarrow.parquet as pq
        path = hf_hub_download(repo_id="mlfoundations-dev/stackexchange_quantumcomputing",
            filename="data/train-00000-of-00001.parquet", repo_type="dataset")
        table = pq.read_table(path)
        records = []
        for i in range(table.num_rows):
            inst = table["instruction"][i].as_py() or ""
            comp = table["completion"][i].as_py() or ""
            if len(inst.strip()) > 20 and len(comp.strip()) > 20:
                records.append({"instruction": inst.strip(), "response": comp.strip(),
                    "source": "stackexchange_quantumcomputing", "type": "qa"})
        print(f"  -> {len(records)} records")
        return records
    except Exception as e:
        print(f"  [ERROR] {e}")
        return []

def load_cot_quantum():
    print("\n[2] CoT Quantum Computing dataset...")
    try:
        from huggingface_hub import hf_hub_download
        import pyarrow.parquet as pq
        path = hf_hub_download(repo_id="0xZee/dataset-CoT-Quantum-Computing-224",
            filename="data/train-00000-of-00001.parquet", repo_type="dataset")
        table = pq.read_table(path)
        cols = table.column_names
        records = []
        for i in range(table.num_rows):
            row = {c: (table[c][i].as_py() or "") for c in cols}
            inst = row.get("instruction") or row.get("question") or row.get("prompt") or ""
            resp = row.get("response") or row.get("answer") or row.get("output") or row.get("completion") or ""
            if len(inst.strip()) > 10 and len(resp.strip()) > 10:
                records.append({"instruction": inst.strip(), "response": resp.strip(),
                    "source": "cot_quantum_computing", "type": "chain_of_thought"})
        print(f"  -> {len(records)} records")
        return records
    except Exception as e:
        print(f"  [ERROR] {e}")
        return []

def load_existing_datasets():
    print("\n[3] Existing curated datasets...")
    records = []
    for fname in ["quantum_tutor_dataset.jsonl", "pennylane_quantum_datasets.jsonl"]:
        fpath = DATA_DIR / fname
        if fpath.exists():
            n = 0
            with open(fpath, encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line: continue
                    try:
                        obj = json.loads(line)
                        inst = obj.get("instruction") or obj.get("question") or obj.get("prompt") or ""
                        resp = obj.get("response") or obj.get("answer") or obj.get("output") or obj.get("completion") or ""
                        if inst and resp:
                            records.append({"instruction": inst.strip(), "response": resp.strip(),
                                "source": fname.replace(".jsonl",""), "type": obj.get("type","qa")})
                            n += 1
                    except: pass
            print(f"  {fname}: {n} records")
    return records

def scrape_lynnlangit_repo():
    print("\n[4] Scraping GitHub: lynnlangit/learning-quantum...")
    records = []
    base_api = "https://api.github.com/repos/lynnlangit/learning-quantum/contents"
    
    def fetch_dir(path=""):
        url = f"{base_api}/{path}".rstrip("/")
        data = fetch_url(url)
        if not data: return []
        try: return json.loads(data)
        except: return []
    
    def process_file(info):
        name = info.get("name","")
        dl_url = info.get("download_url")
        path = info.get("path","")
        if not dl_url: return
        if not any(name.endswith(e) for e in [".md",".ipynb",".py",".txt"]): return
        cb = fetch_url(dl_url)
        if not cb: return
        content = cb.decode("utf-8", errors="ignore")
        if name.endswith(".ipynb"):
            try:
                nb = json.loads(content)
                mds = ["".join(c.get("source",[])) for c in nb.get("cells",[]) if c.get("cell_type")=="markdown"]
                pys = ["".join(c.get("source",[])) for c in nb.get("cells",[]) if c.get("cell_type")=="code"]
                for md in mds[:3]:
                    if len(md)>100:
                        records.append({"instruction":f"Explain: {md[:150].strip()}", "response":md[:2000],
                            "source":f"lynnlangit:{path}", "type":"notebook"})
                for py in pys[:2]:
                    if len(py)>50:
                        records.append({"instruction":f"Explain this quantum code from {name}:\n```python\n{py[:500]}\n```",
                            "response":f"This code from {path} demonstrates quantum computing concepts.", 
                            "source":f"lynnlangit:{path}", "type":"code"})
            except: pass
        elif name.endswith(".md") and len(content)>200:
            paras = [p.strip() for p in re.split(r'\n#{1,3} ',content) if len(p.strip())>100]
            for para in paras[:4]:
                heading = re.match(r'^(.+?)\n',para)
                h = heading.group(1).strip("# ").strip() if heading else "quantum concept"
                records.append({"instruction":f"Explain quantum computing topic: {h}",
                    "response":para[:2000], "source":f"lynnlangit:{path}", "type":"documentation"})
    
    def recurse(path="", depth=0):
        if depth>3: return
        items = fetch_dir(path)
        time.sleep(0.5)
        for item in items:
            if item.get("type")=="dir": recurse(item.get("path",""), depth+1)
            elif item.get("type")=="file":
                process_file(item); time.sleep(0.2)
    
    recurse()
    print(f"  -> {len(records)} records from lynnlangit repo")
    return records

def scrape_arxiv_abstracts():
    print("\n[5] arXiv quantum computing abstracts...")
    records = []
    terms = ["quantum+algorithm","quantum+error+correction","variational+quantum","quantum+machine+learning"]
    for term in terms:
        url = f"https://export.arxiv.org/api/query?search_query=cat:quant-ph+AND+{term}&max_results=8&sortBy=submittedDate&sortOrder=descending"
        data = fetch_url(url)
        if not data: continue
        text = data.decode("utf-8", errors="ignore")
        entries = re.findall(r'<entry>(.*?)</entry>',text,re.DOTALL)
        for e in entries:
            tm = re.search(r'<title>(.*?)</title>',e,re.DOTALL)
            sm = re.search(r'<summary>(.*?)</summary>',e,re.DOTALL)
            if tm and sm:
                title = re.sub(r'\s+',' ',tm.group(1)).strip()
                summary = re.sub(r'\s+',' ',sm.group(1)).strip()
                if len(summary)>100:
                    records.append({"instruction":f"What is '{title}'? Explain the key concepts.",
                        "response":summary, "source":"arxiv_quant-ph", "type":"research"})
        time.sleep(3)
    print(f"  -> {len(records)} arXiv records")
    return records

def expert_qa():
    print("\n[6] Adding expert-curated Q&A pairs...")
    pairs = [
        {"instruction":"What is quantum superposition?","response":"Quantum superposition allows a qubit to exist as |ψ⟩=α|0⟩+β|1⟩ with |α|²+|β|²=1. Unlike classical probability, amplitudes are complex numbers that interfere. Measurement collapses the state with Born's rule: P(0)=|α|², P(1)=|β|². The Hadamard gate H|0⟩=(|0⟩+|1⟩)/√2 creates equal superposition. This is NOT just 'being both at once' — it's a mathematical wave that can constructively or destructively interfere.","source":"expert_curated","type":"conceptual"},
        {"instruction":"Explain Grover's algorithm with Qiskit code","response":"Grover's algorithm finds a marked item in N unsorted items in O(√N) queries.\n```python\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(2,2)\nqc.h([0,1])\nqc.cz(0,1) # Oracle marks |11>\nqc.h([0,1]); qc.x([0,1]); qc.cz(0,1); qc.x([0,1]); qc.h([0,1])\nqc.measure_all()\n```\nThe Grover diffusion amplifies the marked state after (π/4)√N iterations.","source":"expert_curated","type":"code"},
        {"instruction":"What is the Quantum Fourier Transform (QFT)?","response":"QFT|j⟩=(1/√N)Σₖe^(2πijk/N)|k⟩ maps computational basis to Fourier basis. It's the core of Shor's and QPE algorithms. Circuit uses O(n²) Hadamard+controlled-phase gates. In Qiskit: from qiskit.circuit.library import QFT; qft=QFT(3). Key insight: QFT encodes period information into phase amplitudes.","source":"expert_curated","type":"algorithm"},
        {"instruction":"Explain quantum entanglement and Bell states","response":"Bell states are maximally entangled 2-qubit states:\n|Φ⁺⟩=(|00⟩+|11⟩)/√2, |Φ⁻⟩=(|00⟩-|11⟩)/√2\n|Ψ⁺⟩=(|01⟩+|10⟩)/√2, |Ψ⁻⟩=(|01⟩-|10⟩)/√2\nCreate with H+CNOT. Measuring one qubit instantly determines the other — but classical bits must be sent to use this (no FTL). Used in teleportation, superdense coding, QKD.","source":"expert_curated","type":"conceptual"},
        {"instruction":"What is VQE and how does it work?","response":"VQE (Variational Quantum Eigensolver) finds ground state energy via variational principle: E(θ)=⟨ψ(θ)|H|ψ(θ)⟩≥E₀. Steps: 1) Prepare parameterized ansatz U(θ)|0⟩ 2) Measure Hamiltonian expectation 3) Classical optimizer minimizes E(θ) 4) Repeat. Used for quantum chemistry (H₂, LiH). Key challenge: barren plateaus in optimization landscape.","source":"expert_curated","type":"algorithm"},
        {"instruction":"How does quantum error correction work?","response":"QEC protects qubits from decoherence without violating no-cloning. Key idea: encode 1 logical qubit in many physical qubits, measure error syndromes (parities) without disturbing data. Surface code: 2D grid of qubits, ~1% error threshold, d² physical per logical qubit. Stabilizer formalism: errors detected by measuring commuting Pauli operators. Fault-tolerant gates require magic state distillation for non-Clifford gates (e.g., T gate).","source":"expert_curated","type":"advanced"},
        {"instruction":"Explain Shor's algorithm for factoring","response":"Shor's algorithm factors N in O((log N)³) time. Steps: 1) Choose random a<N, check gcd(a,N)=1 2) Use QPE to find period r of aˣ mod N 3) Factors: gcd(a^(r/2)±1, N). Quantum subroutine: uniform superposition → controlled modular exponentiation → inverse QFT → period measurement. Threatens RSA-2048 but requires ~20M physical qubits.","source":"expert_curated","type":"algorithm"},
        {"instruction":"What is QAOA and when is it useful?","response":"QAOA (Quantum Approximate Optimization Algorithm) solves combinatorial optimization with parameterized circuit alternating cost Uᶜ(γ)=e^(-iγC) and mixer Uᴮ(β)=e^(-iβΣXᵢ) operators. Depth-p QAOA gives approximation ratio improving with p. Best for MaxCut, portfolio optimization, scheduling on NISQ hardware. Classical QAOA may outperform quantum for small p; quantum advantage expected for p>>1.","source":"expert_curated","type":"algorithm"},
        {"instruction":"What is quantum teleportation?","response":"Teleportation transmits unknown state |ψ⟩=α|0⟩+β|1⟩ using 1 Bell pair + 2 classical bits. Protocol: Alice measures in Bell basis → 2 bits → Bob applies corrections (I/X/Z/ZX). State is 'destroyed' at Alice's end (no-cloning preserved). Used in quantum networks, distributed quantum computing. NOT faster-than-light — classical channel required.","source":"expert_curated","type":"protocol"},
        {"instruction":"Explain Bloch sphere representation","response":"Every pure qubit state |ψ⟩=cos(θ/2)|0⟩+e^(iφ)sin(θ/2)|1⟩ maps to a point on the unit Bloch sphere: x=sin(θ)cos(φ), y=sin(θ)sin(φ), z=cos(θ). |0⟩ is north pole, |1⟩ south pole. |+⟩=(|0⟩+|1⟩)/√2 is on equator. Rotations: Rx,Ry,Rz rotate around respective axes. Mixed states are inside the sphere (r<1).","source":"expert_curated","type":"mathematical"},
        {"instruction":"What is quantum decoherence and T1 T2 times?","response":"Decoherence is loss of quantum information to environment. T1 (longitudinal/energy relaxation): time for |1⟩→|0⟩, measures energy decay. T2 (transverse/dephasing): time for superposition to lose phase coherence, T2≤2T1. Modern superconducting qubits: T1~100-500μs, T2~50-300μs. Mitigations: dynamical decoupling (periodic π pulses), cryogenic isolation (15mK), error correction. Circuit depth limited by T2 for NISQ devices.","source":"expert_curated","type":"hardware"},
        {"instruction":"How do I implement a quantum phase estimation (QPE) circuit?","response":"QPE estimates eigenphase φ of unitary U with eigenstate |u⟩ (U|u⟩=e^(2πiφ)|u⟩). Circuit: n ancilla qubits in H superposition → controlled-U^(2^k) operations → inverse QFT → measure. Resolution: 1/2ⁿ. Qiskit:\n```python\nfrom qiskit.circuit.library import PhaseEstimation\nimport numpy as np\n# For U with eigenvalue e^(2πi·0.25):\nunitary = [[1,0],[0,np.exp(2j*np.pi*0.25)]]\nqpe = PhaseEstimation(num_evaluation_qubits=4, unitary=...)\n```\nBasis for Shor, HHL, quantum chemistry.","source":"expert_curated","type":"code"},
    ]
    print(f"  -> {len(pairs)} expert pairs")
    return pairs

def main():
    print("="*60 + "\nQUANTUM LEAP — MASSIVE DATASET DOWNLOADER\n" + "="*60)
    DATA_DIR.mkdir(exist_ok=True)
    all_records = []
    all_records.extend(load_existing_datasets())
    all_records.extend(load_stackexchange_quantum())
    all_records.extend(load_cot_quantum())
    all_records.extend(expert_qa())
    all_records.extend(scrape_lynnlangit_repo())
    all_records.extend(scrape_arxiv_abstracts())
    
    seen = set()
    deduped = []
    for rec in all_records:
        key = rec["instruction"][:100].lower().strip()
        if key not in seen:
            seen.add(key)
            deduped.append(rec)
    
    print(f"\nTOTAL: {len(deduped)} unique records -> {OUTPUT_FILE}")
    with open(OUTPUT_FILE,"w",encoding="utf-8") as f:
        for rec in deduped:
            f.write(json.dumps(rec,ensure_ascii=False)+"\n")
    
    sources = {}
    for rec in deduped:
        s = rec.get("source","?").split(":")[0]
        sources[s] = sources.get(s,0)+1
    for s,c in sorted(sources.items(),key=lambda x:-x[1]):
        print(f"  {s}: {c}")
    print(f"\n✅ Saved to {OUTPUT_FILE}")

if __name__=="__main__":
    main()
