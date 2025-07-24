# backend/api.py

import os
import uuid
import time
from pathlib import Path
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Robustly load environment variables
current_dir = Path(__file__).parent
env_path = current_dir / ".env"
load_dotenv(dotenv_path=env_path)

# Import modules from our package
from .db import (
    save_conversation_start,
    save_message,
    get_conversations,
    get_messages,
    get_conversation_owner
)
from .guardrails import validate_message, GuardrailError
from .openai_client import assemble_prompt, call_openai
from .metadata import load_metadata as _load_meta, get_metadata

# ─── App Initialization ─────────────────────────────────────────
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load metadata on startup
@app.on_event("startup")
async def on_startup():
    _load_meta()

# Access cached metadata
metadata = get_metadata()

# ─── Models & Helpers ────────────────────────────────────────────
class ChatRequest(BaseModel):
    history: list
    user_text: str
    convoId: str = None
    userId: str = "demo-user"


def _create_message(author: str, content: str) -> dict:
    return {
        "id": str(uuid.uuid4()),
        "author": author,
        "content": content,
        "ts": int(time.time() * 1000),
    }

# ─── Endpoints ────────────────────────────────────────────────────
@app.post("/api/marketing-chat")
async def marketing_chat(req: ChatRequest):
    convo_id = req.convoId or str(uuid.uuid4())
    user_id = req.userId or "demo-user"

    # Persist conversation start if new
    if not req.convoId:
        await save_conversation_start(convo_id, user_id, int(time.time() * 1000))

    # Save incoming user message
    user_msg = _create_message("user", req.user_text)
    await save_message(convo_id, user_msg)

    try:
        # Guardrails: moderation + topic check
        await validate_message(req.user_text, metadata)

        # Build prompt and call OpenAI
        prompt = assemble_prompt(metadata, req.history, req.user_text)
        bot_reply = await call_openai(prompt)

    except GuardrailError as e:
        # Save violation message and return 400
        guard_msg = _create_message("assistant", f"[Guardrail] {e.reason}")
        await save_message(convo_id, guard_msg)
        raise HTTPException(status_code=400, detail=e.reason)

    except Exception as e:
        # Save error message, log, and return 500
        err_msg = _create_message("assistant", "[Error] Internal Server Error")
        await save_message(convo_id, err_msg)
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")

    # Save successful reply
    bot_msg = _create_message("assistant", bot_reply)
    await save_message(convo_id, bot_msg)

    return {"bot_reply": bot_reply, "convoId": convo_id}


@app.get("/api/history")
async def list_history(userId: str = Query(...)):
    return await get_conversations(userId)


@app.get("/api/history/{convoId}")
async def fetch_history(convoId: str, userId: str = Query(...)):
    owner = await get_conversation_owner(convoId)
    if owner != userId:
        raise HTTPException(status_code=403, detail="Access forbidden")
    return await get_messages(convoId)
