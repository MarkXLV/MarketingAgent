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

            -- Users table: stores user profile and preferences
            CREATE TABLE IF NOT EXISTS users (
                userId         TEXT PRIMARY KEY,
                name           TEXT NOT NULL,
                email          TEXT NOT NULL,
                password       TEXT NOT NULL,
                region         TEXT,
                language       TEXT,
                accessibility  TEXT,
                persona        TEXT
            );

            -- Goals table: stores user financial goals
            CREATE TABLE IF NOT EXISTS goals (
                goalId        TEXT PRIMARY KEY,
                userId        TEXT NOT NULL,
                goal_type     TEXT NOT NULL,
                target_amount REAL,
                deadline      INTEGER,
                progress      REAL,
                FOREIGN KEY(userId) REFERENCES users(userId)
            );

            -- Badges table: stores gamification achievements
            CREATE TABLE IF NOT EXISTS badges (
                badgeId      TEXT PRIMARY KEY,
                userId       TEXT NOT NULL,
                badge_name   TEXT NOT NULL,
                date_awarded INTEGER,
                FOREIGN KEY(userId) REFERENCES users(userId)
            );
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

async def create_user(userId: str, name: str, email: str, password: str, region: str = None, language: str = None, accessibility: str = None, persona: str = None):
    """Insert a new user into the users table."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT INTO users (userId, name, email, password, region, language, accessibility, persona)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (userId, name, email, password, region, language, accessibility, persona)
        )
        await db.commit()

async def get_user_by_id(userId: str) -> Optional[Dict]:
    """Retrieve a user by userId."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM users WHERE userId = ?",
            (userId,)
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None

async def get_user_by_email(email: str) -> Optional[Dict]:
    """Retrieve a user by email."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM users WHERE email = ?",
            (email,)
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None

async def update_user_profile(userId: str, region: str = None, language: str = None, accessibility: str = None, persona: str = None):
    """Update user profile fields (region, language, accessibility, persona)."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            UPDATE users
            SET region = COALESCE(?, region),
                language = COALESCE(?, language),
                accessibility = COALESCE(?, accessibility),
                persona = COALESCE(?, persona)
            WHERE userId = ?
            """,
            (region, language, accessibility, persona, userId)
        )
        await db.commit()

async def create_goal(goalId: str, userId: str, goal_type: str, target_amount: float = None, deadline: int = None, progress: float = None):
    """Insert a new financial goal for a user."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT INTO goals (goalId, userId, goal_type, target_amount, deadline, progress)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (goalId, userId, goal_type, target_amount, deadline, progress)
        )
        await db.commit()

async def get_goals_by_user(userId: str) -> List[Dict]:
    """Retrieve all goals for a user."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM goals WHERE userId = ? ORDER BY deadline ASC",
            (userId,)
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

async def update_goal_progress(goalId: str, progress: float):
    """Update the progress of a goal."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE goals SET progress = ? WHERE goalId = ?",
            (progress, goalId)
        )
        await db.commit()

async def create_badge(badgeId: str, userId: str, badge_name: str, date_awarded: int):
    """Award a badge to a user."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT INTO badges (badgeId, userId, badge_name, date_awarded)
            VALUES (?, ?, ?, ?)
            """,
            (badgeId, userId, badge_name, date_awarded)
        )
        await db.commit()

async def get_badges_by_user(userId: str) -> List[Dict]:
    """Retrieve all badges for a user."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM badges WHERE userId = ? ORDER BY date_awarded DESC",
            (userId,)
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]