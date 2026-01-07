// Yolei Geo-Annotation System
class GeoAnnotationApp {
    constructor() {
        this.map = null;
        this.markers = [];
        this.locations = [];

        this.init();
    }

    async init() {
        await this.initializeMap();
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

        // Add markers for locations
        this.locations.forEach(location => {
            const marker = L.marker([location.latitude, location.longitude])
                .addTo(this.map)
                .bindPopup(`
                    <strong>${location.name}</strong><br>
                    ${location.description || 'No description'}<br>
                    <em>Category: ${location.category || 'Not specified'}</em><br>
                    <em>City: ${location.city_name || 'Unknown'}</em>
                `);

            this.markers.push(marker);
        });
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GeoAnnotationApp();
});
