import sqlite3
import os
from typing import List, Dict, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), 'chat_history.db')

conn = sqlite3.connect(DB_PATH, check_same_thread=False)
c = conn.cursor()

# Create tables if not exist
c.executescript('''
CREATE TABLE IF NOT EXISTS conversations (
    convoId   TEXT PRIMARY KEY,
    userId    TEXT NOT NULL,
    startedAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS messages (
    msgId    TEXT PRIMARY KEY,
    convoId  TEXT NOT NULL,
    author   TEXT NOT NULL CHECK(author IN ('user','assistant')),
    content  TEXT NOT NULL,
    ts       INTEGER NOT NULL,
    FOREIGN KEY(convoId) REFERENCES conversations(convoId)
);
CREATE INDEX IF NOT EXISTS idx_msgs_convo ON messages(convoId, ts);
''')
conn.commit()

def save_conversation_start(convoId: str, userId: str, startedAt: int):
    c.execute(
        "INSERT OR IGNORE INTO conversations (convoId, userId, startedAt) VALUES (?, ?, ?)",
        (convoId, userId, startedAt)
    )
    conn.commit()

def save_message(convoId: str, msg: Dict):
    c.execute(
        "INSERT INTO messages (msgId, convoId, author, content, ts) VALUES (?, ?, ?, ?, ?)",
        (msg['id'], convoId, msg['author'], msg['content'], msg['ts'])
    )
    conn.commit()

def get_conversations(userId: str) -> List[Dict]:
    rows = c.execute(
        "SELECT convoId, startedAt FROM conversations WHERE userId = ? ORDER BY startedAt DESC",
        (userId,)
    ).fetchall()
    return [{'convoId': row[0], 'startedAt': row[1]} for row in rows]

def get_messages(convoId: str) -> List[Dict]:
    rows = c.execute(
        "SELECT author, content, ts FROM messages WHERE convoId = ? ORDER BY ts ASC",
        (convoId,)
    ).fetchall()
    return [{'author': row[0], 'content': row[1], 'ts': row[2]} for row in rows] 