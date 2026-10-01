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
        # Check 1a: Does it enforce server-side auth/session check? (401 / 403)
        has_auth = bool(re.search(r'\b(getSession|getUser|auth|cookies|headers|authToken|authorization|x-admin-token|x-user-id|withProtectedTransaction)\b', content))
        if not has_auth:
            issues.append("Mutating API route missing server-side authentication check (401 enforcement).")

        # Check 1b: Role-based authorization distinction (403 vs 401)
        has_admin_check = bool(re.search(r'x-admin-token|admin|role', content))
        has_403_or_401 = bool(re.search(r'status:\s*(401|403)', content))
        if has_admin_check and not has_403_or_401:
            warnings.append("Admin/Role check detected but explicit 401/403 HTTP status code is missing.")

        # Check 1c: Falsy 0/NaN boundary checks & numeric validation
        has_req_body = bool(re.search(r'req\.json\(\)|request\.json\(\)', content))
        has_boundary_check = bool(re.search(r'<=?\s*0|Math\.max|isNaN|typeof|Number\(', content))
        if has_req_body and not has_boundary_check:
            warnings.append("API route accepts request body but lacks numeric boundary checks (potential negative or falsy amount manipulation).")

        # Check 1d: Falsy 0/NaN fallback bug check (Number(...) || default)
        has_falsy_fallback_bug = bool(re.search(r'Number\([^)]+\)\s*\|\|\s*\d+', content))
        if has_falsy_fallback_bug:
            issues.append("Falsy fallback bug detected (Number(...) || N). Sending points: 0 will incorrectly trigger default fallback!")

        # Check 1e: Race condition / double-spending warning & Idempotency check
        has_increment = bool(re.search(r'\+\+|\+=|\-=', content))
        has_atomic_or_idempotency = bool(re.search(r'rpc\(|\.update\(|transaction|idempotency|walletTransactionManager', content))
        if has_increment and not has_atomic_or_idempotency:
            warnings.append("In-memory increment detected without atomic DB RPC/transaction/idempotency key (potential race condition under load).")

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
