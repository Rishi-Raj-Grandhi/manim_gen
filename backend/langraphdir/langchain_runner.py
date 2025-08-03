from dotenv import load_dotenv
import os
import subprocess
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph

# Step 1: Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in .env")

# Step 2: Initialize OpenAI Chat Model
llm = ChatOpenAI(temperature=0, api_key=OPENAI_API_KEY)

# Step 3: Define the prompt template
template = PromptTemplate.from_template("""
You are a Manim expert. Write a complete Manim Scene class in Python that follows this description:

{prompt}

Requirements:
- Use proper Manim imports (from manim import *)
- Create a class that inherits from Scene
- Include a construct method
- Make the animation visually appealing
- Use appropriate colors and timing

Only return the raw Python code, no explanations or markdown formatting.
""")

# Step 4: LangGraph Nodes

def generate_code_node(state):
    full_prompt = template.format(prompt=state["prompt"])
    response = llm.invoke(full_prompt)
    code = response.content.strip()

    # Strip markdown
    if code.startswith("```"):
        code = "\n".join(
            line for line in code.splitlines() if not line.strip().startswith("```")
        )

    state["raw_code"] = code
    return state

def verify_code_node(state):
    code = state["raw_code"]

    if not code or "class" not in code or "Scene" not in code:
        raise ValueError("Invalid code: missing Scene class")

    if "from manim import" not in code and "import manim" not in code:
        raise ValueError("Invalid code: missing Manim imports")

    state["verified_code"] = code
    return state

def render_node(state):
    code = state["verified_code"]
    retry_count = state.get("retry_count", 0)

    # Save to file with UTF-8 encoding
    with open("generated_scene.py", "w", encoding="utf-8") as f:
        f.write(code)

    print(f"🎬 Running Manim render attempt {retry_count + 1}")

    # Run Manim
    cmd = ["manim", "generated_scene.py", "Scene", "-qm", "-o", "output.mp4"]
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode == 0:
        print("✅ Rendered successfully")
        state["status"] = "success"
        return state

    # If failed
    print("❌ Render failed")
    retry_count += 1
    state["retry_count"] = retry_count
    state["error_log"] = result.stderr[:1000]  # Limit log length

    if retry_count >= 3:
        state["status"] = "fail"
    else:
        state["status"] = "retry"

    return state

def revise_prompt_node(state):
    retry_count = state.get("retry_count", 0)
    original_prompt = state["prompt"]
    error_log = state.get("error_log", "Unknown error")

    revised_prompt = f"""
    Retry attempt {retry_count}. The previous Manim code failed with the following error:\n
    {error_log}

    Please regenerate the code based on this error and improve it to work with Manim properly.
    Original prompt: {original_prompt}
    """

    state["prompt"] = revised_prompt
    return state

def format_json_node(state):
    return { "code": state["verified_code"] }

# Step 5: LangGraph Flow

builder = StateGraph(dict)

# Nodes
builder.add_node("generate", generate_code_node)
builder.add_node("verify", verify_code_node)
builder.add_node("render", render_node)
builder.add_node("revise", revise_prompt_node)
builder.add_node("format_json", format_json_node)

# Edges
builder.set_entry_point("generate")
builder.add_edge("generate", "verify")
builder.add_edge("verify", "render")

# Conditional path after render
def render_decision(state):
    if state.get("status") == "success":
        return "format_json"
    elif state.get("retry_count", 0) < 3:
        return "revise"
    else:
        raise RuntimeError("Max retries exceeded during rendering")

builder.add_conditional_edges("render", render_decision)
builder.add_edge("revise", "generate")
builder.set_finish_point("format_json")

# Compile graph
graph = builder.compile()

# Step 6: Example usage
# Step 6: Example usage
if __name__ == "__main__":
    try:
        user_prompt = """
give a reactangle illustrate its length breadth  
display area is equal to length * breadth 
"""
        result = graph.invoke({ "prompt": user_prompt })
        print("\n✅ Final Result (JSON):")
        print(result)

    except Exception as e:
        print(f"\n❌ Pipeline failed: {e}")

