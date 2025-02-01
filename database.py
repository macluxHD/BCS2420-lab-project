import sqlite3

# Create or connect to an SQLite database file
db_file = "vulnerable.db"
conn = sqlite3.connect(db_file)
cursor = conn.cursor()

# SQLite-compatible SQL commands
sql_script = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
);

INSERT INTO users (username, password) VALUES
('admin', 'password123'), 
('user1', '123456'),
('username', 'password'),
('user2', 'qwerty');
"""

# Execute the SQL commands
cursor.executescript(sql_script)

# Commit and close the connection
conn.commit()
conn.close()

print(f"Database '{db_file}' has been created successfully!")
