# Marketing Agent Chatbot

A single-page, WhatsApp-style chatbot for marketing support, featuring:
- Clerk authentication
- Product metadata ingestion
- Guardrails (off-topic, competitor negativity, profanity)
- OpenAI integration
- Persistent chat history

## Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- Tailwind CSS & shadcn/ui
- Clerk React SDK

**Backend:**
- Python 3.11+ & FastAPI
- OpenAI Python SDK
- SQLite
- Custom Guardrails

## Project Structure

```
marketing-agent/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ChatWidget.tsx
│   └── tailwind.config.js
│
├── backend/
│   ├── main.py
│   ├── guardrails.py
│   ├── openai_client.py
│   ├── models.py
│   ├── db.py
│   └── input.json
│
├── docker-compose.yml
├── .env
└── README.md
```

## Setup

### Frontend
1. `cd frontend`
2. Install dependencies: `npm install`
3. Configure Clerk (see Clerk docs)
4. Run: `npm run dev`

### Backend
1. `cd backend`
2. Create virtualenv & activate
3. Install dependencies: `pip install -r requirements.txt`
4. Run: `uvicorn main:app --reload`

---

See `instructions/instructions.md` for full requirements and implementation steps. 