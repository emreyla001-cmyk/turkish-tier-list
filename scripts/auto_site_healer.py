#!/usr/bin/env python3
"""
Antigravity Autonomous Site Healer & Continuous Error Audit Engine
------------------------------------------------------------------
Otomatik Site Taraması, Hata Tespiti ve Kendi Kendini İyileştirme (Auto-Fix) Yazılımı.

Bu modül aşağıdaki alanları baştan aşağı tarar ve bulunan hataları otomatik olarak düzeltir:
1. React Client Component Directives ('use client' eksikliği)
2. Kozmetik / Mağaza ID eşleme ve CSS gradient çözünürlüğü (cosmetics.js)
3. Tema ve Light Mode kontrast uyumsuzlukları (globals.css)
4. API Rotası Yetkilendirme & Sayısal Sınır Hataları (boundary/auth guards)
5. Next.js Derleme Hataları & Syntax/Import Kesintileri (npm run build auto-fix loop)
"""

import os
import sys
import re
import subprocess
import json
from datetime import datetime

# Windows CP1254 terminal desteği için UTF-8 stdout yapılandırması
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP_DIR = os.path.join(PROJECT_DIR, "app")
SCRATCH_DIR = os.path.join(PROJECT_DIR, ".scratch")

def log(msg, level="INFO"):
    symbol = "ℹ️" if level == "INFO" else ("🛠️" if level == "FIX" else ("⚠️" if level == "WARN" else "✅"))
    print(f"[{symbol} {level}] {msg}")

def run_cmd(cmd_str, cwd=PROJECT_DIR):
    res = subprocess.run(cmd_str, shell=True, capture_output=True, text=True, cwd=cwd)
    return res.returncode, res.stdout, res.stderr

# ========================================================
# 1. CLIENT DIRECTIVE INSPECTOR & AUTO-FIXER
# ========================================================
CLIENT_HOOKS = [
    r'\buseState\b', r'\buseEffect\b', r'\buseRouter\b', r'\busePathname\b',
    r'\buseSearchParams\b', r'\buseRef\b', r'\buseCallback\b', r'\buseMemo\b',
    r'\bonClick\b', r'\bonChange\b', r'\bonSubmit\b', r'\bonKeyDown\b'
]

def audit_and_fix_client_directives():
    log("Scanning React components for missing 'use client' directives...")
    fixed_count = 0
    checked_count = 0

    for root, _, files in os.walk(APP_DIR):
        for file in files:
            if file.endswith((".js", ".jsx", ".ts", ".tsx")):
                checked_count += 1
                filepath = os.path.join(root, file)
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()

                # İstemci kancası içeriyor mu?
                needs_client = any(re.search(hook, content) for hook in CLIENT_HOOKS)
                has_directive = content.strip().startswith('"use client";') or content.strip().startswith("'use client';")

                if needs_client and not has_directive:
                    new_content = '"use client";\n' + content
                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    fixed_count += 1
                    rel_path = os.path.relpath(filepath, PROJECT_DIR)
                    log(f"Auto-injected 'use client' into {rel_path}", level="FIX")

    log(f"Client Directives Audit completed. Checked: {checked_count}, Auto-fixed: {fixed_count}")
    return fixed_count

# ========================================================
# 2. COSMETICS RESOLVER AUDITOR & AUTO-FIXER
# ========================================================
def audit_and_fix_cosmetics():
    log("Auditing Mağaza / Cosmetics item mapping definitions...")
    cosmetics_path = os.path.join(APP_DIR, "components", "cosmetics.js")
    if not os.path.exists(cosmetics_path):
        log("cosmetics.js file not found, skipping...", level="WARN")
        return 0

    with open(cosmetics_path, "r", encoding="utf-8") as f:
        content = f.read()

    fixed = False
    # getAnimatedFrameInfo içinde bilinen gradient kontrolü var mı?
    if "const knownGrad = KNOWN_FRAMES[key];" not in content:
        target = "if (val.includes(key)) return info;"
        replacement = """if (val === key || val.includes(key)) return info;
    const knownGrad = KNOWN_FRAMES[key];
    if (knownGrad && (val === knownGrad || val.includes(knownGrad))) return info;"""
        if target in content:
            content = content.replace(target, replacement)
            fixed = True
            log("Patched getAnimatedFrameInfo resolver for strict string & gradient matching", level="FIX")

    if fixed:
        with open(cosmetics_path, "w", encoding="utf-8") as f:
            f.write(content)
        return 1
    return 0

# ========================================================
# 3. LIGHT MODE THEME CONTRAST AUTO-INSPECTOR
# ========================================================
def audit_and_fix_theme_contrast():
    log("Checking Light Mode text contrast & CSS variables...")
    globals_css = os.path.join(APP_DIR, "globals.css")
    if not os.path.exists(globals_css):
        return 0

    with open(globals_css, "r", encoding="utf-8") as f:
        content = f.read()

    fixed = False
    if "html.light h1" not in content:
        light_overrides = """
/* Auto-injected Light Mode Contrast Guard */
html.light h1, html.light h2, html.light h3, html.light h4, 
html.light .brand-title, html.light .poster-name, 
html.light .hero-spotlight-title, html.light .card h3 {
  color: #0f172a !important;
}
html.light .poster-series, html.light .section-head p, 
html.light .card p, html.light .unified-nav-item {
  color: #475569;
}
"""
        content += light_overrides
        fixed = True
        log("Auto-injected high-contrast light mode text rules into globals.css", level="FIX")

    if fixed:
        with open(globals_css, "w", encoding="utf-8") as f:
            f.write(content)
        return 1
    return 0

# ========================================================
# 4. API ROUTE BOUNDARY & AUTH AUDITOR
# ========================================================
def audit_api_routes():
    log("Running Business Logic & API Authorization Audit...")
    code, out, err = run_cmd("python scripts/business_logic_audit.py")
    if code == 0:
        log("API Security & Business Logic Audit: ALL ENDPOINTS HEALTHY", level="INFO")
    else:
        log(f"API Audit warnings detected: {out}", level="WARN")
    return code == 0

# ========================================================
# 5. SELF-HEALING BUILD LOOP (AUTOMATED COMPILATION)
# ========================================================
def self_heal_build_loop(max_attempts=4):
    log("Launching Automated Build & Syntax Verification Loop ('npm run build')...")

    attempt = 0
    while attempt < max_attempts:
        attempt += 1
        log(f"Build Verification Attempt {attempt}/{max_attempts}...")
        code, stdout, stderr = run_cmd("npm run build")

        if code == 0:
            log("Build verification SUCCESSFUL! All routes compiled cleanly with 0 errors.", level="INFO")
            return True, "Clean Build"

        output = stdout + "\n" + stderr
        log(f"Build failed with error code {code}. Analyzing failure trace...", level="WARN")

        # Auto-diagnosis 1: Missing client directive
        match_client = re.search(r"You're importing a component that needs \w+\. It only works in a Client Component.*?([a-zA-Z0-9_/\\-]+\.(?:jsx|js|tsx|ts))", output, re.DOTALL)
        if match_client:
            target_file = match_client.group(1).strip()
            if os.path.exists(target_file):
                with open(target_file, "r+", encoding="utf-8") as f:
                    c = f.read()
                    if not c.startswith('"use client";'):
                        f.seek(0, 0)
                        f.write('"use client";\n' + c)
                        log(f"Auto-fixed missing 'use client' in {target_file}", level="FIX")
                        continue

        # Auto-diagnosis 2: Missing export or default import error
        match_export = re.search(r"Attempted import error: '([^']+)' is not exported from '([^']+)'", output)
        if match_export:
            sym, mod = match_export.groups()
            log(f"Export mismatch detected for '{sym}' in '{mod}'. Manual trace required.", level="WARN")
            break

    return False, "Build repair loop completed with remaining issues."

# ========================================================
# MAIN AUTOMATED HEALTH SWEEP & AUTO-HEAL EXECUTION
# ========================================================
def run_full_site_healing_sweep():
    log("=========================================================")
    log("   ANTIGRAVITY AUTONOMOUS SITE HEALER & AUTO-FIX ENGINE  ")
    log("=========================================================")

    fixes_applied = 0
    fixes_applied += audit_and_fix_client_directives()
    fixes_applied += audit_and_fix_cosmetics()
    fixes_applied += audit_and_fix_theme_contrast()
    audit_api_routes()

    success, build_msg = self_heal_build_loop()

    report = {
        "timestamp": datetime.now().isoformat(),
        "fixes_applied_total": fixes_applied,
        "build_status": "SUCCESS" if success else "FAILED",
        "detail": build_msg
    }

    os.makedirs(SCRATCH_DIR, exist_ok=True)
    report_file = os.path.join(SCRATCH_DIR, "auto_heal_report.json")
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    log("=========================================================")
    log(f"HEALING SWEEP COMPLETED! Total Fixes Applied: {fixes_applied}")
    log(f"Build Verification: {'✅ PASSED' if success else '❌ NEEDS ATTENTION'}")
    log(f"Full Report saved to: {report_file}")
    log("=========================================================")
    return success

if __name__ == "__main__":
    success = run_full_site_healing_sweep()
    sys.exit(0 if success else 1)
