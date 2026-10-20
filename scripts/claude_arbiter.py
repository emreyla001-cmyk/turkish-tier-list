"""
CLAUDE CODE CLI OTOMATİK HAKEMİ (PLAN B)
----------------------------------------
Yerel bilgisayardaki Claude Code CLI (v2.1.284) entegrasyonu ile kod değişikliklerini 
ve diff çıktılarını commit/push öncesinde VERIFICATION_RULES.md kurallarına göre Türkçe inceletir.
"""

import subprocess
import sys
import json

# Windows konsol UTF-8 çıktı yapılandırması (cp1254 UnicodeEncodeError önleyici)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def run_claude_review(prompt_text):
    turkish_prompt = f"{prompt_text} - Lütfen tüm incelemeyi ve önerileri Türkçe olarak yaz."
    cmd = f'claude -p "{turkish_prompt}" < NUL'
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=60, shell=True)
        if res.returncode == 0:
            return {"success": True, "output": res.stdout.strip()}
        else:
            return {"success": False, "error": res.stderr.strip() or res.stdout.strip()}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    prompt = sys.argv[1] if len(sys.argv) > 1 else "Git diff değişikliklerini VERIFICATION_RULES.md standartlarına göre Türkçe olarak incele."
    print("=================================================")
    print("   YEREL CLAUDE CODE CLI OTOMATİK İNCELEME (PLAN B)")
    print("=================================================\n")
    
    result = run_claude_review(prompt)
    if result["success"]:
        print("[Claude Yanıtı]:")
        print(result["output"])
    else:
        print("[Claude CLI Durumu]:", result["error"])
    
    print("\n=================================================")
