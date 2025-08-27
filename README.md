# Manim Video Generator

A 2D animation video generator that creates Manim code using OpenAI and runs it using LangGraph, with a beautiful React frontend to display the generated videos.

## Features

- 🎬 Generate 2D animation videos using Manim
- 🤖 AI-powered code generation with OpenAI
- 🔄 Workflow orchestration with LangGraph
- 🎨 Beautiful React frontend with prompt input
- 📝 Interactive prompt interface for video generation
- 📱 Responsive design for all devices
- 🔄 Real-time video updates and generation
- 🎯 Click-to-play video selection

## Project Structure

```
manim_gen/
├── backend/
│   ├── langraphdir/          # LangGraph workflow
│   │   └── langchain_runner.py
│   ├── media/               # Generated videos
│   │   └── videos/
│   │       └── generated_scene/
│   │           └── 720p30/
│   ├── server.py            # FastAPI server for serving videos
│   ├── setup_media.py       # Media folder setup script
│   └── requirements.txt     # Python dependencies
├── frontend/
│   └── my-react-app/       # React video player
└── README.md
```

## Setup Instructions

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Media Folder Structure

```bash
cd backend
python setup_media.py
```

This will create the necessary media folders and test video generation.

### 3. Install Frontend Dependencies

```bash
cd frontend/my-react-app
npm install
```

### 4. Start the Backend Server

```bash
cd backend
python server.py
```

The server will run on `http://localhost:8000` and serve videos from the `backend/media` folder.

### 5. Start the React App

```bash
cd frontend/my-react-app
npm run dev
```

The React app will run on `http://localhost:5173` (or another port if 5173 is busy).

## Usage

1. **Generate Videos**: Use your existing Manim + LangGraph + OpenAI workflow to generate videos
2. **View Videos**: Open the React app in your browser to see all generated videos
3. **Play Videos**: Click on any video in the list to play it in the video player
4. **Refresh**: Use the refresh button to check for new videos

## API Endpoints

- `GET /api/videos` - Get list of all available videos
- `GET /api/videos/:filename` - Get specific video information
- `POST /api/generate` - Generate new video from prompt
- `GET /media/*` - Serve video files directly
- `GET /health` - Health check endpoint

## Features

### Video Generation
- 📝 Interactive prompt input interface
- 🎨 Example prompts for inspiration
- ⚡ Real-time generation status updates
- 🔄 Automatic video list refresh after generation

### Video Player
- 📹 Full video playback with controls
- 🖼️ Video thumbnails with play overlay
- 📊 File size and metadata display
- 🎯 Click to select and play videos
- 📱 Recent videos sidebar

### UI/UX
- 🌈 Beautiful gradient background
- 💫 Smooth animations and transitions
- 📱 Fully responsive design
- 🎨 Modern glassmorphism design
- ⚡ Fast loading and smooth performance

### Error Handling
- 🔄 Automatic retry on connection errors
- 📝 Clear error messages
- 🚫 Graceful handling of missing videos

## Development

### Backend Development
```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend/my-react-app
npm run dev  # Vite dev server with HMR
```

## Technologies Used

- **Backend**: Node.js, Express, CORS
- **Frontend**: React, Vite, Axios
- **Animation**: Manim, LangGraph, OpenAI
- **Styling**: CSS3 with modern features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own video generation needs!
