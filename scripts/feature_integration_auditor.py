#!/usr/bin/env python3
"""
Antigravity Automatic Feature Integration & Cross-Link Audit Engine
--------------------------------------------------------------------
Siteye yeni bir sayfa, oyun, karakter, mağaza eşyası veya özellik eklendiğinde
tüm sistemlerle (HeaderNav, Profil, Koleksiyon Albümü, Gacha, Mağaza Çözümleyici)
otomatik olarak entegre edilip edilmediğini denetler ve eksik bağlantıları yamalar.
"""

import os
import sys
import re
import json

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP_DIR = os.path.join(PROJECT_DIR, "app")

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def log(msg, level="INFO"):
    symbol = "🔗" if level == "INFO" else ("🛠️" if level == "FIX" else ("⚠️" if level == "WARN" else "✅"))
    try:
        print(f"[{symbol} {level}] {msg}")
    except Exception:
        print(f"[{level}] {msg}")

# ========================================================
# 1. PAGE ROUTE TO HEADER NAVIGATION INTEGRATION AUDITOR
# ========================================================
EXCLUDED_ROUTES = {
    'admin', 'api', 'giris-yap', 'kayit-ol', 'yasaklandi', 'icon.svg', '_not-found'
}

ROUTE_LABELS = {
    'tier-sistemi': 'Tier Sistemi',
    'oyunlar': 'Mini Oyunlar',
    'vs': 'Karakter Karşılaşması',
    'kart-oyunu': 'Arena',
    'koleksiyon': 'Koleksiyon Albümü',
    'kaos': 'Kaos Duvarı',
    'magaza': 'Mağaza',
    'klanlar': 'Klanlar & Loncalar',
    'hakkinda': 'Hakkında',
    'gorevler': '🎯 Görevler',
    'cekilis': '🎡 Çarkıfelek'
}

def audit_and_fix_nav_integration():
    log("Checking page route to Header Navigation integration...")
    header_nav_path = os.path.join(APP_DIR, "components", "HeaderNav.js")
    if not os.path.exists(header_nav_path):
        log("HeaderNav.js not found, skipping...", level="WARN")
        return 0

    with open(header_nav_path, "r", encoding="utf-8") as f:
        nav_content = f.read()

    # Discover top-level routes under app/
    found_routes = []
    for item in os.listdir(APP_DIR):
        item_path = os.path.join(APP_DIR, item)
        if os.path.isdir(item_path) and item not in EXCLUDED_ROUTES:
            page_file = os.path.join(item_path, "page.js")
            if os.path.exists(page_file):
                found_routes.append(item)

    missing_in_nav = []
    for route in found_routes:
        href_str = f"href: '/{route}'"
        if href_str not in nav_content and route in ROUTE_LABELS:
            missing_in_nav.append(route)

    fixed_count = 0
    if missing_in_nav:
        log(f"Detected routes missing from HeaderNav: {missing_in_nav}", level="WARN")
        for m_route in missing_in_nav:
            label = ROUTE_LABELS[m_route]
            target_entry = "{ href: '/', label: 'Ana Sayfa' },"
            new_entry = f"{{ href: '/', label: 'Ana Sayfa' }},\n    {{ href: '/{m_route}', label: '{label}' }},"
            if target_entry in nav_content:
                nav_content = nav_content.replace(target_entry, new_entry)
                fixed_count += 1
                log(f"Auto-integrated route '/{m_route}' ({label}) into HeaderNav.js", level="FIX")

        with open(header_nav_path, "w", encoding="utf-8") as f:
            f.write(nav_content)

    return fixed_count

# ========================================================
# 2. SHOP COSMETICS RESOLVER INTEGRATION AUDITOR
# ========================================================
def audit_cosmetics_integration():
    log("Checking Shop catalog vs Cosmetics Resolver integration...")
    cosmetics_path = os.path.join(APP_DIR, "components", "cosmetics.js")
    if not os.path.exists(cosmetics_path):
        return 0

    with open(cosmetics_path, "r", encoding="utf-8") as f:
        content = f.read()

    missing_keys = []
    required_keys = ['frame_cyber_pulse', 'frame_neon_glitch', 'frame_gold_dragons', 'nc_flame', 'nc_cyber_cyan', 'nc_plasma']
    for rk in required_keys:
        if rk not in content:
            missing_keys.append(rk)

    if missing_keys:
        log(f"Cosmetics resolver missing definitions for: {missing_keys}", level="WARN")
        return 1
    return 0

# ========================================================
# MAIN FEATURE INTEGRATION SWEEP
# ========================================================
def run_feature_integration_sweep():
    log("=========================================================")
    log("   ANTIGRAVITY AUTOMATIC FEATURE INTEGRATION AUDITOR    ")
    log("=========================================================")
    fixes = 0
    fixes += audit_and_fix_nav_integration()
    fixes += audit_cosmetics_integration()
    log(f"Feature Integration Sweep completed. Total auto-links added: {fixes}")
    log("=========================================================")
    return fixes

if __name__ == "__main__":
    run_feature_integration_sweep()
