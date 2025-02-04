// Run this script to check what is in vulnerable.db
const sqlite3 = require('sqlite3').verbose();

// Database file
const dbFile = './data/vulnerable.db';

// Load the database
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log(`Connected to '${dbFile}' successfully!`);
        
        // Fetch all users
        db.all("SELECT * FROM users", [], (err, rows) => {
            if (err) {
                console.error('Error retrieving data:', err.message);
            } else {
                console.log("\nData in 'users' table:");
                rows.forEach(row => console.log(row));
            }

            db.close();
        });
    }
});
