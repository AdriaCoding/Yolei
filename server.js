const express = require('express');
const path = require('path');
const { initializeDatabase, recordVisit, getVisitStats, getRecentVisits, getDetailedStats, closeDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Global database instance
let db;

// Initialize database and start server
async function startServer() {
  try {
    db = await initializeDatabase();

    // Middleware
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.use(express.static('public'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Routes
    app.get('/', (req, res) => {
      res.render('index');
    });

    // API routes (for future use when needed)
    app.get('/api/visits', async (req, res) => {
      try {
        const visits = await getRecentVisits(db);
        res.json(visits);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get('/api/stats', async (req, res) => {
      try {
        const stats = await getDetailedStats(db);
        res.json(stats);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
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

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  if (db) {
    await closeDatabase(db);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  if (db) {
    await closeDatabase(db);
  }
  process.exit(0);
});

// Start the server
startServer();
