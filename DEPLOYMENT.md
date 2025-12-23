# 🚀 Deployment Guide for Manim Video Generator

This guide will help you deploy your Manim Video Generator to production.

## 📋 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 7+ / Windows Server 2019+
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 20GB+ for videos and dependencies
- **CPU**: 4+ cores recommended for video processing

### Software Requirements
- **Python 3.8+**
- **Node.js 16+**
- **FFmpeg** (for video processing)
- **Git**

## 🎯 Deployment Options

### Option 1: VPS/Cloud Server (Recommended)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3 python3-pip nodejs npm ffmpeg git nginx

# Install FFmpeg (if not available in package manager)
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:jonathonf/ffmpeg-4
sudo apt update
sudo apt install -y ffmpeg
```

#### 2. Clone and Setup Project

```bash
# Clone your repository
git clone <your-repo-url>
cd manim_gen

# Setup backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup frontend
cd ../frontend/my-react-app
npm install
npm run build
```

#### 3. Environment Configuration

Create `.env` file in backend directory:

```bash
# Backend/.env
OPENAI_API_KEY=your_openai_api_key
MANIM_QUALITY=720p30
MANIM_FRAME_RATE=30
```

#### 4. Nginx Configuration

Create `/etc/nginx/sites-available/manim-gen`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/manim_gen/frontend/my-react-app/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Media files
    location /media/ {
        alias /path/to/manim_gen/backend/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/manim-gen /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Systemd Service

Create `/etc/systemd/system/manim-gen.service`:

```ini
[Unit]
Description=Manim Video Generator API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/manim_gen/backend
Environment=PATH=/path/to/manim_gen/backend/venv/bin
ExecStart=/path/to/manim_gen/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable manim-gen
sudo systemctl start manim-gen
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy frontend and build
COPY frontend/my-react-app/ ./frontend/
WORKDIR /app/frontend
RUN npm install && npm run build

# Copy built frontend to backend static directory
WORKDIR /app
RUN mkdir -p static && cp -r frontend/dist/* static/

# Expose port
EXPOSE 8000

# Start the application
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  manim-gen:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./backend/media:/app/media
    restart: unless-stopped
```

#### 3. Deploy with Docker

```bash
# Build and run
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Option 3: Cloud Platforms

#### Heroku Deployment

1. **Create Procfile**:
```
web: uvicorn server:app --host 0.0.0.0 --port $PORT
```

2. **Create runtime.txt**:
```
python-3.9.18
```

3. **Deploy**:
```bash
heroku create your-app-name
heroku config:set OPENAI_API_KEY=your_key
git push heroku main
```

#### Railway Deployment

1. Connect your GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically

#### Render Deployment

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `pip install -r backend/requirements.txt && cd frontend/my-react-app && npm install && npm run build`
4. Set start command: `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`

## 🔧 Production Configuration

### 1. Environment Variables

```bash
# Production settings
export ENVIRONMENT=production
export DEBUG=false
export ALLOWED_HOSTS=your-domain.com,www.your-domain.com
export CORS_ORIGINS=https://your-domain.com
```

### 2. Security Settings

```python
# In server.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. SSL/HTTPS Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring and Maintenance

### 1. Log Management

```bash
# View application logs
sudo journalctl -u manim-gen -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. Performance Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop

# Monitor disk usage
df -h
du -sh /path/to/manim_gen/backend/media/
```

### 3. Backup Strategy

```bash
# Create backup script
#!/bin/bash
BACKUP_DIR="/backups/manim-gen"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup media files
tar -czf $BACKUP_DIR/media_$DATE.tar.gz /path/to/manim_gen/backend/media/

# Backup database (if using one)
# pg_dump your_db > $BACKUP_DIR/db_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

## 🚨 Troubleshooting

### Common Issues

1. **FFmpeg not found**
   ```bash
   sudo apt install ffmpeg
   ```

2. **Permission denied**
   ```bash
   sudo chown -R www-data:www-data /path/to/manim_gen/
   ```

3. **Port already in use**
   ```bash
   sudo netstat -tulpn | grep :8000
   sudo kill -9 <PID>
   ```

4. **Memory issues**
   ```bash
   # Increase swap
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

## 📈 Scaling Considerations

### 1. Load Balancing
- Use multiple backend instances
- Configure Nginx as load balancer
- Consider using Redis for session management

### 2. Video Processing Queue
- Implement Celery for background video processing
- Use Redis as message broker
- Add progress tracking for long operations

### 3. CDN for Videos
- Use AWS S3 or similar for video storage
- Configure CloudFront for video delivery
- Implement video streaming optimization

## 🎯 Next Steps

1. **Set up monitoring** (Prometheus + Grafana)
2. **Implement user authentication**
3. **Add video processing queue**
4. **Set up automated backups**
5. **Configure CI/CD pipeline**

## 📞 Support

For deployment issues:
1. Check logs: `sudo journalctl -u manim-gen -f`
2. Verify FFmpeg: `ffmpeg -version`
3. Test API: `curl http://localhost:8000/health`
4. Check nginx: `sudo nginx -t`

---

**Happy Deploying! 🚀** 