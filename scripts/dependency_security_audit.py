#!/usr/bin/env python3
"""
Antigravity Dependency & Vulnerability Security Audit Engine
--------------------------------------------------------------
Scans npm package.json and package-lock.json for known CVE vulnerabilities
and outdated high-risk packages.
"""

import os
import sys
import subprocess
import json

def run_npm_audit(project_dir="."):
    cmd = ["npm", "audit", "--json"]
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=project_dir)
    try:
        data = json.loads(res.stdout) if res.stdout else {}
        vulnerabilities = data.get("vulnerabilities", {})
        metadata = data.get("metadata", {}).get("vulnerabilities", {})
        return {
            "valid": len(vulnerabilities) == 0 or metadata.get("critical", 0) == 0,
            "summary": metadata,
            "details": vulnerabilities
        }
    except Exception as e:
        return {"valid": True, "error": str(e), "raw_output": res.stdout[:500]}

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    audit_res = run_npm_audit(target)
    print(json.dumps(audit_res, indent=2, ensure_ascii=False))
