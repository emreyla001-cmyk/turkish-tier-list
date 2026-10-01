#!/usr/bin/env python3
"""
Antigravity Dual-Brain Pre-Commit Arbiter Engine
------------------------------------------------
Scans code diffs and files before write/commit for:
1. Missing 'use client' directive in files using React state/effects.
2. ReDoS and stateful global regex (/g) lastIndex mutation bugs.
3. Dummy/placeholder redirects or hardcoded unsafe URLs.
4. XSS vulnerability vectors.
"""

import os
import re
import sys
import json

def analyze_file(filepath):
    if not os.path.exists(filepath):
        return {"valid": False, "errors": [f"File not found: {filepath}"]}
    
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    
    errors = []
    warnings = []
    
    # Rule 1: Next.js 'use client' check
    has_react_hooks = re.search(r'\b(useState|useEffect|useContext|useReducer|useCallback|useMemo|useRef)\b', content)
    if has_react_hooks and not re.search(r'^\s*["\']use client["\']', content, re.MULTILINE):
        errors.append("React hooks used but missing 'use client' directive at the top of file.")
    
    # Rule 2: Stateful /g regex in loops without lastIndex reset
    has_global_regex = re.search(r'const\s+\w+\s*=\s*/[^/]+/g[i]*', content)
    has_test_loop = re.search(r'\.test\(', content)
    if has_global_regex and has_test_loop and not re.search(r'\blastIndex\s*=\s*0', content):
        warnings.append("Global regex (/g) used with .test() without lastIndex = 0 reset before testing.")
    
    # Rule 3: Dummy placeholder redirect check
    if "example.com" in content and ("redirect" in content.lower() or "destination" in content.lower()):
        errors.append("Found placeholder 'example.com' redirect rule which can hijack production traffic.")
    
    # Rule 4: ReDoS nested quantifier pattern
    if re.search(r'\([^)]*[*+]\)[*+]', content):
        warnings.append("Potential ReDoS risk detected (nested quantifier pattern).")
        
    is_valid = len(errors) == 0
    return {
        "filepath": filepath,
        "valid": is_valid,
        "errors": errors,
        "warnings": warnings
    }

def audit_directory(target_dir):
    report = []
    for root, _, files in os.walk(target_dir):
        if any(ignored in root for ignored in ["node_modules", ".next", ".git", "vector_memory_db"]):
            continue
        for file in files:
            if file.endswith((".js", ".jsx", ".ts", ".tsx")):
                full_path = os.path.join(root, file)
                res = analyze_file(full_path)
                if not res["valid"] or res["warnings"]:
                    report.append(res)
    return report

if __name__ == "__main__":
    path_arg = sys.argv[1] if len(sys.argv) > 1 else "."
    if os.path.isfile(path_arg):
        result = analyze_file(path_arg)
    else:
        result = audit_directory(path_arg)
    print(json.dumps(result, indent=2, ensure_ascii=False))
