const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const db = new sqlite3.Database('./yolei.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    // Create visits table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip TEXT,
      user_agent TEXT
    )`);
  }
});

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  // Record visit
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';

  db.run('INSERT INTO visits (ip, user_agent) VALUES (?, ?)', [clientIP, userAgent], (err) => {
    if (err) {
      console.error('Error recording visit:', err);
    }
  });

  // Get visit stats
  db.get('SELECT COUNT(*) as total_visits FROM visits', (err, row) => {
    if (err) {
      console.error('Error getting visit count:', err);
      res.render('index', {
        totalVisits: 0,
        error: 'Database error'
      });
    } else {
      res.render('index', {
        totalVisits: row.total_visits,
        error: null
      });
    }
  });
});

// API endpoint to get recent visits
app.get('/api/visits', (req, res) => {
  db.all('SELECT * FROM visits ORDER BY timestamp DESC LIMIT 20', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// API endpoint to get visit statistics
app.get('/api/stats', (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total FROM visits',
    'SELECT COUNT(DISTINCT ip) as unique_ips FROM visits',
    'SELECT timestamp FROM visits ORDER BY timestamp DESC LIMIT 1'
  ];

  Promise.all(queries.map(query =>
    new Promise((resolve, reject) => {
      db.get(query, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    })
  )).then(([total, unique, latest]) => {
    res.json({
      total_visits: total.total,
      unique_visitors: unique.unique_ips,
      last_visit: latest ? latest.timestamp : null
    });
  }).catch(err => {
    res.status(500).json({ error: err.message });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Yolei WebApp running on http://localhost:${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
