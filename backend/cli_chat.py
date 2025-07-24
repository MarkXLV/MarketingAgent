import sys
from .guardrails import validate_message, GuardrailError
from openai_client import assemble_prompt, call_openai
from .metadata import load_metadata, METADATA_PATH


def main():
    print("Welcome to the Marketing Agent CLI! Type 'exit' to quit.")
    metadata = load_metadata(METADATA_PATH)
    history = []  # List of {user: str, bot: str}
    while True:
        user_text = input("You: ").strip()
        if user_text.lower() in {"exit", "quit"}:
            print("Goodbye!")
            break
        try:
            validate_message(user_text, metadata)
        except GuardrailError as e:
            print(f"[Guardrail] {e.reason}")
            continue
        prompt = assemble_prompt(metadata, history, user_text)
        try:
            reply = call_openai(prompt)
        except Exception as e:
            print(f"[OpenAI Error] {e}")
            continue
        print(f"Agent: {reply}")
        history.append({"user": user_text, "bot": reply})

if __name__ == "__main__":
    main() 