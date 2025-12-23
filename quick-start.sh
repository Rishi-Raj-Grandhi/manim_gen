#!/bin/bash

echo "🚀 Manim Video Generator - Quick Start"
echo "======================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating .env file..."
    cat > backend/.env << EOF
# OpenAI API Key (required for video generation)
OPENAI_API_KEY=your_openai_api_key_here

# Manim settings
MANIM_QUALITY=720p30
MANIM_FRAME_RATE=30

# Server settings
ENVIRONMENT=development
DEBUG=true
EOF
    echo "⚠️  Please edit backend/.env and add your OpenAI API key!"
    echo "   Get your API key from: https://platform.openai.com/api-keys"
fi

# Check if OpenAI API key is set
if grep -q "your_openai_api_key_here" backend/.env; then
    echo "⚠️  Please set your OpenAI API key in backend/.env"
    echo "   Current value: your_openai_api_key_here"
    echo "   Get your API key from: https://platform.openai.com/api-keys"
    read -p "Press Enter to continue anyway..."
fi

echo "🔧 Building and starting the application..."
docker-compose up --build -d

echo "⏳ Waiting for the application to start..."
sleep 10

# Check if the application is running
if curl -f http://localhost:8000/health &> /dev/null; then
    echo "✅ Application is running!"
    echo ""
    echo "🌐 Access your application:"
    echo "   Frontend: http://localhost:8000"
    echo "   API Docs: http://localhost:8000/docs"
    echo "   Health Check: http://localhost:8000/health"
    echo ""
    echo "📝 To view logs:"
    echo "   docker-compose logs -f"
    echo ""
    echo "🛑 To stop the application:"
    echo "   docker-compose down"
    echo ""
    echo "🔄 To restart:"
    echo "   docker-compose restart"
else
    echo "❌ Application failed to start. Check logs with:"
    echo "   docker-compose logs"
fi 