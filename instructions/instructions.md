# Marketing Agent Chatbot: Process & Requirements

---

## 1. Project Overview

A single-page, WhatsApp-style chatbot that:

- **Authenticates** via Clerk  
- **Loads** product metadata from `input.json`  
- **Sends** user messages + metadata to a Python FastAPI backend  
- **Enforces Guardrails** (no off-topic, no competitor negativity, no profanity)  
- **Calls** OpenAI API for responses  
- **Persists** full chat history per user/session  
- **Minimizes** file count; two main folders (`frontend/` + `backend/`) 

---

## 2. Key Flow & Feature Checklist

| Step                           | Description & Acceptance Criteria                                      | Status |
|--------------------------------|-------------------------------------------------------------------------|--------|
| **1. User Authentication**     | – Sign up / Sign in via Clerk <br> – JWT must be validated on API calls | ☐      |
| **2. Metadata Ingestion**      | – Load `input.json` at startup <br> – Cache in backend for quick access | ☐      |
| **3. Chat UI (WhatsApp-style)**| – Single page (`ChatWidget`) <br> – Full-height message list + input bar <br> – Auto-scroll on new message | ☐      |
| **4. Guardrails Enforcement**  | – Reject or sanitize messages that: <br> • Deviate off-topic <br> • Attack competitors <br> • Use profanity | ☐      |
| **5. OpenAI Integration**      | – Build prompt template with: <br> • Product metadata <br> • Conversation history <br> – Receive & return API response | ☐      |
| **6. Persistence**             | – Store each Q&A in PostgreSQL <br> – Structure: User → Session → Message | ☐      |
| **7. Session Management**      | – "New Chat" resets context <br> – Sessions expire after idle timeout   | ☐      |
| **8. Error Handling & Logs**   | – Graceful UI errors for API or guardrail failures <br> – Structured backend logs | ☐      |

---

## 3. Tech Stack

### Frontend
- Next.js 14 (App Router)  
- Tailwind CSS & shadcn/ui  
- Lucide Icons  
- Clerk React SDK  

### Backend
- Python 3.11+ & FastAPI  
- OpenAI Python SDK  
- sqllite 
- Guardrails Module (custom + OpenAI Moderation)  


---

## 4. Minimal Folder Layout

```
marketing-agent/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx            ← single ChatWidget page
│   ├── components/
│   │   └── ChatWidget.tsx
│   └── tailwind.config.js
│
├── backend/
│   ├── main.py                 ← single `/chat` endpoint
│   ├── guardrails.py
│   ├── openai_client.py
│   ├── models.py               ← User, Session, Message
│   ├── db.py
│   └── input.json
│
├── docker-compose.yml
├── .env
└── README.md
```

---

## 5. Step-by-Step Build & Verification

Here's a detailed, step-by-step implementation plan for each of your build-and-verify sections:

---

### 1. Authentication

#### 1.1 Integrate Clerk on Frontend

1. **Install SDK**
   - Add `@clerk/nextjs` via npm/Yarn.

2. **Wrap App**
   - In `app/layout.tsx`, wrap your `<html>` tree in `<ClerkProvider>`.

3. **Protect Chat Page**
   - Use Clerk's `withAuth` or `<SignedIn>`/`<SignedOut>` helpers to gate `page.tsx`.

4. **Expose Token Hook**
   - In your `lib/clerk.ts`, export a helper to fetch the current user's JWT (e.g. `getToken()`).

#### 1.2 Verify JWT on `/chat` Calls

1. **Extract Header**
   - In `backend/main.py`, read the `Authorization: Bearer <token>` header.

2. **Call Clerk**
   - Use Clerk's Python SDK or a REST call to validate the token and fetch the user ID.

3. **Reject Missing/Invalid**
   - If token validation fails, return HTTP 401 with `{ error: "Unauthorized" }`.

4. **Pass User Context**
   - On success, attach the verified `user_id` to the request context for downstream use.

---

### 2. Metadata Loader

#### 2.1 Place `input.json` in Backend

1. **Create File**
   - Drop your canonical `input.json` under `backend/`.

2. **Define Schema**
   - Document the expected keys (e.g. `productName`, `features`, `tone`, etc.).

#### 2.2 Load & Cache on Startup

1. **Startup Hook**
   - In `main.py`, before serving, read and parse `input.json`.

2. **In-Memory Cache**
   - Store the parsed object in a module-level variable or a simple LRU cache.

3. **Error on Missing/Invalid**
   - If parsing fails, log an error and exit (so you catch typos early).

4. **Expose Getter**
   - Provide a function `get_metadata()` that controllers call to inject into prompts.

---

### 3. UI Shell

#### 3.1 Scaffold `ChatWidget`

1. **Component Structure**
   - Create `ChatWidget.tsx` with two parts:
     - `<MessageList messages={…} />`
     - `<ChatInput onSend={…} />`

2. **State Management**
   - Inside `ChatWidget`, hold an array of `{ from: "user"|"bot", text, ts }`.

3. **API Hook**
   - Write a `sendMessage(text)` function that POSTs to `/api/chat` and appends both question and answer to state.

#### 3.2 Style to Mimic WhatsApp Layout

1. **Container**
   - `flex flex-col h-screen bg-gray-50`

2. **MessageList**
   - `overflow-auto p-4 flex-1`
   - Bubble wrappers: user = `self-end bg-green-200`, bot = `self-start bg-white`

3. **Input Bar**
   - `border-t p-2 flex items-center`
   - Text input expands up to 3 lines; "Send" button on the right.

4. **Auto-Scroll**
   - After each new message, scroll the list container to its bottom.

---

### 4. Guardrails

#### 4.1 Implement Checks in `guardrails.py`

1. **Define Rules**
   - Off-topic: compare user text against allowed keyword set.
   - Competitor negativity: flag any mention of known competitor names with negative adjectives.
   - Profanity: integrate a word-list or use OpenAI Moderation API.

2. **Single Entry Point**
   - Expose `validate_message(user_text)` that either returns `True` or raises a `GuardrailError` with reason.

#### 4.2 Write Unit Tests

1. **Test Cases**
   - Off-topic phrase → expect failure.
   - "Our rival X sucks" → expect failure.
   - "damn, crazy" → profanity failure.
   - "Tell me more about feature Y" → pass.

2. **Automate**
   - Use pytest to verify each rule and ensure new changes don't regress.

---

### 5. OpenAI Hook

#### 5.1 Build Prompt Assembler in `openai_client.py`

1. **Template File**
   - Draft a multi-section template with placeholders for metadata, history, and user query.

2. **Function**
   - `assemble_prompt(metadata, history, user_text) → str`

3. **API Caller**
   - `call_openai(prompt) → reply_text` wrapping the OpenAI ChatCompletion call.

#### 5.2 Test with Static Inputs

1. **Hardcode Metadata & History**
   - In an ad-hoc script, load real metadata, a short fake conversation, and one test query.

2. **Console-Log**
   - Print the assembled prompt and then the returned model reply.

3. **Verify Tone**
   - Ensure the output does not violate guardrails (if possible).

---

### 6. Persistence

#### 6.1 Define SQLlite Schema in Models

1. **User**: `id`, `clerk_user_id`, `created_at`
2. **Session**: `id`, `user_id (fk)`, `started_at`, `last_activity`
3. **Message**: `id`, `session_id (fk)`, `from_user (bool)`, `text`, `timestamp`


---

### 7. Session Controls

#### 7.1 "New Chat" Button Clears Context

1. **Frontend**
   - Add a "🆕 New Chat" action in `ChatWidget`.
   - On click: reset local message array & request a new `session_id` from backend.

2. **Backend**
   - `/chat` sees a new `session_id` → automatically creates a fresh Session row.

#### 7.2 Idle Timeout Logic

1. **Configuration**
   - Define an idle threshold (e.g. 30 minutes).

2. **Middleware**
   - On each `/chat` call, compare now − `session.last_activity`.
   - If > threshold, reject and return "Session expired, please start a new chat."

3. **Frontend Handling**
   - Detect this error and show a banner prompting user to click "New Chat."

---

### 8. Error & Logging

#### 8.1 Set Up Structured Logs (JSON)

1. **Logger Config**
   - In `main.py`, configure Python's `logging` to emit JSON with fields: timestamp, level, user_id, session_id, message.

2. **Log Points**
   - On guardrail violations, OpenAI errors, DB errors, and normal `/chat` entry/exit.

#### 8.2 Display User-Friendly Error Banners

1. **Frontend**
   - In `ChatWidget`, wrap API call in try/catch.
   - On error, append a system bubble:
     > "⚠️ Oops, something went wrong: [short message]."

2. **Retry Option**
   - For network or rate-limit errors, include a "Retry" button under the banner.

---

Follow these exact sequences, verifying each sub-step before moving on. This guarantees you can tick off every feature as it's built and ensure correctness before layering on the next. Good luck!