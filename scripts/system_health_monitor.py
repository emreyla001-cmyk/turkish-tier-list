#!/usr/bin/env python3
"""
Antigravity System Health & Endpoint Monitor Engine
---------------------------------------------------
Checks live HTTP response codes, latency, and status for key application routes
(Homepage, Legal DMCA page, Admin route, API endpoints).
"""

import os
import sys
import time
import json
import urllib.request
import urllib.error

ROUTES_TO_TEST = [
    "http://localhost:3000/",
    "http://localhost:3000/legal.html",
    "http://localhost:3000/admin",
    "https://turkish-tier-list-web-production.up.railway.app/",
]

def check_endpoint(url, timeout=5):
    start_time = time.time()
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "AntigravityHealthMonitor/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as response:
            latency_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "url": url,
                "status": response.status,
                "latency_ms": latency_ms,
                "healthy": response.status == 200
            }
    except urllib.error.HTTPError as e:
        latency_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "url": url,
            "status": e.code,
            "latency_ms": latency_ms,
            "healthy": e.code in [200, 301, 302, 307, 308]
        }
    except Exception as e:
        latency_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "url": url,
            "status": "ERROR",
            "error": str(e),
            "latency_ms": latency_ms,
            "healthy": False
        }

def run_health_check():
    results = []
    for route in ROUTES_TO_TEST:
        results.append(check_endpoint(route))
    return results

if __name__ == "__main__":
    report = run_health_check()
    print(json.dumps({"timestamp": time.strftime("%Y-%m-%d %H:%M:%S"), "health_checks": report}, indent=2, ensure_ascii=False))
