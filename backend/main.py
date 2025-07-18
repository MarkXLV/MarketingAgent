import json
import logging
import sys
from fastapi import FastAPI, Request, HTTPException
from pathlib import Path
from pydantic import BaseModel
from .guardrails import validate_message, GuardrailError
from .openai_client import assemble_prompt, call_openai
from .metadata import get_metadata, load_metadata

app = FastAPI()

_metadata_cache = None

INPUT_PATH = Path(__file__).parent / "product_metadata.json"

def load_metadata():
    global _metadata_cache
    try:
        with open(INPUT_PATH, "r", encoding="utf-8") as f:
            _metadata_cache = json.load(f)
    except Exception as e:
        logging.error(f"Failed to load product_metadata.json: {e}")
        sys.exit(1)

def get_metadata():
    return _metadata_cache

@app.on_event("startup")
def startup_event():
    load_metadata()

@app.get("/metadata")
def read_metadata():
    return get_metadata()

class ChatRequest(BaseModel):
    user_text: str
    history: list = []  # List of {user: str, bot: str}

@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    metadata = get_metadata()
    try:
        validate_message(req.user_text)
    except GuardrailError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})
    prompt = assemble_prompt(metadata, req.history, req.user_text)
    reply = call_openai(prompt)
    return {"reply": reply} 