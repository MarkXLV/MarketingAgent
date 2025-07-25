import json
from .openai_client import client # Import the shared async client
import re

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

# --- Sensitive Info Detection ---
SENSITIVE_PATTERNS = [
    r"account number", r"credit card", r"debit card", r"cvv", r"ssn", r"social security", r"aadhaar", r"pan card", r"password", r"pin", r"sort code", r"iban", r"ifsc", r"routing number", r"passcode"
]

def contains_sensitive_info(text: str) -> str:
    for pattern in SENSITIVE_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return pattern
    return None

# --- LLM-based Direct Advice Detection ---
async def llm_detect_direct_advice(user_text: str) -> bool:
    """Uses LLM to detect if the user is asking for direct financial/investment advice."""
    system = (
        "You are a compliance classifier for a financial chatbot. "
        "If the user's message is a request for direct financial or investment advice (e.g., 'Should I buy this stock?', 'Where should I invest?', 'Tell me exactly what to do with my money'), respond with {\"direct_advice\": true, ...}. "
        "If not, respond with {\"direct_advice\": false, ...}. "
        "Always use JSON."
    )
    user = f"User Message: {user_text}"
    resp = await client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ],
        temperature=0.0,
        max_tokens=60,
        response_format={"type": "json_object"}
    )
    result = json.loads(resp.choices[0].message.content)
    return result.get("direct_advice", False)

# --- Financial Topic Validation ---
async def is_financial_topic(user_text: str) -> tuple[bool, str]:
    """Check if the user's message is related to financial topics or acceptable conversation starters."""
    system = (
        "You are a topic classifier for a financial coaching chatbot. "
        "Determine if the user's message is acceptable for a financial coach to respond to. "
        "ALLOW these types of messages:\n"
        "- Financial topics: budgeting, saving money, investing, retirement planning, taxes, loans, credit cards, financial goals, debt management, etc.\n"
        "- Greetings and conversation starters: 'hi', 'hello', 'how are you', 'good morning', etc.\n"
        "- Introduction requests: 'who are you', 'what can you help with', 'tell me about yourself'\n"
        "- General financial wellness: 'how to improve my finances', 'financial tips', etc.\n\n"
        "REJECT these types of messages:\n"
        "- Programming questions, coding, technical issues\n"
        "- Math problems unrelated to finance (like prime numbers, algebra homework)\n"
        "- Recipes, cooking, health advice\n"
        "- General knowledge questions unrelated to finance\n"
        "- Entertainment, sports, weather (unless asking about financial impact)\n\n"
        "Respond with {\"is_financial\": true} if acceptable, or {\"is_financial\": false, \"reason\": \"brief explanation\"} if not acceptable. "
        "Always use JSON."
    )
    user = f"User Message: {user_text}"
    resp = await client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ],
        temperature=0.0,
        max_tokens=100,
        response_format={"type": "json_object"}
    )
    result = json.loads(resp.choices[0].message.content)
    is_financial = result.get("is_financial", False)
    reason = result.get("reason", "This topic is not related to financial coaching.")
    return is_financial, reason

# --- Unified Guardrail Entry Point (Async) ---
async def validate_message(user_text: str, metadata: dict):
    """Runs all guardrail checks."""
    # 1. Sensitive info check
    sensitive = contains_sensitive_info(user_text)
    if sensitive:
        raise GuardrailError(f"For your security, please do not share sensitive information like {sensitive} here.")

    # 2. Financial topic check
    is_financial, reason = await is_financial_topic(user_text)
    if not is_financial:
        raise GuardrailError(f"I'm a financial coach and can only help with financial topics. {reason} Please ask me about budgeting, saving, investing, or other financial matters!")

    # 3. LLM-based direct advice check
    if await llm_detect_direct_advice(user_text):
        raise GuardrailError("I can't provide direct financial or investment advice. For personalized recommendations, please consult a certified financial advisor.")

    # 4. OpenAI moderation
    await check_moderation(user_text)
    
    return True