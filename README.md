# Yolei WebApp

A simple self-hosted web application with data storage, built for Raspberry Pi 5 deployment via Tailscale Funnel.

## 🚀 Features

- **Express.js Backend**: Lightweight Node.js web framework
- **SQLite Database**: File-based database for visit tracking
- **Modern UI**: Responsive design with real-time updates
- **API Endpoints**: RESTful APIs for data access
- **Health Monitoring**: Built-in health checks
- **Raspberry Pi Ready**: Optimized for low-resource deployment

## 🛠️ Local Development

### Prerequisites
- Node.js (v14+)
- npm

### Installation
```bash
npm install
```

### Running the App
```bash
npm start
```

Visit `http://localhost:3000` in your browser.

## 📊 API Endpoints

- `GET /` - Main application page
- `GET /health` - Health check endpoint
- `GET /api/stats` - Visit statistics
- `GET /api/visits` - Recent visits data

## 🗄️ Database Schema

The app uses SQLite with a simple `visits` table:

```sql
CREATE TABLE visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip TEXT,
  user_agent TEXT
);
```

## 🌐 Raspberry Pi Deployment

### 1. Prepare Your Pi
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Deploy Application
```bash
# Clone your repository
git clone https://github.com/yourusername/yolei-webapp.git
cd yolei-webapp
npm install --production
```

### 3. Create Systemd Service
Create `/etc/systemd/system/yolei-webapp.service`:

```ini
[Unit]
Description=Yolei WebApp
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/yolei-webapp
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=5
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

### 4. Enable and Start Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable yolei-webapp
sudo systemctl start yolei-webapp
```

## 🔒 Tailscale Funnel Setup

### Install Tailscale
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

### Expose via Funnel
```bash
sudo tailscale funnel 3000
```

Your app will be accessible at `https://your-pi-name.ts.net`

## 📁 Project Structure

```
yolei-webapp/
├── server.js          # Express server and routes
├── views/
│   └── index.ejs      # Main page template
├── public/
│   ├── styles.css     # CSS styles
│   └── app.js         # Client-side JavaScript
├── yolei.db          # SQLite database (auto-created)
├── package.json      # Dependencies and scripts
└── README.md         # This file
```

## 🔧 Configuration

The app runs on port 3000 by default. To change this, set the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## 📈 Monitoring

- **Health Check**: Visit `/health` for JSON status
- **Logs**: `sudo journalctl -u yolei-webapp -f`
- **Database**: Direct SQLite access with `sqlite3 yolei.db`

## 🛡️ Security Notes

- The app binds to `0.0.0.0` for network access
- No authentication implemented (add as needed)
- Database file should be backed up regularly
- Consider using environment variables for sensitive config

## 🤝 Contributing

Feel free to extend this app with:
- User authentication
- Additional data models
- API documentation
- Testing suite
- Docker deployment

---

Built with ❤️ for Raspberry Pi and Tailscale