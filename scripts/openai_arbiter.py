"""
OPENAI / DEEPSEEK CLOUD API ARBITER (PLAN D)
---------------------------------------------
Fallback API Arbiter supporting OpenAI GPT-4o / DeepSeek Cloud APIs
for zero-downtime failover resilience.
"""

import os
import sys
import json
import urllib.request

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY") or os.environ.get("DEEPSEEK_API_KEY")
API_URL = os.environ.get("OPENAI_API_URL") or "https://api.openai.com/v1/chat/completions"

def query_openai_fallback(prompt_text, model="gpt-4o"):
    if not OPENAI_API_KEY:
        return {"success": False, "error": "OPENAI_API_KEY or DEEPSEEK_API_KEY not set in environment."}

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a senior security and code review auditor enforcing VERIFICATION_RULES.md."},
            {"role": "user", "content": prompt_text}
        ],
        "temperature": 0.2
    }

    try:
        req = urllib.request.Request(
            API_URL,
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {OPENAI_API_KEY}'
            },
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            content = res_data.get("choices", [{}])[0].get("message", {}).get("content", "")
            return {"success": True, "output": content}
    except Exception as e:
        return {"success": False, "error": f"OpenAI/DeepSeek API Error: {str(e)}"}

if __name__ == "__main__":
    prompt = sys.argv[1] if len(sys.argv) > 1 else "Audit security and boundary checks."
    print("=================================================")
    print("   OPENAI / DEEPSEEK API ARBITER (PLAN D)        ")
    print("=================================================\n")

    res = query_openai_fallback(prompt)
    if res["success"]:
        print("[Plan D Output]:")
        print(res["output"])
    else:
        print("[Plan D Status]:", res["error"])

    print("\n=================================================")
