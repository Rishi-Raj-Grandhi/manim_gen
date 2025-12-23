# Use Python 3.9 slim image
FROM python:3.9-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    nodejs \
    npm \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy frontend and build
COPY frontend/my-react-app/ ./frontend/
WORKDIR /app/frontend
RUN npm install && npm run build

# Copy built frontend to backend static directory
WORKDIR /app
RUN mkdir -p backend/static && cp -r frontend/dist/* backend/static/

# Create media directory
RUN mkdir -p backend/media/videos/generated_scene/720p30

# Expose port
EXPOSE 8000

# Set working directory to backend
WORKDIR /app/backend

# Start the application
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"] 