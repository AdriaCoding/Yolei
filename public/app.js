// Yolei Geo-Annotation System
class GeoAnnotationApp {
    constructor() {
        this.map = null;
        this.markers = [];
        this.cities = [];
        this.locations = [];

        this.init();
    }

    async init() {
        await this.initializeMap();
        await this.loadCities();
        await this.loadLocations();
    }

    async initializeMap() {
        // Initialize map centered on Spain
        this.map = L.map('map').setView([40.4637, -3.7492], 6); // Default to Spain

        // Add OpenStreetMap tiles
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(this.map);
    }

    async loadCities() {
        try {
            const response = await fetch('/api/cities');
            this.cities = await response.json();
        } catch (error) {
            console.error('Error loading cities:', error);
        }
    }

    async loadLocations() {
        try {
            const response = await fetch('/api/locations');
            const locations = await response.json();
            this.locations = locations;
            this.updateMapMarkers();
        } catch (error) {
            console.error('Error loading locations:', error);
        }
    }

    updateMapMarkers() {
        // Clear existing markers
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        // Add circle markers for cities (blue)
        this.cities.forEach(city => {
            if (city.latitude && city.longitude) {
                const cityMarker = L.circleMarker([city.latitude, city.longitude], {
                    color: '#007bff',
                    fillColor: '#007bff',
                    fillOpacity: 0.3,
                    radius: 12,
                    weight: 2
                })
                .addTo(this.map)
                .bindPopup(`
                    <strong>🏙️ ${city.name}</strong><br>
                    <em>Country: ${city.country || 'Unknown'}</em><br>
                    <em>Population: ${city.population ? city.population.toLocaleString() : 'Unknown'}</em><br>
                    <small style="color: #666;">📍 Click to zoom into city</small>
                `)
                .on('click', () => {
                    // Zoom into the city with smooth animation
                    this.map.flyTo([city.latitude, city.longitude], 13, {
                        duration: 1.5 // Animation duration in seconds
                    });
                });

                this.markers.push(cityMarker);
            }
        });

        // Add markers for locations (default Leaflet style)
        this.locations.forEach(location => {
            const locationMarker = L.marker([location.latitude, location.longitude])
                .addTo(this.map)
                .bindPopup(`
                    <strong>${location.name}</strong><br>
                    ${location.description || 'No description'}<br>
                    <em>Category: ${location.category || 'Not specified'}</em><br>
                    <em>City: ${location.city_name || 'Unknown'}</em>
                `);

            this.markers.push(locationMarker);
        });
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GeoAnnotationApp();
});
