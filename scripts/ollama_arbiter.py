"""
OLLAMA YEREL YAPAY ZEKA OTOMATİK HAKEMİ VE ÇEVRİMDİŞİ ASİSTAN (PLAN A)
---------------------------------------------------------------------
Antigravity'yi yerel Ollama yapay zeka modellerine (Llama 3.2 / Qwen / DeepSeek) bağlar.
%100 ücretsiz, çevrimdışı, hızlı ve Antigravity yetenekleriyle donatılmış Türkçe yanıtlar sunar.
"""

import subprocess
import sys
import json
import time
import urllib.request

# Windows konsol UTF-8 çıktı yapılandırması (cp1254 UnicodeEncodeError önleyici)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

OLLAMA_URL = "http://localhost:11434/api/generate"

SYSTEM_PROMPT = """Sen Antigravity Akıllı Çevrimdışı Yapay Zeka Asistanısın.
Görevlerin:
1. Kullanıcının sorularına, kodlama isteklerine ve sistem sorularına doğrudan, net, öz ve Türkçe olarak yanıt ver.
2. Asla gereksiz basmakalıp şablonlar veya alakasız güvenlik formları üretme.
3. Sorulan soruya odaklan; kod istendiyse kod yaz, açıklama istendiyse açıklama yap.
4. Yanıtlarını Türkçe ve akıcı bir dille sun.
"""

SECURITY_AUDIT_PROMPT = """Sen Antigravity Kod Güvenlik Denetçisisin.
Aşağıdaki kod değişikliğini güvenlik açıkları, sınır değer durumları ve VERIFICATION_RULES.md açısından Türkçe olarak kısaca incele.
"""

def ensure_ollama_running():
    """Ollama servisi çalışmıyorsa arka planda otomatik başlatır."""
    try:
        req = urllib.request.Request("http://localhost:11434/api/version", method='GET')
        with urllib.request.urlopen(req, timeout=2) as resp:
            if resp.status == 200:
                return True
    except Exception:
        try:
            subprocess.Popen(["ollama", "serve"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0)
            time.sleep(2)
            return True
        except Exception:
            return False
    return True

def query_ollama(prompt_text, model="llama3.2:latest", is_audit=False):
    ensure_ollama_running()

    sys_instruction = SECURITY_AUDIT_PROMPT if is_audit else SYSTEM_PROMPT

    payload = {
        "model": model,
        "prompt": f"{sys_instruction}\n\nKullanıcı İsteği: {prompt_text}\n\nYanıtın (Türkçe):",
        "stream": False,
        "options": {
            "num_ctx": 2048,
            "num_predict": 512,
            "temperature": 0.4,
            "top_k": 30,
            "top_p": 0.85
        }
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
            return {"success": True, "output": res_data.get("response", "").strip()}
    except Exception as e:
        try:
            cmd = f'ollama run {model} "{sys_instruction} Kullanıcı isteği: {prompt_text}"'
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=30, shell=True)
            if res.returncode == 0:
                return {"success": True, "output": res.stdout.strip()}
            return {"success": False, "error": f"Ollama Bağlantı Hatası: {str(e)}"}
        except Exception as cli_err:
            return {"success": False, "error": f"Ollama CLI Hatası: {str(e)}"}

if __name__ == "__main__":
    is_audit = "--audit" in sys.argv
    args = [arg for arg in sys.argv[1:] if arg != "--audit"]
    prompt = args[0] if args else "Merhaba, bana nasıl yardımcı olabilirsin?"

    print("=================================================")
    print("   ANTIGRAVITY ÇEVRİMDİŞİ YAPAY ZEKA ASİSTANI    ")
    print("=================================================\n")

    res = query_ollama(prompt, is_audit=is_audit)
    if res["success"]:
        print("[Asistan Yanıtı]:")
        print(res["output"])
    else:
        print("[Sistem Durumu]:", res["error"])
        print("Not: Servisi manuel başlatmak için terminalde 'ollama serve' komutunu çalıştırabilirsiniz.")

    print("\n=================================================")
