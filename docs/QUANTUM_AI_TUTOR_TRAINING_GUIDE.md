# ⚛️ Quantum Leap — AI Quantum Algorithm Tutor: Complete Training & Serving Guide

> **Project:** Quantum Leap | Smart India Hackathon 2026 (Problem Statement 4)  
> **Target Architecture:** Fine-Tuned Meta Llama-3.1-8B-Instruct (via QLoRA) + ChromaDB RAG (76-Book Quantum Corpus)

---

## 1. Why Meta Llama-3.1-8B is the Best Model for a Quantum Tutor

When evaluating models for an AI Quantum Algorithm Tutor, three criteria are non-negotiable:
1. **Mathematical & Formal Rigor**: Exact handling of Dirac notation ($\langle\psi|$, $|\phi\rangle$), complex matrices, and tensor products ($H \otimes I$).
2. **Qiskit 1.0+ Code Reliability**: Knowing modern Qiskit syntax (`QuantumCircuit`, transpiler passes) without outputting deprecated 0.x methods (e.g. `execute`, `Aer.get_backend('qasm_simulator')`).
3. **Hardware Efficiency**: Ability to fine-tune on accessible hardware (**Google Colab Free T4 GPU** with 16GB VRAM) and serve locally or at low latency.

| Model | Size | Colab T4 Compatible? | Math & Logic | Qiskit 1.0+ Accuracy | Recommended Role |
|---|---|---|---|---|---|
| **Meta Llama-3.1-8B-Instruct** | 8.03B | **Yes (QLoRA 4-bit, ~5.5GB VRAM)** | ⭐⭐⭐⭐⭐ (84.1 MMLU) | ⭐⭐⭐⭐⭐ | **Primary Target for Fine-Tuning** |
| **DeepSeek-R1-Distill-Llama-8B** | 8.03B | **Yes (QLoRA 4-bit)** | ⭐⭐⭐⭐⭐ (Chain of Thought) | ⭐⭐⭐⭐ | High-depth reasoning alternative |
| **Qwen-2.5-Coder-7B-Instruct** | 7.61B | **Yes (QLoRA 4-bit)** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Exceptional Python code synthesis |
| **Llama-3.3-70B-Versatile (Groq)** | 70B | Cloud API only | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Ultra-fast cloud baseline & fallback |

**Verdict:** **Llama-3.1-8B-Instruct** fine-tuned with our Socratic Quantum Dataset yields the optimal combination of pedagogic empathy, rigorous mathematical notation, and executable Qiskit code.

---

## 2. Step-by-Step Google Colab Training Workflow

### Step 2.1: Open the Colab Notebook
1. Open Google Colab: [colab.research.google.com](https://colab.research.google.com).
2. Click **File** -> **Upload notebook** -> Select `notebooks/Quantum_Llama_Tutor_Colab_FineTuning.ipynb`.
3. Set your runtime:
   - Navigate to **Runtime** -> **Change runtime type**.
   - Select **T4 GPU** (Free tier included).
   - Click **Save**.

### Step 2.2: Prepare Your Hugging Face Access Token
Meta Llama 3.1 is gated on Hugging Face (free instantaneous access):
1. Accept the Llama-3.1 license at [huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct).
2. Generate an Access Token under **Settings -> Access Tokens** (Read permission).
3. In Colab, enter your token when prompted by `huggingface_hub.login()`.

### Step 2.3: Execute the Training Cells
- Run cells 1 through 5.
- The pipeline uses:
  - **4-Bit NF4 Quantization (`BitsAndBytesConfig`)**: Cuts base model memory footprint to ~5.5GB VRAM.
  - **LoRA Hyperparameters**: Rank $r=16$, $\alpha=32$, targeting `[q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj]`.
  - **SFTTrainer**: Trains for 3 epochs in under 15 minutes on the dataset.

### Step 2.4: Export LoRA Adapters
Once training finishes, the notebook saves the adapter to `./quantum_llama_tutor_lora`.
Download this folder to your machine or push directly to your Hugging Face Hub account:
```python
trainer.model.push_to_hub("your-username/quantum-llama-3.1-8b-tutor")
tokenizer.push_to_hub("your-username/quantum-llama-3.1-8b-tutor")
```

---

## 3. Serving Options & Connecting to Quantum Leap

### Option A: Local Serving with Ollama (Recommended for Offline / Local)
1. Convert the merged model to GGUF using `llama.cpp`:
   ```bash
   python convert_hf_to_gguf.py ./quantum_llama_tutor_lora --outtype q4_k_m
   ```
2. Create an Ollama `Modelfile`:
   ```dockerfile
   FROM ./quantum-llama-3.1-8b-tutor.gguf
   PARAMETER temperature 0.25
   PARAMETER stop "<|eot_id|>"
   SYSTEM "You are Aura Quantum AI — an elite quantum computing professor and world-class researcher powering Quantum Leap."
   ```
3. Register with Ollama:
   ```bash
   ollama create quantum-llama3-tutor -f Modelfile
   ollama run quantum-llama3-tutor
   ```
4. Set in your `.env`:
   ```env
   CUSTOM_LLM_URL=http://localhost:11434/v1
   CUSTOM_LLM_MODEL=quantum-llama3-tutor
   ```

### Option B: High-Speed Cloud Inference via Groq (Zero Setup)
The platform is already pre-configured to use Groq's high-speed LPU running `llama-3.3-70b-versatile` or `llama-3.1-8b-instant`.
Ensure your `.env` contains:
```env
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile
```

### Option C: Google Colab ngrok Tunnel (Direct Remote Testing)
If running a vLLM server inside Google Colab:
1. Start vLLM with ngrok in Colab:
   ```bash
   !pip install vllm pyngrok
   from pyngrok import ngrok
   ngrok.set_auth_token("YOUR_NGROK_TOKEN")
   tunnel = ngrok.connect(8000)
   print("Public URL:", tunnel.public_url)
   !python -m vllm.entrypoints.openai.api_server --model ./quantum_llama_tutor_lora --port 8000
   ```
2. Put the generated public URL in `.env`:
   ```env
   CUSTOM_LLM_URL=https://xxxx-xx-xx.ngrok-free.app/v1
   CUSTOM_LLM_MODEL=quantum_llama_tutor_lora
   ```

---

## 4. Grounding with ChromaDB RAG
Even a fine-tuned model benefits from factual grounding. The Quantum Leap backend automatically:
1. Queries the local ChromaDB vector store (76 indexed quantum textbooks).
2. Injects relevant passages into the prompt context.
3. Requires the model to output validated JSON containing:
   - Socratic Analogy
   - LaTeX formula
   - Qiskit 1.0+ code
   - Diagnostic Quiz
   - Citations of retrieved textbook chunks.
