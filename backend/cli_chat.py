import os
import sys
import uuid
import time
from pathlib import Path
from dotenv import load_dotenv

# Robustly load environment variables
current_dir = Path(__file__).parent
env_path = current_dir / ".env"
load_dotenv(dotenv_path=env_path)

import asyncio
from .guardrails import validate_message, GuardrailError
from .openai_client import assemble_prompt, call_openai
from .metadata import load_metadata, METADATA_PATH

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

async def main():
    print("Welcome to the Financial Coach CLI! Type 'exit' to quit.")
    metadata = load_metadata()
    history = []  # List of {user: str, bot: str}
    while True:
        user_text = input("You: ").strip()
        if user_text.lower() in {"exit", "quit"}:
            print("Goodbye!")
            break
        try:
            await validate_message(user_text, metadata)
        except GuardrailError as e:
            print(f"[Guardrail] {e.reason}")
            continue
        prompt = assemble_prompt(metadata, history, user_text)
        try:
            reply = await call_openai(prompt)
        except Exception as e:
            print(f"[OpenAI Error] {e}")
            continue
        print(f"Agent: {reply}")
        history.append({"user": user_text, "bot": reply})

if __name__ == "__main__":
    asyncio.run(main()) 