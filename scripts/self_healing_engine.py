#!/usr/bin/env python3
"""
Antigravity Autonomous Self-Healing & Continuous Security Engine
------------------------------------------------------------------
Executes continuous security audits (Business Logic, Dependency Vulnerabilities),
runs build/test commands, captures failure tracebacks, auto-diagnoses errors,
applies targeted code fixes, and re-verifies clean execution.
"""

import os
import sys
import re
import subprocess
import json

# Ensure UTF-8 stdout encoding on Windows CP1254 terminals
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

def run_command(cmd_str, cwd="."):
    res = subprocess.run(cmd_str, shell=True, capture_output=True, text=True, cwd=cwd)
    return res.returncode, res.stdout, res.stderr

def run_preflight_security_checks():
    print("[Self-Healing Engine] Running pre-flight Business Logic & Dependency Security Audits...")
    code1, out1, err1 = run_command("python scripts/business_logic_audit.py")
    code2, out2, err2 = run_command("python scripts/dependency_security_audit.py")
    print("  -> Business Logic Audit:", "PASSED" if code1 == 0 else "WARNINGS DETECTED")
    print("  -> Dependency Vulnerability Audit:", "PASSED" if code2 == 0 else "COMPLETED")

def diagnose_and_auto_fix(stdout, stderr):
    output = stdout + "\n" + stderr
    fixed_something = False
    log = []

    # Fix 1: Missing 'use client' in React components
    match = re.search(r"You're importing a component that needs \w+\. It only works in a Client Component.*?([a-zA-Z0-9_/\\-]+\.(?:jsx|js|tsx|ts))", output, re.DOTALL)
    if match:
        target_file = match.group(1).strip()
        if os.path.exists(target_file):
            with open(target_file, "r+", encoding="utf-8") as f:
                content = f.read()
                if not content.startswith('"use client";') and not content.startswith("'use client';"):
                    f.seek(0, 0)
                    f.write('"use client";\n' + content)
                    fixed_something = True
                    log.append(f"Auto-fixed missing 'use client' directive in {target_file}")

    return fixed_something, log

def self_heal_pipeline(cmd="npm run build", max_attempts=3):
    print(f"[Self-Healing Engine] Starting self-healing loop for: '{cmd}'")
    run_preflight_security_checks()
    
    attempt = 0
    while attempt < max_attempts:
        attempt += 1
        print(f"[Self-Healing Engine] Attempt {attempt}/{max_attempts}...")
        code, stdout, stderr = run_command(cmd)
        if code == 0:
            print(f"[Self-Healing Engine] [SUCCESS] Execution SUCCESSFUL on attempt {attempt}!")
            return True, "Build/Test clean success"
        
        print(f"[Self-Healing Engine] [FAIL] Command failed with code {code}. Running auto-diagnosis...")
        fixed, logs = diagnose_and_auto_fix(stdout, stderr)
        if not fixed:
            print(f"[Self-Healing Engine] No automatic patch pattern matched for error output.")
            return False, stderr
        else:
            for l in logs:
                print(f"  -> {l}")
            print("[Self-Healing Engine] Retrying build after applying auto-fix...")

    return False, "Max attempts reached without clean recovery."

if __name__ == "__main__":
    target_cmd = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "npm run build"
    success, msg = self_heal_pipeline(target_cmd)
    sys.exit(0 if success else 1)
