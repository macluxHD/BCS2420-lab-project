const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Database connection (intentionally vulnerable)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'vulnerable_db'
});
db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// Vulnerable login (SQL Injection possible)
app.post('/login', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
    
    db.query(query, (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            res.send('Login successful');
        } else {
            res.send('Invalid credentials');
        }
    });
});

// Unauthenticated API endpoint (exposes user data)
app.get('/getUsers', (req, res) => {
    db.query('SELECT * FROM users', (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// Serve frontend files
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
