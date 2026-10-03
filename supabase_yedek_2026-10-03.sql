-- =====================================================================
-- VERITABANI YEDEK - 2026-10-03
--
-- Bu dosya 2026-10-03 itibariyle canli veritabaninin olculmus halidir.
-- Geri almak icin: SQL Editor'da calistir.
--
-- NOT: Fonksiyon tanimlari (spend_coins, reward_coins, reward_xp, add_xp)
--      supabase_ekonomi_fix.sql icinde. Bu dosya sadece VERI + RLS durumunu
--      icerir.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) PROFIL VERISI (olculmus, 2 satir)
--
--   Nezha: coins 992100 -> 141985 olarak DUZELTILDI (gercek deger)
--   Seia : degismedi (0)
--
--   ONCEKI DEGER (geri almak istersen):
--     Nezha coins = 992100, xp = 260
--     Seia  coins = 0,      xp = 11
-- ---------------------------------------------------------------------
INSERT INTO public.profiles
  (id, username, coins, xp, role, vip_until, created_at)
VALUES
  ('185ca63a-f9ae-469f-8a01-0a2faf103010', 'Nezha', 141985, 260, 'admin',
   '2067-10-24 10:18:30.084352+00', '2026-09-28 05:47:49.964097+00'),
  ('be3ad1b6-8191-4e52-87a5-a057069c93f8', 'Seia', 0, 11, 'user',
   NULL, '2026-09-28 11:43:31.617378+00')
ON CONFLICT (id) DO UPDATE SET
  coins     = EXCLUDED.coins,
  xp        = EXCLUDED.xp,
  role      = EXCLUDED.role,
  vip_until = EXCLUDED.vip_until;

-- ---------------------------------------------------------------------
-- 2) YEDEK TABLOSU (geri alma kaynagi)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public._backup_profiles_coins (
  id           uuid PRIMARY KEY,
  coins        bigint,
  xp           bigint,
  yedek_zamani timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public._backup_profiles_coins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public._backup_profiles_coins FROM anon, authenticated;
GRANT SELECT, INSERT ON public._backup_profiles_coins TO postgres, service_role;

-- Geri alma (DURUSU geri almak icin calistir):
-- UPDATE public.profiles p SET coins = b.coins, xp = b.xp
--   FROM public._backup_profiles_coins b WHERE b.id = p.id;

-- ---------------------------------------------------------------------
-- 3) HAREKET GUNLUGU (yeni tablo)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reward_log (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    uuid   NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type text   NOT NULL,
  amount     bigint NOT NULL,
  gun        date   NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reward_log_user_gun_idx ON public.reward_log (user_id, gun);
ALTER TABLE public.reward_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS reward_log_own_read ON public.reward_log;
CREATE POLICY reward_log_own_read ON public.reward_log
  FOR SELECT TO authenticated USING (user_id = auth.uid());
REVOKE ALL ON public.reward_log FROM anon;
GRANT SELECT ON public.reward_log TO authenticated;

-- ---------------------------------------------------------------------
-- 4) profiles RLS POLITIKALARI (olculmus hali)
--
--    2 politika ALTER ile daraltildi: eskiden {public} idi (HERKES),
--    artik {authenticated}.
--
--    GERI ALMA (veri sizmasi geri gelir):
--    ALTER POLICY "Public profiles are viewable by everyone"
--      ON public.profiles TO public;
--    ALTER POLICY "profiles are public"
--      ON public.profiles TO public;
-- ---------------------------------------------------------------------

-- =====================================================================
-- 5) public_profiles VIEW (sizma oncesi olusturuldu, hala duruyor)
--    Kullanim yoksa silebilirsin - veri kaybi olmaz:
--    DROP VIEW IF EXISTS public.public_profiles;
-- =====================================================================
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT id, username, avatar_url, created_at, xp, role,
       equipped_frame, equipped_name_color
FROM public.profiles;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- =====================================================================
-- 6) CODEN KULLANILMADI - user_metadata temizligi
--    Bu HENUZ YAPILMADI (bilerek ertelendi).
--    Kod deploy EDILMEDEN calistirilirsa kullanicilar 0 gorur.
--    Alt satirlari sadece deploy sonrasi elle ac:
--
--    UPDATE auth.users
--       SET raw_user_meta_data = raw_user_meta_data - 'coins' - 'xp';
-- =====================================================================