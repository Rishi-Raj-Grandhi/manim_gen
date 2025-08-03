#!/usr/bin/env python3
"""
Test script to verify media paths are correct
"""

import os
import pathlib

def test_paths():
    print("🔍 Testing media paths...")
    
    # Get current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"📁 Current directory: {current_dir}")
    
    # Test backend/media path
    media_path = pathlib.Path(current_dir) / "media"
    print(f"📁 Media path: {media_path}")
    print(f"✅ Media path exists: {media_path.exists()}")
    
    # Test videos directory
    videos_dir = media_path / "videos" / "generated_scene" / "720p30"
    print(f"📁 Videos directory: {videos_dir}")
    print(f"✅ Videos directory exists: {videos_dir.exists()}")
    
    if videos_dir.exists():
        print("📹 Videos found:")
        for file in videos_dir.iterdir():
            if file.is_file():
                print(f"  - {file.name} ({file.stat().st_size} bytes)")
    
    # Test langraphdir/media path (old location)
    langraph_media_path = pathlib.Path(current_dir) / "langraphdir" / "media"
    print(f"📁 Langraph media path: {langraph_media_path}")
    print(f"✅ Langraph media path exists: {langraph_media_path.exists()}")
    
    if langraph_media_path.exists():
        langraph_videos_dir = langraph_media_path / "videos" / "generated_scene" / "720p30"
        if langraph_videos_dir.exists():
            print("📹 Videos in langraphdir:")
            for file in langraph_videos_dir.iterdir():
                if file.is_file():
                    print(f"  - {file.name} ({file.stat().st_size} bytes)")

if __name__ == "__main__":
    test_paths() 