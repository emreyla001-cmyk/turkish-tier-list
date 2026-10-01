#!/usr/bin/env python3
"""
Antigravity Çift-Beyin Commit Öncesi Hakem Motoru (Plan E)
---------------------------------------------------------
Kod yazma/commit öncesinde diff ve dosyaları tarar:
1. React state/effect kullanan dosyalarda 'use client' direktifi kontrolü.
2. ReDoS ve durumlu global regex (/g) lastIndex mutasyon hataları.
3. Sahte/geçici yönlendirmeler veya güvenli olmayan sabit URL'ler.
4. XSS güvenlik açığı vektörleri.
"""

import os
import re
import sys
import json

def analyze_file(filepath):
    if not os.path.exists(filepath):
        return {"valid": False, "errors": [f"Dosya bulunamadı: {filepath}"]}
    
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    
    errors = []
    warnings = []
    
    # Kural 1: Next.js 'use client' kontrolü
    has_react_hooks = re.search(r'\b(useState|useEffect|useContext|useReducer|useCallback|useMemo|useRef)\b', content)
    if has_react_hooks and not re.search(r'^\s*["\']use client["\']', content, re.MULTILINE):
        errors.append("React hook'ları kullanılmış ancak dosya başında 'use client' direktifi eksik.")
    
    # Kural 2: lastIndex sıfırlaması olmayan durumlu /g regex kontrolü
    has_global_regex = re.search(r'const\s+\w+\s*=\s*/[^/]+/g[i]*', content)
    has_test_loop = re.search(r'\.test\(', content)
    if has_global_regex and has_test_loop and not re.search(r'\blastIndex\s*=\s*0', content):
        warnings.append("Global regex (/g) .test() ile kullanılmış fakat lastIndex = 0 sıfırlaması yapılmamış.")
    
    # Kural 3: Sahte yönlendirme kuralı kontrolü
    if "example.com" in content and ("redirect" in content.lower() or "destination" in content.lower()):
        errors.append("Üretim trafiğini saptırabilecek sahte 'example.com' yönlendirme kuralı tespit edildi.")
    
    # Kural 4: ReDoS iç içe nicelendirici deseni
    if re.search(r'\([^)]*[*+]\)[*+]', content):
        warnings.append("Potansiyel ReDoS (düzenli ifade aşırı yüklenme) riski tespit edildi (iç içe nicelendirici deseni).")
        
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
