from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from marketing_agent import handle_user_message, GuardrailError

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

@app.post("/api/marketing-chat")
def marketing_chat(req: ChatRequest):
    try:
        bot_reply = handle_user_message(req.history, req.user_text)
        return {"bot_reply": bot_reply}
    except GuardrailError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 