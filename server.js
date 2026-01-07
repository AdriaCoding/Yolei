const express = require('express');
const path = require('path');
const {
  initializeDatabase,
  recordVisit,
  getVisitStats,
  getRecentVisits,
  getDetailedStats,
  closeDatabase,
  // Cities
  createCity,
  getAllCities,
  getCityById,
  // Locations
  createLocation,
  getAllLocations,
  getLocationsByCity,
  // Annotations
  createAnnotation,
  getAnnotationsByLocation,
  getAnnotationsByCity
} = require('./database');

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
    app.use('/leaflet', express.static(path.join(__dirname, 'node_modules/leaflet/dist')));
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

    // Cities API routes
    app.get('/api/cities', async (req, res) => {
      try {
        const cities = await getAllCities(db);
        res.json(cities);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get('/api/cities/:id', async (req, res) => {
      try {
        const city = await getCityById(db, req.params.id);
        if (city) {
          res.json(city);
        } else {
          res.status(404).json({ error: 'City not found' });
        }
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/cities', async (req, res) => {
      try {
        const cityId = await createCity(db, req.body);
        res.status(201).json({ id: cityId, message: 'City created successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Locations API routes
    app.get('/api/locations', async (req, res) => {
      try {
        const locations = await getAllLocations(db);
        res.json(locations);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get('/api/locations/city/:cityId', async (req, res) => {
      try {
        const locations = await getLocationsByCity(db, req.params.cityId);
        res.json(locations);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/locations', async (req, res) => {
      try {
        const locationId = await createLocation(db, req.body);
        res.status(201).json({ id: locationId, message: 'Location created successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Annotations API routes
    app.get('/api/annotations/location/:locationId', async (req, res) => {
      try {
        const annotations = await getAnnotationsByLocation(db, req.params.locationId);
        res.json(annotations);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get('/api/annotations/city/:cityId', async (req, res) => {
      try {
        const annotations = await getAnnotationsByCity(db, req.params.cityId);
        res.json(annotations);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/annotations', async (req, res) => {
      try {
        const annotationId = await createAnnotation(db, req.body);
        res.status(201).json({ id: annotationId, message: 'Annotation created successfully' });
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
