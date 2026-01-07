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
    const tables = [
      sql`
        CREATE TABLE IF NOT EXISTS visits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          ip TEXT,
          user_agent TEXT
        )
      `,
      sql`
        CREATE TABLE IF NOT EXISTS cities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          country TEXT,
          latitude REAL,
          longitude REAL,
          population INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
      sql`
        CREATE TABLE IF NOT EXISTS locations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          city_id INTEGER,
          category TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (city_id) REFERENCES cities(id)
        )
      `,
      sql`
        CREATE TABLE IF NOT EXISTS annotations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          location_id INTEGER,
          city_id INTEGER,
          data TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (location_id) REFERENCES locations(id),
          FOREIGN KEY (city_id) REFERENCES cities(id)
        )
      `
    ];

    let completed = 0;
    const total = tables.length;

    tables.forEach((createTableSQL, index) => {
      db.run(createTableSQL, (err) => {
        if (err) {
          console.error(`Error creating table ${index + 1}:`, err.message);
          reject(err);
        } else {
          completed++;
          if (completed === total) {
            console.log('Database schema initialized successfully.');
            resolve();
          }
        }
      });
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

// Cities CRUD operations
function createCity(db, cityData) {
  return new Promise((resolve, reject) => {
    const { name, country, latitude, longitude, population } = cityData;
    db.run(sql`
      INSERT INTO cities (name, country, latitude, longitude, population)
      VALUES (?, ?, ?, ?, ?)
    `, [name, country, latitude, longitude, population], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

function getAllCities(db) {
  return new Promise((resolve, reject) => {
    db.all(sql`SELECT * FROM cities ORDER BY name`, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function getCityById(db, id) {
  return new Promise((resolve, reject) => {
    db.get(sql`SELECT * FROM cities WHERE id = ?`, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Locations CRUD operations
function createLocation(db, locationData) {
  return new Promise((resolve, reject) => {
    const { name, description, latitude, longitude, city_id, category } = locationData;
    db.run(sql`
      INSERT INTO locations (name, description, latitude, longitude, city_id, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, description, latitude, longitude, city_id, category], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

function getAllLocations(db) {
  return new Promise((resolve, reject) => {
    db.all(sql`
      SELECT l.*, c.name as city_name
      FROM locations l
      LEFT JOIN cities c ON l.city_id = c.id
      ORDER BY l.created_at DESC
    `, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function getLocationsByCity(db, cityId) {
  return new Promise((resolve, reject) => {
    db.all(sql`SELECT * FROM locations WHERE city_id = ? ORDER BY name`, [cityId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Annotations CRUD operations
function createAnnotation(db, annotationData) {
  return new Promise((resolve, reject) => {
    const { location_id, city_id, data } = annotationData;
    db.run(sql`
      INSERT INTO annotations (location_id, city_id, data)
      VALUES (?, ?, ?)
    `, [location_id, city_id, data], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

function getAnnotationsByLocation(db, locationId) {
  return new Promise((resolve, reject) => {
    db.all(sql`
      SELECT a.*, l.name as location_name, c.name as city_name
      FROM annotations a
      LEFT JOIN locations l ON a.location_id = l.id
      LEFT JOIN cities c ON a.city_id = c.id
      WHERE a.location_id = ?
      ORDER BY a.created_at DESC
    `, [locationId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function getAnnotationsByCity(db, cityId) {
  return new Promise((resolve, reject) => {
    db.all(sql`
      SELECT a.*, l.name as location_name, c.name as city_name
      FROM annotations a
      LEFT JOIN locations l ON a.location_id = l.id
      LEFT JOIN cities c ON a.city_id = c.id
      WHERE a.city_id = ?
      ORDER BY a.created_at DESC
    `, [cityId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
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
};
