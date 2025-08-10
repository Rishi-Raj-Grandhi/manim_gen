from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
import os
import pathlib
import subprocess
import asyncio
import sys
import tempfile
import shutil
from typing import List, Dict, Any, Optional
from datetime import datetime
import json

# Add the langraphdir to the Python path
langraphdir_path = pathlib.Path(__file__).parent / "langraphdir"
sys.path.append(str(langraphdir_path))

app = FastAPI(
    title="Manim Video Generator API",
    description="API for serving Manim generated videos with editing capabilities",
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

# Pydantic models
class VideoGenerationRequest(BaseModel):
    prompt: str

class VideoEditRequest(BaseModel):
    video_name: str
    trim_start: Optional[float] = 0
    trim_end: Optional[float] = None
    effects: Optional[Dict[str, Any]] = {}
    export_format: str = "mp4"
    export_quality: str = "720p"

class VideoExportRequest(BaseModel):
    video_name: str
    trim_start: float
    trim_end: float
    effects: Dict[str, Any]
    export_format: str = "mp4"
    export_quality: str = "720p"

# API endpoint to get list of videos
@app.get("/api/videos", response_model=List[Dict[str, Any]])
async def get_videos():
    """Get list of all available videos"""
    videos_dir = media_path / "videos" / "generated_scene" / "720p30"
    
    # Also check the nested media directory where Manim actually saves videos
    nested_videos_dir = videos_dir / "media" / "videos"
    
    try:
        print(f"🔍 Looking for videos in: {videos_dir}")
        print(f"📁 Directory exists: {videos_dir.exists()}")
        
        if not videos_dir.exists():
            print("❌ Videos directory does not exist")
            return []
        
        video_files = []
        
        # Check main videos directory
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
        
        # Check nested media directory (where Manim actually saves)
        if nested_videos_dir.exists():
            for video_folder in nested_videos_dir.iterdir():
                if video_folder.is_dir():
                    nested_720p30_dir = video_folder / "720p30"
                    if nested_720p30_dir.exists():
                        for file in nested_720p30_dir.iterdir():
                            if file.is_file() and file.suffix.lower() in ['.mp4', '.avi', '.mov']:
                                stat = file.stat()
                                video_info = {
                                    "name": file.name,
                                    "url": f"/media/videos/generated_scene/720p30/media/videos/{video_folder.name}/720p30/{file.name}",
                                    "size": stat.st_size,
                                    "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                                    "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
                                }
                                video_files.append(video_info)
                                print(f"📹 Found nested video: {file.name} ({stat.st_size} bytes)")
        
        print(f"🎬 Total videos found: {len(video_files)}")
        return video_files
    except Exception as e:
        print(f"❌ Error reading videos directory: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to read videos directory: {str(e)}")

# API endpoint to get specific video info
@app.get("/api/videos/{filename}")
async def get_video_info(filename: str):
    """Get information about a specific video"""
    # Check main videos directory
    video_path = media_path / "videos" / "generated_scene" / "720p30" / filename
    
    # If not found in main directory, check nested media directory
    if not video_path.exists():
        nested_videos_dir = media_path / "videos" / "generated_scene" / "720p30" / "media" / "videos"
        if nested_videos_dir.exists():
            for video_folder in nested_videos_dir.iterdir():
                if video_folder.is_dir():
                    nested_video_path = video_folder / "720p30" / filename
                    if nested_video_path.exists():
                        video_path = nested_video_path
                        break
    
    try:
        if not video_path.exists():
            raise HTTPException(status_code=404, detail="Video not found")
        
        stat = video_path.stat()
        # Determine the correct URL based on where the video was found
        if "media/videos" in str(video_path):
            # Video is in nested structure
            video_folder_name = video_path.parent.parent.name
            url = f"/media/videos/generated_scene/720p30/media/videos/{video_folder_name}/720p30/{filename}"
        else:
            # Video is in main directory
            url = f"/media/videos/generated_scene/720p30/{filename}"
        
        return {
            "name": filename,
            "url": url,
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
        
        # Verify the video file exists and get correct path
        video_path = media_path / "videos" / "generated_scene" / "720p30" / generated_filename
        
        # Check if video is in nested structure
        if not video_path.exists():
            nested_videos_dir = media_path / "videos" / "generated_scene" / "720p30" / "media" / "videos"
            if nested_videos_dir.exists():
                for video_folder in nested_videos_dir.iterdir():
                    if video_folder.is_dir():
                        nested_video_path = video_folder / "720p30" / generated_filename
                        if nested_video_path.exists():
                            video_path = nested_video_path
                            video_url = f"/media/videos/generated_scene/720p30/media/videos/{video_folder.name}/720p30/{generated_filename}"
                            print(f"✅ Video found in nested structure: {video_path}")
                            break
                else:
                    print(f"⚠️  Warning: Video file not found at {video_path}")
                    video_url = f"/media/videos/generated_scene/720p30/{generated_filename}"
            else:
                print(f"⚠️  Warning: Video file not found at {video_path}")
                video_url = f"/media/videos/generated_scene/720p30/{generated_filename}"
        else:
            video_url = f"/media/videos/generated_scene/720p30/{generated_filename}"
            print(f"✅ Video found in main directory: {video_path}")
        
        return {
            "status": "success",
            "message": "Video generated successfully",
            "prompt": request.prompt,
            "code_length": len(result.get('code', '')),
            "generated_filename": generated_filename,
            "video_url": video_url,
            "result": result
        }
    except ImportError as e:
        print(f"❌ Import error: {str(e)}")
        raise HTTPException(status_code=500, detail="LangGraph workflow not available. Check dependencies.")
    except Exception as e:
        print(f"❌ Error generating video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate video: {str(e)}")

# Video processing endpoint
@app.post("/api/process-video")
async def process_video(request: VideoEditRequest):
    """Process a video with trim and effects"""
    try:
        print(f"🎬 Processing video: {request.video_name}")
        
        # Find the video file
        video_path = None
        video_url = None
        
        # Check main videos directory
        main_video_path = media_path / "videos" / "generated_scene" / "720p30" / request.video_name
        if main_video_path.exists():
            video_path = main_video_path
            video_url = f"/media/videos/generated_scene/720p30/{request.video_name}"
        else:
            # Check nested media directory
            nested_videos_dir = media_path / "videos" / "generated_scene" / "720p30" / "media" / "videos"
            if nested_videos_dir.exists():
                for video_folder in nested_videos_dir.iterdir():
                    if video_folder.is_dir():
                        nested_video_path = video_folder / "720p30" / request.video_name
                        if nested_video_path.exists():
                            video_path = nested_video_path
                            video_url = f"/media/videos/generated_scene/720p30/media/videos/{video_folder.name}/720p30/{request.video_name}"
                            break
        
        if not video_path or not video_path.exists():
            raise HTTPException(status_code=404, detail="Video not found")
        
        # Create temporary directory for processing
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_dir_path = pathlib.Path(temp_dir)
            
            # Copy video to temp directory
            temp_video_path = temp_dir_path / "input.mp4"
            shutil.copy2(video_path, temp_video_path)
            
            # Get video duration using ffprobe
            duration_cmd = [
                "ffprobe", "-v", "quiet", "-show_entries", "format=duration",
                "-of", "csv=p=0", str(temp_video_path)
            ]
            
            try:
                duration_result = subprocess.run(duration_cmd, capture_output=True, text=True, check=True)
                duration = float(duration_result.stdout.strip())
            except subprocess.CalledProcessError:
                duration = 10.0  # Default duration if ffprobe fails
            
            # Set trim end if not provided
            if request.trim_end is None:
                request.trim_end = duration
            
            # Build ffmpeg command for processing
            output_path = temp_dir_path / f"processed_{request.video_name}"
            
            # Base ffmpeg command with trim
            ffmpeg_cmd = [
                "ffmpeg", "-i", str(temp_video_path),
                "-ss", str(request.trim_start),
                "-t", str(request.trim_end - request.trim_start),
                "-c:v", "libx264",
                "-c:a", "aac",
                "-y",  # Overwrite output
                str(output_path)
            ]
            
            # Add effects if specified
            if request.effects:
                filter_complex = []
                
                if request.effects.get("brightness") != 100:
                    brightness = request.effects.get("brightness", 100) / 100
                    filter_complex.append(f"eq=brightness={brightness-1}")
                
                if request.effects.get("contrast") != 100:
                    contrast = request.effects.get("contrast", 100) / 100
                    filter_complex.append(f"eq=contrast={contrast}")
                
                if request.effects.get("saturation") != 100:
                    saturation = request.effects.get("saturation", 100) / 100
                    filter_complex.append(f"eq=saturation={saturation}")
                
                if request.effects.get("blur") > 0:
                    blur = request.effects.get("blur", 0)
                    filter_complex.append(f"boxblur={blur}:{blur}")
                
                if request.effects.get("effect") == "grayscale":
                    filter_complex.append("hue=s=0")
                elif request.effects.get("effect") == "sepia":
                    filter_complex.append("colorbalance=rs=-0.3:gs=-0.3:bs=0.3")
                elif request.effects.get("effect") == "invert":
                    filter_complex.append("negate")
                
                if filter_complex:
                    ffmpeg_cmd = [
                        "ffmpeg", "-i", str(temp_video_path),
                        "-ss", str(request.trim_start),
                        "-t", str(request.trim_end - request.trim_start),
                        "-vf", ",".join(filter_complex),
                        "-c:v", "libx264",
                        "-c:a", "aac",
                        "-y",
                        str(output_path)
                    ]
            
            # Run ffmpeg
            print(f"🔄 Running ffmpeg command: {' '.join(ffmpeg_cmd)}")
            result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                print(f"❌ FFmpeg error: {result.stderr}")
                raise HTTPException(status_code=500, detail=f"Video processing failed: {result.stderr}")
            
            # Copy processed video to media directory
            processed_video_name = f"processed_{int(datetime.now().timestamp())}_{request.video_name}"
            final_output_path = media_path / "videos" / "generated_scene" / "720p30" / processed_video_name
            
            shutil.copy2(output_path, final_output_path)
            
            # Get file info
            stat = final_output_path.stat()
            
            return {
                "status": "success",
                "message": "Video processed successfully",
                "original_video": request.video_name,
                "processed_video": processed_video_name,
                "video_url": f"/media/videos/generated_scene/720p30/{processed_video_name}",
                "trim_start": request.trim_start,
                "trim_end": request.trim_end,
                "duration": request.trim_end - request.trim_start,
                "effects": request.effects,
                "size": stat.st_size,
                "created": datetime.fromtimestamp(stat.st_ctime).isoformat()
            }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error processing video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process video: {str(e)}")

# Export video endpoint
@app.post("/api/export-video")
async def export_video(request: VideoExportRequest):
    """Export a processed video with specific settings"""
    try:
        print(f"📤 Exporting video: {request.video_name}")
        
        # Find the video file
        video_path = None
        
        # Check main videos directory
        main_video_path = media_path / "videos" / "generated_scene" / "720p30" / request.video_name
        if main_video_path.exists():
            video_path = main_video_path
        else:
            # Check nested media directory
            nested_videos_dir = media_path / "videos" / "generated_scene" / "720p30" / "media" / "videos"
            if nested_videos_dir.exists():
                for video_folder in nested_videos_dir.iterdir():
                    if video_folder.is_dir():
                        nested_video_path = video_folder / "720p30" / request.video_name
                        if nested_video_path.exists():
                            video_path = nested_video_path
                            break
        
        if not video_path or not video_path.exists():
            raise HTTPException(status_code=404, detail="Video not found")
        
        # Create temporary directory for processing
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_dir_path = pathlib.Path(temp_dir)
            
            # Copy video to temp directory
            temp_video_path = temp_dir_path / "input.mp4"
            shutil.copy2(video_path, temp_video_path)
            
            # Determine output format and quality
            output_filename = f"exported_{int(datetime.now().timestamp())}_{request.video_name}"
            if request.export_format != "mp4":
                output_filename = output_filename.replace(".mp4", f".{request.export_format}")
            
            output_path = temp_dir_path / output_filename
            
            # Build ffmpeg command based on format and quality
            ffmpeg_cmd = [
                "ffmpeg", "-i", str(temp_video_path),
                "-ss", str(request.trim_start),
                "-t", str(request.trim_end - request.trim_start)
            ]
            
            # Add quality settings
            if request.export_quality == "480p":
                ffmpeg_cmd.extend(["-vf", "scale=854:480"])
            elif request.export_quality == "1080p":
                ffmpeg_cmd.extend(["-vf", "scale=1920:1080"])
            
            # Add format-specific settings
            if request.export_format == "mp4":
                ffmpeg_cmd.extend(["-c:v", "libx264", "-c:a", "aac"])
            elif request.export_format == "webm":
                ffmpeg_cmd.extend(["-c:v", "libvpx", "-c:a", "libvorbis"])
            elif request.export_format == "gif":
                ffmpeg_cmd.extend(["-vf", "fps=10,scale=480:-1:flags=lanczos", "-f", "gif"])
            
            ffmpeg_cmd.extend(["-y", str(output_path)])
            
            # Run ffmpeg
            print(f"🔄 Running export command: {' '.join(ffmpeg_cmd)}")
            result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                print(f"❌ FFmpeg export error: {result.stderr}")
                raise HTTPException(status_code=500, detail=f"Video export failed: {result.stderr}")
            
            # Copy exported video to media directory
            final_output_path = media_path / "videos" / "generated_scene" / "720p30" / output_filename
            shutil.copy2(output_path, final_output_path)
            
            # Get file info
            stat = final_output_path.stat()
            
            return {
                "status": "success",
                "message": "Video exported successfully",
                "original_video": request.video_name,
                "exported_video": output_filename,
                "video_url": f"/media/videos/generated_scene/720p30/{output_filename}",
                "format": request.export_format,
                "quality": request.export_quality,
                "size": stat.st_size,
                "created": datetime.fromtimestamp(stat.st_ctime).isoformat()
            }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error exporting video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to export video: {str(e)}")

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