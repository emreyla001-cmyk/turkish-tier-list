"""
OLLAMA YEREL YAPAY ZEKA ASİSTANI VE KESİNTİSİZ SOHBET MOTORU (PLAN A)
--------------------------------------------------------------------
Antigravity'yi yerel Ollama yapay zeka modellerine bağlar.
Sürekli sohbet (interactive mode), temiz arayüz ve akıcı Türkçe yanıtlar sunar.
"""

import subprocess
import sys
import json
import time
import urllib.request

# Windows konsol UTF-8 çıktı yapılandırması (cp1254 UnicodeEncodeError önleyici)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

OLLAMA_CHAT_URL = "http://localhost:11434/api/chat"

SYSTEM_PROMPT = (
    "Sen Antigravity Akıllı Çevrimdışı Yapay Zeka Asistanısın. "
    "Kullanıcın Ahmet Emre Yılmaz. Sen aşağıdaki Antigravity Uzmanlık Yeteneklerine ve sistem bilgisine sahipsin:\n"
    "1. Sistem & Kodlama: Next.js 14, React, Supabase PostgreSQL RLS, Node.js ve Python mimari uzmanlığı.\n"
    "2. Güvenlik & Denetim: OWASP güvenlik denetimi, 7 zorunlu doğrulama kuralı, ReDoS/XSS tespiti ve 0/NaN sınır değer kontrolleri.\n"
    "3. Otomasyon & Test: Playwright E2E tarayıcı otomasyonu, visual UI testi ve performans optimizasyonu.\n"
    "4. Çoklu-Beyin Yedekleme: Plan A (Yerel Ollama), Plan B (Claude Code CLI), Plan D (OpenAI/DeepSeek API), Plan E (Statik Hakem).\n"
    "Kullanıcı ile doğal, kibar, samimi ve akıllı bir Türkçe ile sohbet et. 'Naber' veya 'Merhaba' gibi selamlaşmalara 'İyiyim, teşekkür ederim! Size nasıl yardımcı olabilirim?' şeklinde samimi karşılık ver. "
    "Sorulan her teknik veya genel soruya yeteneklerinle ve doğru şekilde yanıt ver."
)

SECURITY_AUDIT_PROMPT = (
    "Sen Antigravity Kod Güvenlik Denetçisisin. Aşağıdaki kod değişikliklerini güvenlik açıkları ve sınır değerler açısından Türkçe olarak kısaca incele."
)

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

def query_ollama_chat(messages, model="llama3.2:latest"):
    ensure_ollama_running()

    payload = {
        "model": model,
        "messages": messages,
        "stream": False,
        "options": {
            "num_ctx": 2048,
            "num_predict": 512,
            "temperature": 0.6,
            "top_p": 0.9
        }
    }

    try:
        req = urllib.request.Request(
            OLLAMA_CHAT_URL,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            msg = res_data.get("message", {}).get("content", "").strip()
            return {"success": True, "output": msg}
    except Exception as e:
        return {"success": False, "error": f"Ollama Bağlantı Hatası: {str(e)}"}

def start_interactive_chat(model="llama3.2:latest"):
    ensure_ollama_running()
    print("=======================================================================")
    print("                YAPAY ZEKA İLE KESİNTİSİZ SOHBET MODU                  ")
    print("   (Çıkmak ve Ana Menüye dönmek için 'cikis' yazın veya Enter'a basın)   ")
    print("=======================================================================\n")

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]

    while True:
        try:
            user_input = input("Siz: ").strip()
            if not user_input or user_input.lower() in ["cikis", "çıkış", "exit", "q", "menu"]:
                print("\nSohbetten çıkılıyor, ana menüye dönülüyor...\n")
                break

            messages.append({"role": "user", "content": user_input})

            res = query_ollama_chat(messages, model=model)
            if res["success"]:
                reply = res["output"]
                print(f"\nAsistan: {reply}\n")
                print("-" * 60)
                messages.append({"role": "assistant", "content": reply})

                # Sohbet geçmişini 10 mesajla sınırla
                if len(messages) > 10:
                    messages = [messages[0]] + messages[-8:]
            else:
                print(f"\nHata: {res['error']}\n")

        except KeyboardInterrupt:
            print("\nSohbet sonlandırıldı.")
            break
        except Exception as e:
            print(f"\nHata Oluştu: {str(e)}\n")

if __name__ == "__main__":
    if "--interactive" in sys.argv or "-i" in sys.argv:
        start_interactive_chat()
    else:
        is_audit = "--audit" in sys.argv
        args = [arg for arg in sys.argv[1:] if arg not in ["--audit", "--interactive", "-i"]]
        prompt = args[0] if args else "Merhaba"

        sys_prompt = SECURITY_AUDIT_PROMPT if is_audit else SYSTEM_PROMPT
        msgs = [
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": prompt}
        ]

        res = query_ollama_chat(msgs)
        if res["success"]:
            print(f"\n[Asistan Yanıtı]:\n{res['output']}\n")
        else:
            print(f"\n[Sistem Durumu]: {res['error']}\n")
