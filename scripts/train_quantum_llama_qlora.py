#!/usr/bin/env python3
"""
Quantum Leap — Automated Llama-3.1-8B QLoRA Fine-Tuning Pipeline
================================================================
Fine-tunes Meta-Llama-3.1-8B-Instruct (or DeepSeek/Qwen) into a Socratic Quantum Algorithm AI Tutor.
Optimized for single-GPU execution (Google Colab free T4 GPU, A100, L4, or local RTX 3060/4090).

Usage:
  python scripts/train_quantum_llama_qlora.py \
    --model_id "meta-llama/Meta-Llama-3.1-8B-Instruct" \
    --dataset_path "./data/quantum_tutor_dataset.jsonl" \
    --output_dir "./models/quantum_llama_tutor_lora" \
    --epochs 3 \
    --batch_size 2
"""

import argparse
import os
import sys
import json
import torch

def parse_args():
    parser = argparse.ArgumentParser(description="QLoRA Fine-Tuning for Quantum Algorithm AI Tutor")
    parser.add_argument("--model_id", type=str, default="meta-llama/Meta-Llama-3.1-8B-Instruct",
                        help="HuggingFace model ID or local directory")
    parser.add_argument("--dataset_path", type=str, default="./data/quantum_tutor_dataset.jsonl",
                        help="Path to JSONL training dataset")
    parser.add_argument("--output_dir", type=str, default="./models/quantum_llama_tutor_lora",
                        help="Output directory to save LoRA adapters")
    parser.add_argument("--epochs", type=int, default=3, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=2, help="Per-device train batch size")
    parser.add_argument("--grad_accum", type=int, default=4, help="Gradient accumulation steps")
    parser.add_argument("--lr", type=float, default=2e-4, help="Learning rate")
    parser.add_argument("--max_seq_length", type=int, default=2048, help="Maximum sequence length")
    parser.add_argument("--push_to_hub", action="store_true", help="Push trained adapter to Hugging Face Hub")
    parser.add_argument("--hub_model_id", type=str, default=None, help="Hugging Face Hub repository name")
    return parser.parse_args()

def check_environment():
    print("=" * 70)
    print("Quantum Leap AI Tutor — Fine-Tuning Environment Check")
    print("=" * 70)
    cuda_available = torch.cuda.is_available()
    print(f"CUDA Available: {cuda_available}")
    if cuda_available:
        gpu_name = torch.cuda.get_device_name(0)
        vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024 ** 3)
        print(f"Active GPU: {gpu_name} ({vram_gb:.2f} GB VRAM)")
    else:
        print("WARNING: CUDA is not available. Fine-tuning on CPU is strongly discouraged for 8B models.")
        print("Run this script in Google Colab (Runtime -> Change runtime type -> T4 GPU).")
    print("=" * 70)

def main():
    args = parse_args()
    check_environment()

    if not os.path.exists(args.dataset_path):
        print(f"ERROR: Dataset not found at {args.dataset_path}")
        print("Run `python scripts/generate_quantum_dataset.py` first!")
        sys.exit(1)

    try:
        from transformers import (
            AutoModelForCausalLM,
            AutoTokenizer,
            BitsAndBytesConfig,
            TrainingArguments,
        )
        from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
        from datasets import load_dataset
        from trl import SFTTrainer
    except ImportError as e:
        print(f"Missing required packages: {e}")
        print("Install dependencies with:")
        print("pip install torch transformers peft bitsandbytes datasets trl accelerate")
        sys.exit(1)

    print(f"[1/5] Loading tokenizer for {args.model_id}...")
    tokenizer = AutoTokenizer.from_pretrained(args.model_id, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    print("[2/5] Configuring 4-bit Quantization (QLoRA NF4)...")
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16,
        bnb_4bit_use_double_quant=True,
    )

    print(f"[3/5] Loading base model in 4-bit...")
    device_map = "auto" if torch.cuda.is_available() else "cpu"
    model = AutoModelForCausalLM.from_pretrained(
        args.model_id,
        quantization_config=bnb_config if torch.cuda.is_available() else None,
        device_map=device_map,
        trust_remote_code=True,
    )
    model = prepare_model_for_kbit_training(model)

    print("[4/5] Attaching LoRA Adapters...")
    peft_config = LoraConfig(
        r=16,
        lora_alpha=32,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    )
    model = get_peft_model(model, peft_config)
    model.print_trainable_parameters()

    print(f"[5/5] Loading and formatting dataset from {args.dataset_path}...")
    dataset = load_dataset("json", data_files=args.dataset_path, split="train")

    def format_prompts(example):
        messages = example["messages"]
        text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)
        return {"text": text}

    formatted_dataset = dataset.map(format_prompts)

    training_args = TrainingArguments(
        output_dir=args.output_dir,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=args.grad_accum,
        learning_rate=args.lr,
        lr_scheduler_type="cosine",
        warmup_ratio=0.05,
        logging_steps=5,
        save_strategy="epoch",
        fp16=not torch.cuda.is_bf16_supported() and torch.cuda.is_available(),
        bf16=torch.cuda.is_bf16_supported(),
        report_to="none",
    )

    trainer = SFTTrainer(
        model=model,
        train_dataset=formatted_dataset,
        dataset_text_field="text",
        max_seq_length=args.max_seq_length,
        tokenizer=tokenizer,
        args=training_args,
        peft_config=peft_config,
    )

    print("\nStarting Training Pipeline...")
    trainer.train()

    print(f"\nTraining complete! Saving LoRA adapter weights to {args.output_dir}...")
    trainer.model.save_pretrained(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)

    if args.push_to_hub and args.hub_model_id:
        print(f"Pushing adapter to Hugging Face Hub: {args.hub_model_id}...")
        trainer.model.push_to_hub(args.hub_model_id)
        tokenizer.push_to_hub(args.hub_model_id)

    print("\n" + "=" * 70)
    print("SUCCESS: Quantum AI Tutor fine-tuning completed.")
    print("=" * 70)
    print(f"1. LoRA adapter saved at: {args.output_dir}")
    print("2. To merge into standalone 16-bit model or export to GGUF for Ollama, see:")
    print("   docs/QUANTUM_AI_TUTOR_TRAINING_GUIDE.md")

if __name__ == "__main__":
    main()
