const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const ws = require("ws");
const https = require("https");

const app = express();

// the key is in *-key.pem and the certificte is in *.pem
const httpsServer = https.createServer(
  {
    key: fs.readFileSync(
      path.resolve(__dirname, "../../certs/localhost-key.pem")
    ),
    cert: fs.readFileSync(path.resolve(__dirname, "../../certs/localhost.pem")),
  },
  app
);
httpsServer.listen(3000, () =>
  console.log("HTTPS Server running on port 3000")
);
console.log("Connect to https://localhost:3000");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("src/front-end/public"));

// Define a middleware to redirect HTTP to HTTPS
function ensureSecure(req, res, next) {
  if (req.secure) {
    // Request is already secure (HTTPS)
    return next();
  }
  // Redirect to HTTPS version of the URL
  res.redirect("https://" + req.hostname + req.originalUrl);
}

// Use the middleware to enforce HTTPS
app.use(ensureSecure);

const dbPath = path.resolve(__dirname, "../../data/vulnerable.db");
if (!fs.existsSync(dbPath)) {
  require("./populate-db");
}

// Connect to SQLite database (or create if it doesn't exist)
const db = new sqlite3.Database(
  dbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error(err.message);
      console.error("Resolved DB Path:", dbPath);
    } else {
      console.log("Connected to SQLite database");
    }
  }
);

// Vulnerable login (SQL Injection possible)
app.post("/login", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let query = `SELECT * FROM users WHERE username='${username}' AND password='${password}';`;
  console.log("Executing SQL Query:", query);

  db.exec(query, function (err) {
    if (err) {
      console.error("SQL Error:", err.message);
      res.status(500).send("Database error");
      return;
    }

    // Check if authentication still works
    // MY CHANGES START HERE!!!!!!!!
    db.get(
      `SELECT * FROM users WHERE username = ?;`,
      [username],
      (err, row) => {
        if (err) {
          console.error("SQL Error:", err.message);
          res.status(500).send("Database error");
          return;
        }
        console.log("Row:", row);
        // console.log("Row Username:", row.username);
        // console.log("Row Password:", row.password);

        console.log(row);

        if (!row) {
          res
            .status(400)
            .send(`Username <code>${username}</code> does not exist.`);
          return;
        }

        //TODO: we check if row.password == password that was inputted into the website
        if (row.username == username && row.password == password) {
          if (row.isAdmin == 1) {
            res.send("Login admin");
          } else {
            res.send("Login successful");
          }
        }
      }
    );
  });
});
// Vulnerable signup (SQL Injection possible)
// app.post('/signup', (req, res) => {
//     let username = req.body.username;
//     let password = req.body.password;
//     let query = `INSERT INTO users (username, password) VALUES ('${username}', '${password}');`;
//     console.log("Executing SQL Query:", query);

//     db.exec(query, function (err) {
//         if (err) {
//             console.error("SQL Error:", err.message);
//             res.status(500).send('Database error');
//             return;
//         }
//         res.send('Signup successful');
//     });
// });

// Unauthenticated API endpoint (exposes user data)
app.get("/users", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      res.status(500).send("Database error");
      return;
    }
    res.json(rows);
  });
});

// Serve frontend files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "front-end", "index.html"));
});

// app.get('/signup', (req, res) => {
//     res.sendFile(path.join(__dirname, '..', 'front-end', 'signup.html'));
// });

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "front-end", "chat.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "front-end", "admin.html"));
});

// Create WebSocket server using the same HTTPS server instance
const wss = new ws.WebSocketServer({ server: httpsServer });

wss.on("connection", (client) => {
  console.log("Client connected !");
  client.on("message", (msg) => {
    console.log(`Message:${msg}`);
    broadcast(msg);
  });
});

function broadcast(msg) {
  for (const client of wss.clients) {
    if (client.readyState === ws.OPEN) {
      client.send(msg);
    }
  }
}
