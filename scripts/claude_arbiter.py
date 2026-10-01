#!/usr/bin/env python3
/**
 * CLAUDE CODE CLI AUTOMATED ARBITER
 * Integrates local machine's Claude Code CLI (v2.1.284) to independently review
 * code changes against VERIFICATION_RULES.md before commits/pushes.
 */

import subprocess
import sys
import json

def run_claude_review(prompt_text):
    cmd = ["claude", "-p", prompt_text]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if res.returncode == 0:
            return {"success": True, "output": res.stdout.strip()}
        else:
            return {"success": False, "error": res.stderr.strip() or res.stdout.strip()}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    prompt = sys.argv[1] if len(sys.argv) > 1 else "Review git diff for security and boundary bugs according to VERIFICATION_RULES.md."
    print("=================================================")
    print("   LOCAL CLAUDE CODE CLI AUTOMATED REVIEW        ")
    print("=================================================\n")
    
    result = run_claude_review(prompt)
    if result["success"]:
        print("[Claude Output]:")
        print(result["output"])
    else:
        print("[Claude CLI Status]:", result["error"])
    
    print("\n=================================================")
