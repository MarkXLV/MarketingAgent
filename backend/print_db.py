import sqlite3

conn = sqlite3.connect('chat_history.db')
c = conn.cursor()

print("Conversations:")
for row in c.execute("SELECT * FROM conversations"):
    print(row)

print("\nMessages:")
for row in c.execute("SELECT * FROM messages"):
    print(row) 