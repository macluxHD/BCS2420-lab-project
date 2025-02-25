const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const dbFile = "./data/secure.db";
const saltRounds = 10; // Adjust for security vs. performance. The higher the number, the more secure but slower.

// Delete existing database file to overwrite
if (fs.existsSync(dbFile)) {
  fs.unlinkSync(dbFile);
  console.log(`Old database '${dbFile}' has been deleted.`);
}

const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error("Error creating database:", err.message);
  } else {
    console.log(`New database '${dbFile}' has been created.`);
  }
});

// Function to hash passwords and insert them into the database
async function setupDatabase() {
  try {
    const hashedPasswords = await Promise.all([
      bcrypt.hash(
        "0rvppIo&hQW7THE28A5#oUb!Go1DJ$#6c9L8Q&gd8bGpSwfPcak*Af&r",
        saltRounds
      ),
      bcrypt.hash(
        "y6zr1#E1^OAPpAEBlHasD%1pOQQ@VFLgU4tlo#ogwAKLJDHyyR1BsL5L^Aec",
        saltRounds
      ),
      bcrypt.hash(
        "wDjJC@uNU1NU1*mTyeGjRbPh%v@D#mqsKUsH8WxWA9@Obs^p@r^cc^JxqG",
        saltRounds
      ),
      bcrypt.hash(
        "Z!BrZyo97aLi%8PH8747*r0J%qBtn^F32Iv&TkSno#6zGLSR2Pb6M2E&r@ait*gcd#",
        saltRounds
      ),
    ]);

    const sqlScript = `
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        isAdmin INTEGER DEFAULT 0
      );

      INSERT INTO users (username, password, isAdmin) VALUES
      ('admin', '${hashedPasswords[0]}', 1), 
      ('user1', '${hashedPasswords[1]}', 0),
      ('username', '${hashedPasswords[2]}', 0),
      ('user2', '${hashedPasswords[3]}', 0);
    `;

    db.exec(sqlScript, (err) => {
      if (err) {
        console.error("Error executing SQL script:", err.message);
      } else {
        console.log("Database tables created and populated successfully!");
      }
      db.close();
    });
  } catch (error) {
    console.error("Error hashing passwords:", error);
    db.close();
  }
}

setupDatabase();
