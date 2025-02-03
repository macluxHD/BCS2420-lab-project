// Run this script to create vulnerable.db. This overwrites the existing database.

const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Name
const dbFile = 'vulnerable.db';

// Delete existing database file to overwrite
if (fs.existsSync(dbFile)) {
    fs.unlinkSync(dbFile);  // Deletes the file
    console.log(`Old database '${dbFile}' has been deleted.`);
}

// Create a new database
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('Error creating database:', err.message);
    } else {
        console.log(`New database '${dbFile}' has been created.`);
    }
});

const sqlScript = `
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
);

INSERT INTO users (username, password) VALUES
('admin', 'password123'), 
('user1', '123456'),
('username', 'password'),
('user2', 'qwerty');
`;

db.exec(sqlScript, (err) => {
    if (err) {
        console.error('Error executing SQL script:', err.message);
    } else {
        console.log('Database tables created and populated successfully!');
    }
    db.close();
});
