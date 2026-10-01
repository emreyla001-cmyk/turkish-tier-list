#!/usr/bin/env python3
"""
Antigravity Business Logic & API Authorization Audit Engine
------------------------------------------------------------
Scans Next.js App Router API endpoints (/app/api/*) for:
1. Server-side RBAC / Auth session enforcement.
2. Business Logic guards (negative balance/amount checks, atomic operations).
3. Data mutation authorization checks.
"""

import os
import re
import sys
import json

def audit_api_route(filepath):
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    filename = os.path.basename(os.path.dirname(filepath))
    issues = []
    warnings = []

    # Check 1: Is this a mutating route (POST/PUT/DELETE/PATCH)?
    is_mutation = bool(re.search(r'\b(POST|PUT|DELETE|PATCH)\b', content))

    if is_mutation:
        # Check 1a: Does it enforce server-side auth/session check?
        has_auth = bool(re.search(r'\b(getSession|getUser|auth|cookies|headers|authToken)\b', content))
        if not has_auth:
            issues.append("Mutating API route missing server-side authentication check.")

        # Check 1b: Does it validate negative values or numeric boundaries?
        has_req_body = bool(re.search(r'req\.json\(\)|request\.json\(\)', content))
        has_boundary_check = bool(re.search(r'<=?\s*0|Math\.max|>=\s*0|typeof|parseInt|parseFloat', content))
        if has_req_body and not has_boundary_check:
            warnings.append("API route accepts request body but lacks numeric boundary checks (potential negative amount manipulation).")

        # Check 1c: Race condition / double-spending warning
        has_increment = bool(re.search(r'\+\+|\+=|\-=', content))
        has_atomic_rpc = bool(re.search(r'rpc\(|\.update\(|transaction', content))
        if has_increment and not has_atomic_rpc:
            warnings.append("In-memory increment detected without atomic DB RPC/transaction (potential race condition under load).")

    return {
        "endpoint": f"/api/{filename}",
        "filepath": filepath,
        "is_mutation": is_mutation,
        "valid": len(issues) == 0,
        "issues": issues,
        "warnings": warnings
    }

def audit_all_api_routes(target_dir="app/api"):
    if not os.path.exists(target_dir):
        return {"valid": True, "message": f"Directory {target_dir} not found."}

    results = []
    for root, _, files in os.walk(target_dir):
        for file in files:
            if file in ["route.js", "route.ts"]:
                full_path = os.path.join(root, file)
                results.append(audit_api_route(full_path))

    total_issues = sum(len(r["issues"]) for r in results)
    return {
        "total_endpoints_audited": len(results),
        "total_issues": total_issues,
        "healthy": total_issues == 0,
        "audits": results
    }

if __name__ == "__main__":
    dir_arg = sys.argv[1] if len(sys.argv) > 1 else "app/api"
    res = audit_all_api_routes(dir_arg)
    print(json.dumps(res, indent=2, ensure_ascii=False))
