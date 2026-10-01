"""
OLLAMA YEREL YAPAY ZEKA OTOMATİK HAKEMİ (PLAN A)
------------------------------------------------
Antigravity'yi yerel Ollama yapay zeka modellerine (DeepSeek R1 / Qwen 2.5 Coder / Llama 3.2) bağlar.
%100 ücretsiz, çevrimdışı ve sınırsız Türkçe kod incelemesi ve güvenlik denetimi sağlar.
"""

import subprocess
import sys
import json
import urllib.request

OLLAMA_URL = "http://localhost:11434/api/generate"

function_prompt = """
Aşağıdaki kod değişikliğini ve isteği güvenlik açıkları, sınır değer durumları (boundary edge cases), 
0/NaN kontrolü ve VERIFICATION_RULES.md kuralları açısından Türkçe olarak detaylıca incele ve yanıtını 100% Türkçe ver.
"""

def query_ollama(prompt_text, model="llama3.2:latest"):
    payload = {
        "model": model,
        "prompt": f"{function_prompt}\n\nGörev: {prompt_text}\n\nLütfen tüm analizini ve açıklamalarını Türkçe yaz.",
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
        # HTTP servisi başlatılmamışsa veya ısınıyorsa CLI komutuna geçiş yapılır
        try:
            cmd = f'ollama run {model} "{prompt_text} (Yanıtı Türkçe ver)"'
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=30, shell=True)
            if res.returncode == 0:
                return {"success": True, "output": res.stdout.strip()}
            return {"success": False, "error": f"Ollama HTTP & CLI Hatası: {str(e)}"}
        except Exception as cli_err:
            return {"success": False, "error": f"Ollama Bağlantı Hatası: {str(e)}"}

if __name__ == "__main__":
    prompt = sys.argv[1] if len(sys.argv) > 1 else "Güvenlik ve sınır değer kontrollerini Türkçe incele."
    print("=================================================")
    print("   OLLAMA YEREL YAPAY ZEKA HAKEMİ (ÜCRETSİZ / PLAN A)")
    print("=================================================\n")

    res = query_ollama(prompt)
    if res["success"]:
        print("[Ollama Yanıtı]:")
        print(res["output"])
    else:
        print("[Ollama Durumu]:", res["error"])
        print("Not: Çevrimdışı servisi başlatmak için terminalde 'ollama app' veya 'ollama serve' komutunu çalıştırabilirsiniz.")

    print("\n=================================================")
