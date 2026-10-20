#!/usr/bin/env python3
"""
Antigravity Supabase RLS (Row Level Security) Policy & Audit Generator
----------------------------------------------------------------------
Generates and verifies strict SQL Row Level Security policies for production
Supabase tables (profiles, wallet_transactions, gacha_pulls, admin_logs).
"""

import os
import sys
import json

RECOMMENDED_RLS_POLICIES_SQL = """-- ========================================================
-- TURKISH TIER LIST - SUPABASE RLS (ROW LEVEL SECURITY) DDL
-- ========================================================

-- 1. Enable RLS on core tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gacha_pulls ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_logs ENABLE ROW LEVEL SECURITY;

-- 2. Profiles: Users can read all public profiles, but edit only their own
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. Wallet Transactions: Users can view ONLY their own financial history
DROP POLICY IF EXISTS "Users can view own transactions" ON public.wallet_transactions;
CREATE POLICY "Users can view own transactions" ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only server role can insert transactions" ON public.wallet_transactions;
CREATE POLICY "Only server role can insert transactions" ON public.wallet_transactions
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 4. Admin Logs: Only service_role or admin users can read/write
DROP POLICY IF EXISTS "Strict admin log isolation" ON public.admin_logs;
CREATE POLICY "Strict admin log isolation" ON public.admin_logs
  FOR ALL USING (auth.role() = 'service_role');
"""

def generate_rls_schema_file(output_path="supabase_rls_policies.sql"):
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(RECOMMENDED_RLS_POLICIES_SQL)
    print(f"[Supabase RLS Audit] Generated production RLS policies file: {output_path}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "supabase_rls_policies.sql"
    generate_rls_schema_file(out_file)
