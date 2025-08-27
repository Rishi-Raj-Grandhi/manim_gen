import os
import subprocess
from backend.langraphdir.langchain_runner import generate_code

prompt = "show a  very big graphs illustrate dfs in one graph and bfs in another "
code = generate_code(prompt)

print("📜 Generated Code:\n", code)

# Save code to file
with open("generated_scene.py", "w") as f:
    f.write(code)

# Render using Manim
cmd = ["manim", "generated_scene.py", "Scene", "-qm", "-o", "output.mp4"]
result = subprocess.run(cmd)

# Check result
if result.returncode == 0:
    print("✅ Rendered video: media/videos/generated_scene/480p15/output.mp4")
else:
    print("❌ Failed to render video")
