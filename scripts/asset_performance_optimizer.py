#!/usr/bin/env python3
"""
Antigravity Asset & Performance Optimizer Engine
------------------------------------------------
Scans project directory for unoptimized media assets (GIF, PNG, JPG),
reports large file sizes, and provides automated WebP conversion helpers.
"""

import os
import sys
import json

def audit_assets(project_dir="."):
    large_assets = []
    supported_exts = (".gif", ".png", ".jpg", ".jpeg", ".mp4", ".webp")
    
    for root, _, files in os.walk(project_dir):
        if any(ignored in root for ignored in ["node_modules", ".next", ".git", "vector_memory_db"]):
            continue
        for file in files:
            if file.lower().endswith(supported_exts):
                full_path = os.path.join(root, file)
                size_bytes = os.path.getsize(full_path)
                size_mb = size_bytes / (1024 * 1024)
                if size_mb > 0.5: # Flag files > 500 KB
                    large_assets.append({
                        "file": os.path.relpath(full_path, project_dir),
                        "size_mb": round(size_mb, 2),
                        "recommendation": "Convert to WebP/AVIF or host via external CDN/LFS"
                    })
                    
    return sorted(large_assets, key=lambda x: x["size_mb"], reverse=True)

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    results = audit_assets(target)
    print(json.dumps({"total_flagged": len(results), "large_assets": results[:10]}, indent=2, ensure_ascii=False))
