# backend/api.py

import os
import uuid
import time
from pathlib import Path
from dotenv import load_dotenv
from typing import Optional

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
    get_conversation_owner,
    create_user, get_user_by_id, update_user_profile,
    create_goal, get_goals_by_user, update_goal_progress,
    create_badge, get_badges_by_user
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
    convoId: Optional[str] = None
    userId: str = "demo-user"

class UserCreate(BaseModel):
    userId: str
    name: str
    email: str
    password: str
    region: str = None
    language: str = None
    accessibility: str = None
    persona: str = None

class UserUpdate(BaseModel):
    region: str = None
    language: str = None
    accessibility: str = None
    persona: str = None

class GoalCreate(BaseModel):
    goalId: str
    userId: str
    goal_type: str
    target_amount: float = None
    deadline: int = None
    progress: float = None

class GoalUpdate(BaseModel):
    progress: float

class BadgeCreate(BaseModel):
    badgeId: str
    userId: str
    badge_name: str
    date_awarded: int


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

        # Get user profile for personalization
        user_profile = None
        try:
            user_data = await get_user_by_id(user_id)
            if user_data:
                user_profile = {
                    'name': user_data.get('name', 'User'),
                    'region': user_data.get('region', 'US'),
                    'language': user_data.get('language', 'en'),
                    'persona': user_data.get('persona', 'Gen Z'),
                    'accessibility': user_data.get('accessibility', 'none')
                }
        except Exception:
            # If user profile fetch fails, continue without it
            pass

        # Build prompt with user context and call OpenAI
        prompt = assemble_prompt(metadata, req.history, req.user_text, user_profile)
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

# ─── User Endpoints ─────────────────────────────────────────────
@app.post("/api/users")
async def api_create_user(user: UserCreate):
    await create_user(**user.dict())
    return {"status": "created", "userId": user.userId}

@app.get("/api/users/{userId}")
async def api_get_user(userId: str):
    user = await get_user_by_id(userId)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.patch("/api/users/{userId}")
async def api_update_user(userId: str, update: UserUpdate):
    await update_user_profile(userId, **update.dict())
    return {"status": "updated", "userId": userId}

# ─── Goal Endpoints ─────────────────────────────────────────────
@app.post("/api/goals")
async def api_create_goal(goal: GoalCreate):
    await create_goal(**goal.dict())
    return {"status": "created", "goalId": goal.goalId}

@app.get("/api/goals/{userId}")
async def api_get_goals(userId: str):
    return await get_goals_by_user(userId)

@app.patch("/api/goals/{goalId}")
async def api_update_goal(goalId: str, update: GoalUpdate):
    await update_goal_progress(goalId, update.progress)
    return {"status": "updated", "goalId": goalId}

# ─── Badge Endpoints ─────────────────────────────────────────────
@app.post("/api/badges")
async def api_create_badge(badge: BadgeCreate):
    await create_badge(**badge.dict())
    return {"status": "awarded", "badgeId": badge.badgeId}

@app.get("/api/badges/{userId}")
async def api_get_badges(userId: str):
    return await get_badges_by_user(userId)
