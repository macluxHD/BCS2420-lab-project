import sqlite3

# Load the database
db_file = "vulnerable.db"  # Change this to the correct path if needed
conn = sqlite3.connect(db_file)
cursor = conn.cursor()

print(f"Connected to {db_file} successfully!")

import sqlite3

# Load the database
db_file = "vulnerable.db"  # Change this to the correct path if needed
conn = sqlite3.connect(db_file)
cursor = conn.cursor()

print(f"Connected to {db_file} successfully!")

cursor.execute("SELECT * FROM users")
rows = cursor.fetchall()

print("\nData in 'users' table:")
for row in rows:
    print(row)
