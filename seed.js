// Seed data via API calls (run after server is started)
async function seedViaAPI() {
  console.log('🌱 Seeding database via API...');

  try {
    // Add sample cities in Spain
    const cities = [
      { name: 'Barcelona', country: 'Spain', latitude: 41.3851, longitude: 2.1734, population: 1620000 },
      { name: 'Madrid', country: 'Spain', latitude: 40.4168, longitude: -3.7038, population: 3223000 },
      { name: 'Valencia', country: 'Spain', latitude: 39.4699, longitude: -0.3763, population: 791000 },
      { name: 'Sevilla', country: 'Spain', latitude: 37.3891, longitude: -5.9845, population: 688000 }
    ];

    console.log('Adding cities...');
    for (const city of cities) {
      const response = await fetch('http://localhost:3000/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(city)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✓ Added city: ${city.name} (ID: ${result.id})`);
        city.id = result.id;
      } else {
        console.error(`❌ Failed to add city: ${city.name}`);
      }
    }

    // Add sample locations
    const locations = [
      {
        name: 'Sagrada Familia',
        description: 'Iconic basilica designed by Antoni Gaudí',
        latitude: 41.4036,
        longitude: 2.1744,
        city_id: 1,
        category: 'monument'
      },
      {
        name: 'Park Güell',
        description: 'Famous park with Gaudí architecture',
        latitude: 41.4145,
        longitude: 2.1527,
        city_id: 1,
        category: 'park'
      },
      {
        name: 'La Rambla',
        description: 'Famous boulevard in Barcelona',
        latitude: 41.3809,
        longitude: 2.1732,
        city_id: 1,
        category: 'other'
      },
      {
        name: 'Puerta del Sol',
        description: 'Iconic square in the heart of Madrid',
        latitude: 40.4169,
        longitude: -3.7038,
        city_id: 2,
        category: 'monument'
      },
      {
        name: 'Royal Palace of Madrid',
        description: 'Official residence of the Spanish Royal Family',
        latitude: 40.4173,
        longitude: -3.7144,
        city_id: 2,
        category: 'monument'
      },
      {
        name: 'City of Arts and Sciences',
        description: 'Modern architectural complex in Valencia',
        latitude: 39.4541,
        longitude: -0.3533,
        city_id: 3,
        category: 'monument'
      },
      {
        name: 'Alhambra',
        description: 'Palace and fortress complex in Granada',
        latitude: 37.1761,
        longitude: -3.5881,
        city_id: null, // No Granada city yet
        category: 'monument'
      }
    ];

    console.log('Adding locations...');
    for (const location of locations) {
      const response = await fetch('http://localhost:3000/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✓ Added location: ${location.name} (ID: ${result.id})`);
      } else {
        const error = await response.json();
        console.error(`❌ Failed to add location: ${location.name} - ${error.error}`);
      }
    }

    console.log('✅ Database seeded successfully via API!');
    console.log('🚀 Visit http://localhost:3000 to see your geo-annotation system');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.log('💡 Make sure the server is running with: npm start');
  }
}

// Run seeder if called directly
if (require.main === module) {
  // Wait a bit for server to start, then seed
  setTimeout(seedViaAPI, 2000);
}

module.exports = { seedViaAPI };
