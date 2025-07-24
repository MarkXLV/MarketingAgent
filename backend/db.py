# In backend/db.py

import aiosqlite
import os
from typing import List, Dict, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), 'chat_history.db')

async def initialize_db():
    """Creates database tables if they don't exist."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript('''
            CREATE TABLE IF NOT EXISTS conversations (
                convoId   TEXT PRIMARY KEY,
                userId    TEXT NOT NULL,
                startedAt INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS messages (
                msgId     TEXT PRIMARY KEY,
                convoId   TEXT NOT NULL,
                author    TEXT NOT NULL CHECK(author IN ('user','assistant')),
                content   TEXT NOT NULL,
                ts        INTEGER NOT NULL,
                FOREIGN KEY(convoId) REFERENCES conversations(convoId)
            );
            CREATE INDEX IF NOT EXISTS idx_msgs_convo ON messages(convoId, ts);
        ''')
        await db.commit()

async def save_conversation_start(convoId: str, userId: str, startedAt: int):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT OR IGNORE INTO conversations (convoId, userId, startedAt) VALUES (?, ?, ?)",
            (convoId, userId, startedAt)
        )
        await db.commit()

async def save_message(convoId: str, msg: Dict):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO messages (msgId, convoId, author, content, ts) VALUES (?, ?, ?, ?, ?)",
            (msg['id'], convoId, msg['author'], msg['content'], msg['ts'])
        )
        await db.commit()

async def get_conversations(userId: str) -> List[Dict]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT convoId, startedAt FROM conversations WHERE userId = ? ORDER BY startedAt DESC",
            (userId,)
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

async def get_messages(convoId: str) -> List[Dict]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT author, content, ts FROM messages WHERE convoId = ? ORDER BY ts ASC",
            (convoId,)
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

async def get_conversation_owner(convoId: str) -> Optional[str]:
    """Fetches the userId for a given convoId to verify ownership."""
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT userId FROM conversations WHERE convoId = ?",
            (convoId,)
        ) as cursor:
            row = await cursor.fetchone()
            return row[0] if row else None