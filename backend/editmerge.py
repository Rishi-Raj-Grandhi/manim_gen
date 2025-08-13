import os
import pathlib
import tempfile
import shutil
from typing import List, Dict, Any
from datetime import datetime
import subprocess
from moviepy.editor import VideoFileClip, concatenate_videoclips

class VideoMerger:
    def __init__(self, media_path: str):
        self.media_path = pathlib.Path(media_path)
        self.output_dir = self.media_path / "videos" / "generated_scene" / "720p30" / "merged"
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def find_video_file(self, video_name: str) -> pathlib.Path:
        """Find a video file in the media directory structure"""
        # Check main videos directory
        main_video_path = self.media_path / "videos" / "generated_scene" / "720p30" / video_name
        if main_video_path.exists():
            return main_video_path
        
        # Check nested media directory
        nested_videos_dir = self.media_path / "videos" / "generated_scene" / "720p30" / "media" / "videos"
        if nested_videos_dir.exists():
            for video_folder in nested_videos_dir.iterdir():
                if video_folder.is_dir():
                    nested_video_path = video_folder / "720p30" / video_name
                    if nested_video_path.exists():
                        return nested_video_path
        
        raise FileNotFoundError(f"Video file not found: {video_name}")
    
    def merge_videos_with_trim(self, videos: List[str], trims: List[Dict[str, float]]) -> str:
        """
        Merge multiple videos with trim values applied
        
        Args:
            videos: List of video filenames
            trims: List of trim objects with 'start' and 'end' keys
            
        Returns:
            Path to the merged video file
        """
        if len(videos) != len(trims):
            raise ValueError("Number of videos must match number of trim objects")
        
        if not videos:
            raise ValueError("At least one video must be provided")
        
        print(f"🎬 Starting video merge process for {len(videos)} videos")
        
        # Create temporary directory for processing
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_dir_path = pathlib.Path(temp_dir)
            processed_clips = []
            
            try:
                # Process each video with trim values
                for i, (video_name, trim_data) in enumerate(zip(videos, trims)):
                    print(f"📹 Processing video {i+1}/{len(videos)}: {video_name}")
                    
                    # Find the video file
                    video_path = self.find_video_file(video_name)
                    
                    # Load video with moviepy
                    video_clip = VideoFileClip(str(video_path))
                    
                    # Apply trim
                    start_time = trim_data.get('start', 0)
                    end_time = trim_data.get('end', video_clip.duration)
                    
                    # Ensure trim times are within video bounds
                    start_time = max(0, min(start_time, video_clip.duration))
                    end_time = max(start_time, min(end_time, video_clip.duration))
                    
                    print(f"   Trim: {start_time:.2f}s - {end_time:.2f}s (duration: {end_time - start_time:.2f}s)")
                    
                    # Extract the trimmed portion
                    trimmed_clip = video_clip.subclip(start_time, end_time)
                    processed_clips.append(trimmed_clip)
                    
                    # Close the original clip to free memory
                    video_clip.close()
                
                # Concatenate all clips
                print("🔗 Concatenating video clips...")
                final_clip = concatenate_videoclips(processed_clips, method="compose")
                
                # Generate output filename
                timestamp = int(datetime.now().timestamp())
                output_filename = f"merged_{timestamp}.mp4"
                output_path = self.output_dir / output_filename
                
                # Export the merged video
                print(f"💾 Exporting merged video to: {output_path}")
                final_clip.write_videofile(
                    str(output_path),
                    codec='libx264',
                    audio_codec='aac',
                    temp_audiofile=str(temp_dir_path / "temp-audio.m4a"),
                    remove_temp=True,
                    verbose=False,
                    logger=None
                )
                
                # Close the final clip
                final_clip.close()
                
                # Close all processed clips
                for clip in processed_clips:
                    clip.close()
                
                print(f"✅ Video merge completed successfully: {output_filename}")
                
                # Return the relative path for the API response
                return f"/media/videos/generated_scene/720p30/merged/{output_filename}"
                
            except Exception as e:
                print(f"❌ Error during video merge: {str(e)}")
                # Clean up any open clips
                for clip in processed_clips:
                    try:
                        clip.close()
                    except:
                        pass
                raise
    
    def merge_videos_with_trim_ffmpeg(self, videos: List[str], trims: List[Dict[str, float]]) -> str:
        """
        Alternative merge method using ffmpeg directly (more efficient for large files)
        
        Args:
            videos: List of video filenames
            trims: List of trim objects with 'start' and 'end' keys
            
        Returns:
            Path to the merged video file
        """
        if len(videos) != len(trims):
            raise ValueError("Number of videos must match number of trim objects")
        
        if not videos:
            raise ValueError("At least one video must be provided")
        
        print(f"🎬 Starting ffmpeg video merge process for {len(videos)} videos")
        
        # Create temporary directory for processing
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_dir_path = pathlib.Path(temp_dir)
            
            try:
                # Generate output filename
                timestamp = int(datetime.now().timestamp())
                output_filename = f"merged_{timestamp}.mp4"
                output_path = self.output_dir / output_filename
                
                # Create a file list for ffmpeg concat
                concat_list_path = temp_dir_path / "concat_list.txt"
                
                with open(concat_list_path, 'w') as f:
                    for video_name, trim_data in zip(videos, trims):
                        video_path = self.find_video_file(video_name)
                        
                        start_time = trim_data.get('start', 0)
                        end_time = trim_data.get('end', 0)
                        duration = end_time - start_time
                        
                        # Ensure trim times are valid
                        if duration <= 0:
                            print(f"⚠️  Skipping {video_name}: invalid trim duration")
                            continue
                        
                        # Write concat entry
                        f.write(f"file '{video_path}'\n")
                        f.write(f"inpoint {start_time}\n")
                        f.write(f"outpoint {end_time}\n")
                
                # Build ffmpeg command
                ffmpeg_cmd = [
                    "ffmpeg",
                    "-f", "concat",
                    "-safe", "0",
                    "-i", str(concat_list_path),
                    "-c:v", "libx264",
                    "-c:a", "aac",
                    "-preset", "medium",
                    "-crf", "23",
                    "-y",  # Overwrite output
                    str(output_path)
                ]
                
                print(f"🔄 Running ffmpeg command: {' '.join(ffmpeg_cmd)}")
                
                # Run ffmpeg
                result = subprocess.run(
                    ffmpeg_cmd,
                    capture_output=True,
                    text=True,
                    check=True
                )
                
                print(f"✅ FFmpeg merge completed successfully: {output_filename}")
                
                # Return the relative path for the API response
                return f"/media/videos/generated_scene/720p30/merged/{output_filename}"
                
            except subprocess.CalledProcessError as e:
                print(f"❌ FFmpeg error: {e.stderr}")
                raise Exception(f"FFmpeg merge failed: {e.stderr}")
            except Exception as e:
                print(f"❌ Error during ffmpeg video merge: {str(e)}")
                raise

# Utility function for the API
def merge_videos(videos: List[str], trims: List[Dict[str, float]], media_path: str, use_ffmpeg: bool = True) -> str:
    """
    Main function to merge videos with trim values
    
    Args:
        videos: List of video filenames
        trims: List of trim objects with 'start' and 'end' keys
        media_path: Path to the media directory
        use_ffmpeg: Whether to use ffmpeg (True) or moviepy (False)
        
    Returns:
        Path to the merged video file
    """
    merger = VideoMerger(media_path)
    
    try:
        if use_ffmpeg:
            return merger.merge_videos_with_trim_ffmpeg(videos, trims)
        else:
            return merger.merge_videos_with_trim(videos, trims)
    except Exception as e:
        print(f"❌ Video merge failed: {str(e)}")
        raise 