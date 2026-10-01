"""
OPENAI / DEEPSEEK BULUT API HAKEMİ (PLAN D)
---------------------------------------------
Yedekleme API Hakemi - Kesintisiz çalışma garantisi (zero-downtime failover) için 
OpenAI GPT-4o ve DeepSeek Cloud API'lerini destekler.
"""

import os
import sys
import json
import urllib.request

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY") or os.environ.get("DEEPSEEK_API_KEY")
API_URL = os.environ.get("OPENAI_API_URL") or "https://api.openai.com/v1/chat/completions"

def query_openai_fallback(prompt_text, model="gpt-4o"):
    if not OPENAI_API_KEY:
        return {"success": False, "error": "OPENAI_API_KEY veya DEEPSEEK_API_KEY çevre değişkenlerinde tanımlanmamış."}

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "Sen VERIFICATION_RULES.md standartlarını uygulayan, tüm analiz ve yanıtlarını Türkçe veren kıdemli bir kod ve güvenlik denetçisisin."},
            {"role": "user", "content": f"{prompt_text}\nLütfen yanıtını 100% Türkçe olarak yaz."}
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
        return {"success": False, "error": f"OpenAI/DeepSeek API Hatası: {str(e)}"}

if __name__ == "__main__":
    prompt = sys.argv[1] if len(sys.argv) > 1 else "Güvenlik ve sınır değer kontrollerini Türkçe denetle."
    print("=================================================")
    print("   OPENAI / DEEPSEEK BULUT API HAKEMİ (PLAN D)    ")
    print("=================================================\n")

    res = query_openai_fallback(prompt)
    if res["success"]:
        print("[Plan D Yanıtı]:")
        print(res["output"])
    else:
        print("[Plan D Durumu]:", res["error"])

    print("\n=================================================")
