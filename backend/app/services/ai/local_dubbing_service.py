import io
import wave
import base64
import re
from typing import Dict, Optional, Tuple, Any
import numpy as np

# Lazy load PyTorch and Transformers to optimize startup memory
_MODELS: Dict[str, Any] = {}
_TOKENIZERS: Dict[str, Any] = {}

LANG_CODE_MAP = {
    "hi": "hin",
    "hindi": "hin",
    "ta": "tam",
    "tamil": "tam",
    "te": "tel",
    "telugu": "tel",
    "bn": "ben",
    "bengali": "ben",
    "mr": "mar",
    "marathi": "mar",
    "gu": "guj",
    "gujarati": "guj",
    "kn": "kan",
    "kannada": "kan",
    "ml": "mal",
    "malayalam": "mal",
    "pa": "pan",
    "punjabi": "pan",
    "en": "eng",
    "english": "eng",
}

def clean_speech_text(text: str) -> str:
    """Cleans markdown, math delimiters, and redundant whitespace for natural TTS pronunciation."""
    text = re.sub(r'[\$#\*_`\[\]\(\)]', ' ', text)
    text = re.sub(r'https?://\S+', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def get_mms_model_and_tokenizer(lang_code: str):
    """Loads and caches Hugging Face MMS-TTS model for the specified language."""
    import torch
    from transformers import VitsModel, AutoTokenizer

    mms_lang = LANG_CODE_MAP.get(lang_code.lower().strip(), "hin")
    model_id = f"facebook/mms-tts-{mms_lang}"

    if model_id not in _MODELS:
        print(f"[LocalDubbingService] Loading Hugging Face model: {model_id}...")
        tokenizer = AutoTokenizer.from_pretrained(model_id)
        model = VitsModel.from_pretrained(model_id)
        model.eval()
        _TOKENIZERS[model_id] = tokenizer
        _MODELS[model_id] = model

    return _MODELS[model_id], _TOKENIZERS[model_id], mms_lang

def synthesize_speech_wav(text: str, language: str = "hi") -> Tuple[bytes, int, float]:
    """
    Synthesizes speech using local Hugging Face MMS-TTS models.
    Returns: (wav_bytes, sample_rate, duration_seconds)
    """
    import torch

    cleaned_text = clean_speech_text(text)
    if not cleaned_text:
        cleaned_text = "नमस्कार"

    model, tokenizer, mms_lang = get_mms_model_and_tokenizer(language)

    # Chunk into sentences if text is long to maintain high natural prosody
    sentences = [s.strip() for s in re.split(r'[।\.\?!;\n]+', cleaned_text) if s.strip()]
    if not sentences:
        sentences = [cleaned_text]

    waveforms = []
    sample_rate = model.config.sampling_rate

    for s in sentences:
        if len(s) < 2:
            continue
        inputs = tokenizer(s, return_tensors="pt")
        with torch.no_grad():
            output = model(**inputs).waveform
        wf = output[0].cpu().numpy()
        waveforms.append(wf)
        # Add short pause between sentences (50ms of silence)
        silence = np.zeros(int(sample_rate * 0.05), dtype=np.float32)
        waveforms.append(silence)

    if not waveforms:
        inputs = tokenizer(cleaned_text, return_tensors="pt")
        with torch.no_grad():
            output = model(**inputs).waveform
        final_wf = output[0].cpu().numpy()
    else:
        final_wf = np.concatenate(waveforms)

    # Normalize audio levels
    max_val = np.max(np.abs(final_wf))
    if max_val > 0:
        final_wf = (final_wf / max_val) * 0.95

    # Encode to 16-bit PCM WAV
    pcm16 = (final_wf * 32767).astype(np.int16)
    duration_sec = len(pcm16) / float(sample_rate)

    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(pcm16.tobytes())

    wav_bytes = buffer.getvalue()
    return wav_bytes, sample_rate, round(duration_sec, 2)

def synthesize_speech_base64(text: str, language: str = "hi") -> Dict[str, Any]:
    """Generates base64 data URI for direct web playback."""
    wav_bytes, sample_rate, duration_sec = synthesize_speech_wav(text, language)
    b64 = base64.b64encode(wav_bytes).decode("utf-8")
    data_uri = f"data:audio/wav;base64,{b64}"
    
    mms_lang = LANG_CODE_MAP.get(language.lower().strip(), "hin")
    return {
        "success": True,
        "language": language,
        "model_id": f"facebook/mms-tts-{mms_lang}",
        "sample_rate": sample_rate,
        "duration_seconds": duration_sec,
        "audio_base64": b64,
        "data_uri": data_uri,
        "provider": "huggingface_mms_local"
    }
