from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import pathlib
import subprocess
import asyncio
import sys
from typing import List, Dict, Any
from datetime import datetime

# Add the langraphdir to the Python path
langraphdir_path = pathlib.Path(__file__).parent / "langraphdir"
sys.path.append(str(langraphdir_path))

app = FastAPI(
    title="Manim Video Generator API",
    description="API for serving Manim generated videos",
    version="1.0.0"
)

# Enable CORS for React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files from the media directory
media_path = pathlib.Path(__file__).parent / "media"
app.mount("/media", StaticFiles(directory=str(media_path)), name="media")

# Pydantic model for video generation request
class VideoGenerationRequest(BaseModel):
    prompt: str

# API endpoint to get list of videos
@app.get("/api/videos", response_model=List[Dict[str, Any]])
async def get_videos():
    """Get list of all available videos"""
    videos_dir = media_path / "videos" / "generated_scene" / "720p30"
    
    try:
        print(f"🔍 Looking for videos in: {videos_dir}")
        print(f"📁 Directory exists: {videos_dir.exists()}")
        
        if not videos_dir.exists():
            print("❌ Videos directory does not exist")
            return []
        
        video_files = []
        for file in videos_dir.iterdir():
            if file.is_file() and file.suffix.lower() in ['.mp4', '.avi', '.mov']:
                stat = file.stat()
                video_info = {
                    "name": file.name,
                    "url": f"/media/videos/generated_scene/720p30/{file.name}",
                    "size": stat.st_size,
                    "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
                }
                video_files.append(video_info)
                print(f"📹 Found video: {file.name} ({stat.st_size} bytes)")
        
        print(f"🎬 Total videos found: {len(video_files)}")
        return video_files
    except Exception as e:
        print(f"❌ Error reading videos directory: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to read videos directory: {str(e)}")

# API endpoint to get specific video info
@app.get("/api/videos/{filename}")
async def get_video_info(filename: str):
    """Get information about a specific video"""
    video_path = media_path / "videos" / "generated_scene" / "720p30" / filename
    
    try:
        if not video_path.exists():
            raise HTTPException(status_code=404, detail="Video not found")
        
        stat = video_path.stat()
        return {
            "name": filename,
            "url": f"/media/videos/generated_scene/720p30/{filename}",
            "size": stat.st_size,
            "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
            "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get video info: {str(e)}")

# Video generation endpoint
@app.post("/api/generate")
async def generate_video(request: VideoGenerationRequest):
    """Generate a video from a prompt using the existing Manim workflow"""
    try:
        print(f"🎬 Generating video for prompt: {request.prompt}")
        
        # Import and use the LangGraph workflow
        from langchain_runner import graph
        
        # Run the LangGraph workflow in a thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, lambda: graph.invoke({"prompt": request.prompt}))
        
        print(f"✅ Video generation completed successfully")
        print(f"📝 Generated code length: {len(result.get('code', ''))} characters")
        
        # Get the generated filename
        generated_filename = result.get('generated_filename', 'output.mp4')
        print(f"📹 Generated video file: {generated_filename}")
        
        return {
            "status": "success",
            "message": "Video generated successfully",
            "prompt": request.prompt,
            "code_length": len(result.get('code', '')),
            "generated_filename": generated_filename,
            "video_url": f"/media/videos/generated_scene/720p30/{generated_filename}",
            "result": result
        }
    except Exception as e:
        print(f"❌ Error generating video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate video: {str(e)}")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Check if LangGraph workflow is available
@app.get("/api/status")
async def get_status():
    """Get the status of the video generation system"""
    try:
        from langchain_runner import graph
        return {
            "status": "ready",
            "langgraph_available": True,
            "message": "Video generation system is ready",
            "timestamp": datetime.now().isoformat(),
            "media_path": str(media_path),
            "videos_dir": str(media_path / "videos" / "generated_scene" / "720p30")
        }
    except Exception as e:
        return {
            "status": "error",
            "langgraph_available": False,
            "message": f"LangGraph workflow not available: {str(e)}",
            "timestamp": datetime.now().isoformat(),
            "media_path": str(media_path),
            "videos_dir": str(media_path / "videos" / "generated_scene" / "720p30")
        }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Manim Video Generator API",
        "version": "1.0.0",
        "endpoints": {
            "videos": "/api/videos",
            "video_info": "/api/videos/{filename}",
            "health": "/health",
            "media": "/media/*"
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Manim Video Generator API Server...")
    print("📁 Videos available at: http://localhost:8000/media/videos/generated_scene/720p30/")
    print("📂 Video files stored in: backend/media/videos/generated_scene/720p30/")
    print("🔗 API docs available at: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000) 