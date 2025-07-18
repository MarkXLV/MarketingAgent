from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from marketing_agent import handle_user_message, GuardrailError
from db import save_conversation_start, save_message, get_conversations, get_messages
import uuid
import time

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    history: list
    user_text: str
    convoId: str = None  # Optional: for continuing a conversation
    userId: str = 'demo-user'  # In real app, get from auth

@app.post("/api/marketing-chat")
def marketing_chat(req: ChatRequest):
    # Use provided convoId or start a new one
    convoId = req.convoId or str(uuid.uuid4())
    userId = req.userId or 'demo-user'
    if not req.convoId:
        save_conversation_start(convoId, userId, int(time.time() * 1000))
    # Save user message
    user_msg = {
        'id': str(uuid.uuid4()),
        'author': 'user',
        'content': req.user_text,
        'ts': int(time.time() * 1000)
    }
    save_message(convoId, user_msg)
    try:
        bot_reply = handle_user_message(req.history, req.user_text)
    except GuardrailError as e:
        # Save error as assistant message
        bot_msg = {
            'id': str(uuid.uuid4()),
            'author': 'assistant',
            'content': f"[Guardrail] {e.reason}",
            'ts': int(time.time() * 1000)
        }
        save_message(convoId, bot_msg)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        bot_msg = {
            'id': str(uuid.uuid4()),
            'author': 'assistant',
            'content': f"[Error] {str(e)}",
            'ts': int(time.time() * 1000)
        }
        save_message(convoId, bot_msg)
        raise HTTPException(status_code=500, detail=str(e))
    # Save assistant message
    bot_msg = {
        'id': str(uuid.uuid4()),
        'author': 'assistant',
        'content': bot_reply,
        'ts': int(time.time() * 1000)
    }
    save_message(convoId, bot_msg)
    return {"bot_reply": bot_reply, "convoId": convoId}

@app.get("/api/history")
def list_history(userId: str = Query(...)):
    return get_conversations(userId)

@app.get("/api/history/{convoId}")
def fetch_history(convoId: str, userId: str = Query(...)):
    # Optionally, you could check userId matches the convo owner
    return get_messages(convoId) 