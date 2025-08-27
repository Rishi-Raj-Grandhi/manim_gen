#!/usr/bin/env python3
"""
Comprehensive setup script for media folder structure and video generation
"""

import os
import sys
import pathlib
import subprocess

def create_media_structure():
    print("📁 Creating media folder structure...")
    
    # Get the backend directory
    backend_dir = pathlib.Path(__file__).parent
    print(f"📂 Backend directory: {backend_dir}")
    
    # Define the media structure
    media_path = backend_dir / "media"
    videos_path = media_path / "videos"
    generated_scene_path = videos_path / "generated_scene"
    output_path = generated_scene_path / "720p30"
    
    # Create all directories
    directories = [
        media_path,
        videos_path,
        generated_scene_path,
        output_path
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
        print(f"✅ Created: {directory}")
    
    # Create a test file to verify the structure
    test_file = output_path / "test.txt"
    test_file.write_text("Media folder structure created successfully!")
    print(f"✅ Test file created: {test_file}")
    
    return output_path

def test_manim_installation():
    print("\n🔧 Testing Manim installation...")
    try:
        result = subprocess.run(["manim", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Manim is installed and working")
            print(f"📋 Version: {result.stdout.strip()}")
            return True
        else:
            print("❌ Manim installation test failed")
            return False
    except FileNotFoundError:
        print("❌ Manim not found. Please install Manim first.")
        print("💡 Install with: pip install manim")
        return False

def test_video_generation():
    print("\n🧪 Testing video generation...")
    
    try:
        # Add langraphdir to path
        langraphdir_path = pathlib.Path(__file__).parent / "langraphdir"
        sys.path.append(str(langraphdir_path))
        
        # Import the LangGraph workflow
        from langchain_runner import graph
        
        # Test prompt
        test_prompt = "Create a simple red circle that grows from small to large"
        
        print(f"🎬 Testing with prompt: {test_prompt}")
        
        # Run the workflow
        result = graph.invoke({"prompt": test_prompt})
        
        print("✅ Video generation test completed!")
        print(f"📝 Generated code length: {len(result.get('code', ''))} characters")
        print(f"📹 Generated filename: {result.get('generated_filename', 'N/A')}")
        
        # Check if video file exists
        if 'generated_filename' in result:
            backend_dir = pathlib.Path(__file__).parent
            video_path = backend_dir / "media" / "videos" / "generated_scene" / "720p30" / result['generated_filename']
            
            if video_path.exists():
                print(f"✅ Video file created: {video_path}")
                print(f"📊 File size: {video_path.stat().st_size} bytes")
                return True
            else:
                print(f"❌ Video file not found: {video_path}")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False

def main():
    print("🚀 Setting up Manim Video Generator Media System...")
    print("=" * 50)
    
    # Step 1: Create media structure
    output_path = create_media_structure()
    
    # Step 2: Test Manim installation
    manim_ok = test_manim_installation()
    
    # Step 3: Test video generation (only if Manim is installed)
    video_ok = False
    if manim_ok:
        video_ok = test_video_generation()
    else:
        print("\n⚠️  Skipping video generation test (Manim not installed)")
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 SETUP SUMMARY:")
    print(f"📁 Media structure: ✅ Created")
    print(f"🔧 Manim installation: {'✅ Working' if manim_ok else '❌ Not found'}")
    print(f"🎬 Video generation: {'✅ Working' if video_ok else '❌ Failed'}")
    
    if manim_ok and video_ok:
        print("\n🎉 Setup completed successfully!")
        print(f"📂 Videos will be saved to: {output_path}")
        print("🚀 You can now run the server and frontend!")
    else:
        print("\n⚠️  Setup completed with issues:")
        if not manim_ok:
            print("   - Install Manim: pip install manim")
        if not video_ok:
            print("   - Check LangGraph workflow configuration")
    
    print("\n📝 Next steps:")
    print("   1. Start backend: python server.py")
    print("   2. Start frontend: cd frontend/my-react-app && npm run dev")
    print("   3. Open browser: http://localhost:5173")

if __name__ == "__main__":
    main() 