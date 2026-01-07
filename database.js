const sqlite3 = require('sqlite3').verbose();

// Simple SQL tag function for syntax highlighting
const sql = (strings, ...values) => strings.join('?');

// Database configuration
const DB_PATH = './yolei.db';

// Create and initialize database
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        reject(err);
      } else {
        console.log('Connected to SQLite database.');
        createTables(db)
          .then(() => resolve(db))
          .catch(reject);
      }
    });
  });
}

// Create database tables
function createTables(db) {
  return new Promise((resolve, reject) => {
    const createVisitsTable = sql`
      CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip TEXT,
        user_agent TEXT
      )
    `;

    db.run(createVisitsTable, (err) => {
      if (err) {
        console.error('Error creating visits table:', err.message);
        reject(err);
      } else {
        console.log('Database schema initialized successfully.');
        resolve();
      }
    });
  });
}

// Record a visit
function recordVisit(db, ip, userAgent) {
  return new Promise((resolve, reject) => {
    db.run(sql`
      INSERT INTO visits (ip, user_agent) VALUES (${ip}, ${userAgent})
    `, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

// Get visit statistics
function getVisitStats(db) {
  return new Promise((resolve, reject) => {
    db.get(sql`SELECT COUNT(*) as total_visits FROM visits`, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row.total_visits);
      }
    });
  });
}

// Get recent visits
function getRecentVisits(db, limit = 20) {
  return new Promise((resolve, reject) => {
    db.all(sql`SELECT * FROM visits ORDER BY timestamp DESC LIMIT ?`, [limit], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Get detailed statistics
function getDetailedStats(db) {
  const queries = [
    'SELECT COUNT(*) as total FROM visits',
    'SELECT COUNT(DISTINCT ip) as unique_ips FROM visits',
    'SELECT timestamp FROM visits ORDER BY timestamp DESC LIMIT 1'
  ];

  return Promise.all(queries.map(query =>
    new Promise((resolve, reject) => {
      db.get(query, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    })
  )).then(([total, unique, latest]) => ({
    total_visits: total.total,
    unique_visitors: unique.unique_ips,
    last_visit: latest ? latest.timestamp : null
  }));
}

// Close database connection
function closeDatabase(db) {
  return new Promise((resolve) => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
      resolve();
    });
  });
}

module.exports = {
  initializeDatabase,
  recordVisit,
  getVisitStats,
  getRecentVisits,
  getDetailedStats,
  closeDatabase
};
