import json
from .openai_client import client # Import the shared async client

class GuardrailError(Exception):
    def __init__(self, reason):
        super().__init__(reason)
        self.reason = reason

# --- Moderation API (Async) ---
async def check_moderation(user_text: str):
    """Checks the user message against OpenAI's moderation endpoint."""
    resp = await client.moderations.create(input=user_text)
    flagged = resp.results[0].flagged
    if flagged:
        for category, is_flagged in resp.results[0].categories.items():
            if is_flagged:
                raise GuardrailError(f"Message violates moderation policy: {category}")
    return True

# --- LLM Zero-shot On-topic Classifier (Async) ---
async def llm_validate_topic(user_text: str, product_name: str, product_desc: str) -> bool:
    """Uses an LLM to validate if the user's message is on-topic."""
    system = """
You are an expert classifier for a marketing chatbot. Decide if a user's message is ON-TOPIC (about our product, its features, use cases, or support) or OFF-TOPIC (not related to our product, or about competitors, or inappropriate).

- ON-TOPIC: Any question or statement about the product, its features, pricing, support, integrations, what it does, or anything that helps the user understand or use the product. This includes generic questions like "tell me about your product", "what do you do?", "how can you help me?", etc.
- OFF-TOPIC: Personal questions, jokes, unrelated topics, competitor comparisons, or anything not about our product.
- GREETINGS: If the message is a greeting (e.g., "hi", "hello"), treat as ON-TOPIC but suggest asking about the product.
- COMPETITOR: If the message mentions a competitor, treat as OFF-TOPIC and explain why.

Respond ONLY in this JSON format:
{ "on_topic": true/false, "reason": "..." }
"""
    user = f"""
Product: {product_name}
Description: {product_desc}

User Message: \"{user_text}\"
"""
    resp = await client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ],
        temperature=0.0,
        max_tokens=100,
        response_format={"type": "json_object"} # Use JSON mode for reliable output
    )
    
    result = json.loads(resp.choices[0].message.content)
    if not result["on_topic"]:
        raise GuardrailError(result["reason"])
    return True

# --- Unified Guardrail Entry Point (Async) ---
async def validate_message(user_text: str, metadata: dict):
    """Runs all guardrail checks."""
    await check_moderation(user_text)
    await llm_validate_topic(
        user_text,
        product_name=metadata["productName"],
        product_desc=metadata["description"]
    )
    return True