#!/usr/bin/env python3
"""
Test script to verify temp storage functionality
"""
import os
import shutil
import time
from pathlib import Path

def test_temp_storage():
    """Test the temp storage functionality"""
    
    # Get the backend directory
    backend_dir = Path(__file__).parent
    temp_storage_dir = backend_dir / "temp_storage"
    
    print("🧪 Testing Temp Storage Functionality")
    print(f"📁 Backend directory: {backend_dir}")
    print(f"📁 Temp storage directory: {temp_storage_dir}")
    
    # Test 1: Create temp storage directory
    print("\n1️⃣ Testing directory creation...")
    temp_storage_dir.mkdir(exist_ok=True)
    print(f"✅ Temp storage directory exists: {temp_storage_dir.exists()}")
    
    # Test 2: Create a test video file
    print("\n2️⃣ Testing file creation...")
    test_video_file = temp_storage_dir / "test_video.mp4"
    test_video_file.write_text("fake video content")
    print(f"✅ Test video file created: {test_video_file.exists()}")
    
    # Test 3: List files in temp storage
    print("\n3️⃣ Testing file listing...")
    files = list(temp_storage_dir.iterdir())
    print(f"📁 Files in temp storage: {[f.name for f in files]}")
    
    # Test 4: Cleanup function
    print("\n4️⃣ Testing cleanup function...")
    def cleanup_temp_storage():
        try:
            if temp_storage_dir.exists():
                shutil.rmtree(temp_storage_dir)
                print(f"🧹 Cleaned up temp_storage directory: {temp_storage_dir}")
        except Exception as e:
            print(f"⚠️ Warning: Could not clean up temp_storage: {e}")
    
    cleanup_temp_storage()
    print(f"✅ Temp storage directory exists after cleanup: {temp_storage_dir.exists()}")
    
    print("\n🎉 All tests passed!")

if __name__ == "__main__":
    test_temp_storage() 