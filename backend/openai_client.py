import openai
# This creates a single, reusable async client instance.
# It automatically reads your OPENAI_API_KEY from the .env file.
client = openai.AsyncOpenAI()

def assemble_prompt(metadata: dict, history: list, user_text: str) -> list:
    """
    Creates the full prompt for the LLM, including system instructions,
    conversation history, and the latest user message.
    """
    system_message = {
        "role": "system",
        "content": f"""You are a helpful and friendly marketing assistant for a product named '{metadata.get('productName', 'our product')}'.
Your goal is to answer user questions and encourage them to try the product based on these details:
Product Description: {metadata.get('description', '')}
Key Features: {', '.join(metadata.get('features', []))}
Stay on topic and be positive."""
    }

    messages = [system_message]

    # Add the past conversation history
    for exchange in history:
        if 'user' in exchange and 'bot' in exchange:
            messages.append({"role": "user", "content": exchange['user']})
            messages.append({"role": "assistant", "content": exchange['bot']})

    # Add the new user message
    messages.append({"role": "user", "content": user_text})

    return messages


async def call_openai(prompt: list) -> str:
    """
    Sends the prompt to the OpenAI API and returns the bot's reply.
    """
    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=prompt,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"An error occurred with the OpenAI API call: {e}")
        raise