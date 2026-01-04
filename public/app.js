// Yolei WebApp JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Load initial data when page loads
    loadStats();
    loadRecentVisits();

    // Auto-refresh data every 30 seconds
    setInterval(() => {
        loadStats();
        loadRecentVisits();
    }, 30000);
});

// Load visit statistics
async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();

        document.getElementById('totalVisits').textContent = data.total_visits || 0;
        document.getElementById('uniqueVisitors').textContent = data.unique_visitors || 0;

        // Remove loading state if present
        document.getElementById('totalVisits').classList.remove('loading');
        document.getElementById('uniqueVisitors').classList.remove('loading');
    } catch (error) {
        console.error('Error loading stats:', error);
        showError('Failed to load statistics');
    }
}

// Load recent visits
async function loadRecentVisits() {
    try {
        const visitsContainer = document.getElementById('visitsList');
        visitsContainer.innerHTML = '<p class="loading">Loading recent visits...</p>';

        const response = await fetch('/api/visits');
        const visits = await response.json();

        if (visits.length === 0) {
            visitsContainer.innerHTML = '<p>No visits recorded yet.</p>';
            return;
        }

        const visitsHtml = visits.map(visit => `
            <div class="visit-item">
                <div class="visit-time">${formatDate(visit.timestamp)}</div>
                <div class="visit-ip">IP: ${visit.ip}</div>
                <div class="visit-ua">${truncateUserAgent(visit.user_agent)}</div>
            </div>
        `).join('');

        visitsContainer.innerHTML = visitsHtml;
    } catch (error) {
        console.error('Error loading visits:', error);
        document.getElementById('visitsList').innerHTML =
            '<p class="error">Failed to load recent visits.</p>';
    }
}

// Format timestamp for display
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Truncate user agent string for display
function truncateUserAgent(ua) {
    if (!ua || ua === 'Unknown') return 'Unknown browser';
    const maxLength = 60;
    return ua.length > maxLength ? ua.substring(0, maxLength) + '...' : ua;
}

// Show error message
function showError(message) {
    // Remove existing error messages
    const existingErrors = document.querySelectorAll('.error');
    existingErrors.forEach(error => error.remove());

    // Create and show new error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;

    const container = document.querySelector('.container');
    container.insertBefore(errorDiv, container.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Add loading states to stats on page load
function initializeLoadingStates() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        if (stat.textContent === '-') {
            stat.classList.add('loading');
        }
    });
}

// Call initialization
initializeLoadingStates();
