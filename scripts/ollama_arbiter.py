"""
OLLAMA LOCAL AI AUTOMATED ARBITER
--------------------------------
Connects Antigravity to local Ollama AI models (DeepSeek R1 / Qwen 2.5 Coder)
for 100% free, offline, unlimited code reviews and security auditing.
"""

import subprocess
import sys
import json
import urllib.request

OLLAMA_URL = "http://localhost:11434/api/generate"

function_prompt = """
Review the following code diff/prompt for security vulnerabilities, boundary edge-cases,
and adherence to VERIFICATION_RULES.md.
"""

def query_ollama(prompt_text, model="llama3.2:latest"):
    payload = {
        "model": model,
        "prompt": f"{function_prompt}\n\nTask: {prompt_text}",
        "stream": False
    }

    try:
        req = urllib.request.Request(
            OLLAMA_URL,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            return {"success": True, "output": res_data.get("response", "")}
    except Exception as e:
        # Fallback to CLI command if HTTP API is warming up
        try:
            cmd = f'ollama run {model} "{prompt_text}"'
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=30, shell=True)
            if res.returncode == 0:
                return {"success": True, "output": res.stdout.strip()}
            return {"success": False, "error": f"Ollama HTTP & CLI Error: {str(e)}"}
        except Exception as cli_err:
            return {"success": False, "error": f"Ollama Connection Error: {str(e)}"}

if __name__ == "__main__":
    prompt = sys.argv[1] if len(sys.argv) > 1 else "Audit security and boundary checks."
    print("=================================================")
    print("   OLLAMA LOCAL AI AUTOMATED ARBITER (FREE)      ")
    print("=================================================\n")

    res = query_ollama(prompt)
    if res["success"]:
        print("[Ollama Output]:")
        print(res["output"])
    else:
        print("[Ollama Status]:", res["error"])
        print("Note: Run 'ollama app' or 'ollama serve' in terminal to launch local Ollama service.")

    print("\n=================================================")
