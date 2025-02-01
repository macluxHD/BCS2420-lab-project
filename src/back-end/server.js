const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const res = require('express/lib/response');
const ws = require('ws')

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('src/front-end'));

// Connect to SQLite database (or create if it doesn't exist)
const db = new sqlite3.Database('vulnerable.db', (err) => {
    if (err) {
        console.error('Failed to connect to SQLite:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Vulnerable login (SQL Injection possible)
app.post('/login', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`; // SQL Injection Vulnerability

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).send('Database error');
            return;
        }
        if (rows.length > 0) {
            res.send('Login successful');
        } else {
            res.send('Invalid credentials');
        }
    });
});

// Unauthenticated API endpoint (exposes user data)
app.get('/getUsers', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            res.status(500).send('Database error');
            return;
        }
        res.json(rows);
    });
});

// Serve frontend files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'front-end', 'index.html'));
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

const wss = new ws.WebSocketServer({ port: 4000}) // (2)
wss.on('connection', (client) => {
    console.log('Client connected !')
    client.on('message', (msg) => {    // (3)
        console.log(`Message:${msg}`);
        broadcast(msg)
    })
})
function broadcast(msg) {       // (4)
    for (const client of wss.clients) {
        if (client.readyState === ws.OPEN) {
            client.send(msg)
        }
    }
}
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'front-end', 'chat.html'));
});