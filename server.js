const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('./messages.db');

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Handle contact form POST
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    db.run(
        `INSERT INTO messages (name, email, message) VALUES (?, ?, ?)`,
        [name, email, message],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID });
        }
    );
});

// Get all messages (admin use)
app.get('/api/messages', (req, res) => {
    db.all(`SELECT * FROM messages ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Fallback for client-side routing (only for non-API requests)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));