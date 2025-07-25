import asyncio
import uuid
import time
from db import create_user, get_user_by_id, get_user_by_email, update_user_profile, create_goal, get_goals_by_user, update_goal_progress, create_badge, get_badges_by_user

async def test_user_functions():
    user_id = str(uuid.uuid4())
    name = "Priya"
    email = "priya@example.com"
    password = "hashedpassword123"
    region = "IN"
    language = "hi"
    accessibility = "tts"
    persona = "Gen Z"

    print("Creating user...")
    await create_user(user_id, name, email, password, region, language, accessibility, persona)
    print(f"User {user_id} created.")

    print("Retrieving user by ID...")
    user_by_id = await get_user_by_id(user_id)
    print("User by ID:", user_by_id)

    print("Retrieving user by email...")
    user_by_email = await get_user_by_email(email)
    print("User by email:", user_by_email)

    print("Updating user profile...")
    await update_user_profile(user_id, region="US", language="en", accessibility="stt", persona="Elderly")
    updated_user = await get_user_by_id(user_id)
    print("Updated user:", updated_user)

    print("\nCreating a financial goal...")
    goal_id = str(uuid.uuid4())
    await create_goal(goal_id, user_id, "Save for car", 100000, int(time.time()) + 60*60*24*365, 0)
    print(f"Goal {goal_id} created.")

    print("Retrieving goals for user...")
    goals = await get_goals_by_user(user_id)
    print("Goals:", goals)

    print("Updating goal progress...")
    await update_goal_progress(goal_id, 25000)
    updated_goals = await get_goals_by_user(user_id)
    print("Updated goals:", updated_goals)

    print("\nAwarding a badge...")
    badge_id = str(uuid.uuid4())
    await create_badge(badge_id, user_id, "First Goal Set", int(time.time()))
    print(f"Badge {badge_id} awarded.")

    print("Retrieving badges for user...")
    badges = await get_badges_by_user(user_id)
    print("Badges:", badges)


if __name__ == "__main__":
    asyncio.run(test_user_functions()) 