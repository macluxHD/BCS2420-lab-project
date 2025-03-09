const logger = require("./logger");
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const ws = require("ws");
const https = require("https");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { execSync } = require("child_process");

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

const dbPath = path.resolve(__dirname, "../../data/secure.db");
if (!fs.existsSync(dbPath)) {
  console.log("Populating database...");
  execSync("node ./src/back-end/populate-db.js", { stdio: "inherit" });
  console.log("Database populated.");
}

// Connect to SQLite database (or create if it doesn't exist)
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    logger.error(`Error connecting to database: ${err.message}`);
  } else {
    console.log("Connected to SQLite database");
  }
});

let privateKey;
if (fs.existsSync("./data/private.key")) {
  privateKey = fs.readFileSync("./data/private.key", "utf8");
} else {
  privateKey = crypto.randomBytes(64).toString("hex");
  fs.writeFileSync("./data/private.key", privateKey);
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Allow max 5 attempts per 15 minutes
  message: "Too many login attempts. Please try again later.",
  headers: true,
});

// Secure login (Using bcrypt for password comparison)
app.post("/login", loginLimiter, (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, row) => {
      if (err) {
        logger.error(`Database error: ${err.message}`);
        res.status(500).send("Database error");
        return;
      }

      if (!row) {
        res.status(401).send("Wrong credentials");
        return;
      }

      // Compare hashed password
      const isMatch = await bcrypt.compare(password, row.password);
      if (isMatch) {
        const expiry = 60 * 60; // 1 hour in seconds

        const token = jwt.sign({ username, isAdmin: row.isAdmin }, privateKey, {
          expiresIn: expiry,
        });

        res.cookie("token", token, {
          httpOnly: true, // Prevent access from JavaScript
          secure: true, // Only send over HTTPS
          sameSite: "Strict", // Prevent CSRF attacks
          maxAge: 1000 * expiry,
        });

        logger.info(`User ${username} logged in from ${req.ip}`);
        res.send(row.isAdmin == 1 ? "Login admin" : "Login successful");
      } else {
        logger.warn(`Failed login attempt for user ${username} from ${req.ip}`);
        res.status(401).send("Wrong credentials");
      }
    }
  );

  logger.info(`Login attempt for user ${username} from ${req.ip}`);
});

function authenticateToken(isAdmin = false) {
  return (req, res, next) => {
    const cookies = req.headers.cookie?.split(";") || [];

    let token = cookies.find((cookie) => cookie.trim().startsWith("token="));

    if (!token) return res.sendStatus(401);

    token = token.split("=")[1];

    jwt.verify(token, privateKey, (err, user) => {
      if (err) return res.sendStatus(403);

      if (isAdmin && !user.isAdmin) return res.sendStatus(403);

      req.user = user;
      next();
    });
  };
}

// Serve frontend files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "front-end", "index.html"));
});

app.get("/chat", authenticateToken(false), (req, res) => {
  res.sendFile(path.join(__dirname, "..", "front-end", "chat.html"));
});

app.get("/admin", authenticateToken(true), (req, res) => {
  res.sendFile(path.join(__dirname, "..", "front-end", "admin.html"));
});

app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.sendStatus(200);
});

// Create WebSocket server using the same HTTPS server instance
const wss = new ws.WebSocketServer({ server: httpsServer });

wss.on("connection", (client, req, res) => {
  const cookies = req.headers.cookie?.split(";") || [];

  let token = cookies.find((cookie) => cookie.trim().startsWith("token="));

  if (!token) return;

  token = token.split("=")[1];

  jwt.verify(token, privateKey, (err, user) => {
    if (err) return;

    console.log("Client connected !");
    client.on("message", (msg) => {
      console.log(`Message:${msg}`);
      broadcast(msg);
    });
  });
});

function broadcast(msg) {
  for (const client of wss.clients) {
    if (client.readyState === ws.OPEN) {
      client.send(msg);
    }
  }
}
