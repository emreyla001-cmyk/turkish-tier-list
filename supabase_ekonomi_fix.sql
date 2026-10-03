-- =====================================================================
-- EKONOMI GUVENLIK MIGRASYONU
-- Tarih: 2026-10-03
--
-- Amac:
--   1) Para tek kaynaga insin (profiles.coins)
--   2) Harcama sunucuda, atomik dogrulansin (spend_coins)
--   3) Kazanim tavanli ve hiz korumali olsun (reward_coins)
--   4) XP kazanimi sunucuda (reward_xp)
--   5) add_xp fonksiyonuna yetki kontrolu
--   6) profiles UPDATE'i sadece guvenli kolonlara acilsin
--
-- GERI ALMA:
--   UPDATE public.profiles p SET coins = b.coins, xp = b.xp
--   FROM public._backup_profiles_coins b WHERE b.id = p.id;
-- =====================================================================

-- ---------------------------------------------------------------------
-- ADIM 1 — Yedek (bu dosya calistirilmadan once zaten olusturuldu)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public._backup_profiles_coins (
  id           uuid PRIMARY KEY,
  coins        bigint,
  xp           bigint,
  yedek_zamani timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public._backup_profiles_coins (id, coins, xp)
SELECT p.id, p.coins, p.xp FROM public.profiles p
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- ADIM 2 — Uzlastirma: gercek bakiye user_metadata'da (141985)
--   metadata'da coins tutulan kullanicilar profiles'a hizalanir.
--   metadata'da coins OLMAYAN kullanicilara dokunulmaz.
-- ---------------------------------------------------------------------
UPDATE public.profiles p
SET coins = (u.raw_user_meta_data->>'coins')::bigint
FROM auth.users u
WHERE u.id = p.id
  AND u.raw_user_meta_data ? 'coins'
  AND (u.raw_user_meta_data->>'coins') ~ '^[0-9]+$'
  AND p.coins <> (u.raw_user_meta_data->>'coins')::bigint;

-- ---------------------------------------------------------------------
-- ADIM 3 — Hareket gunlugu
--   Hangi islem ne kadar oldu, sunucu tarafinda kaydedilir.
--   'gun' kolonu UTC gunu tutar -> gunluk tavanda saat dilimi sorunu olmaz.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reward_log (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    uuid   NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type text   NOT NULL,
  amount     bigint NOT NULL,
  gun        date   NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reward_log_user_gun_idx
  ON public.reward_log (user_id, gun);

ALTER TABLE public.reward_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reward_log_own_read ON public.reward_log;
CREATE POLICY reward_log_own_read ON public.reward_log
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

REVOKE ALL ON public.reward_log FROM anon;
GRANT SELECT ON public.reward_log TO authenticated;

-- =====================================================================
-- ADIM 4 — spend_coins : HARCAMA (istemci cagirir, sunucu dogrular)
--
--   Neden ozel fonksiyon?
--   - Tek atomik UPDATE: yarisi dusmus bakiye olusamaz.
--   - WHERE coins >= p_amount : yetersiz bakiye zaten engellenir,
--     istemciden "bakiyem yeterli" bilgisi guvenilmez.
--   - auth.uid() : sadece KENDI parasini harcar.
--
--   NOT: Fonksiyon icinde FROM public.profiles sorgusu guvenlidir.
--   SECURITY DEFINER + search_path=public ile RLS atlanir; tablo
--   KENDI POLITIKASINI sorgulamiyor -> 42P17 sonsuz dongu olusmaz.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.spend_coins(
  p_amount bigint,
  p_reason text DEFAULT 'purchase'
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_uid  uuid := auth.uid();
  v_left bigint;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Gecersiz miktar: %', p_amount USING ERRCODE = '22023';
  END IF;

  -- Atomik: kosul saglanmiyorsa hicbir satir guncellenmez.
  UPDATE public.profiles
     SET coins = coins - p_amount
   WHERE id = v_uid
     AND coins >= p_amount
  RETURNING coins INTO v_left;

  IF v_left IS NULL THEN
    RAISE EXCEPTION 'Yetersiz bakiye'
      USING ERRCODE = '23514';
  END IF;

  INSERT INTO public.reward_log (user_id, event_type, amount)
  VALUES (v_uid, 'spend:' || left(coalesce(p_reason, 'purchase'), 60), -p_amount);

  RETURN v_left;
END;
$fn$;

REVOKE ALL ON FUNCTION public.spend_coins(bigint, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.spend_coins(bigint, text) TO authenticated;

-- =====================================================================
-- ADIM 5 — reward_coins : KAZANIM
--
--   GERCEK KISIT: miktar hala istemciden gelir. Tam koruma ancak
--   oyun mantigini sunucuya tasimakla mumkun (yari gunluk is).
--   Buradaki tavanlar kazanimi durdurmaz, istismari sinirla.
--
--   - cagri basina tavan : 50.000 (gercek oyun odulleri en fazla ~1.500)
--   - gunluk tavan        : 200.000
--   - spam korumasi       : ayni sebep 3 sn icinde en fazla 2 kez
-- =====================================================================
CREATE OR REPLACE FUNCTION public.reward_coins(
  p_amount bigint,
  p_reason text DEFAULT 'reward'
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_uid   uuid := auth.uid();
  v_left  bigint;
  v_today bigint;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 50000 THEN
    RAISE EXCEPTION 'Gecersiz odul miktari: %', p_amount USING ERRCODE = '22023';
  END IF;

  SELECT coalesce(sum(amount), 0) INTO v_today
    FROM public.reward_log
   WHERE user_id = v_uid
     AND amount > 0
     AND gun = (now() AT TIME ZONE 'UTC')::date;

  IF v_today + p_amount > 200000 THEN
    RAISE EXCEPTION 'Gunluk odul tavani asildi (% / 200000)', v_today
      USING ERRCODE = '23514';
  END IF;

  IF (SELECT count(*) FROM public.reward_log
        WHERE user_id = v_uid
          AND event_type = 'reward:' || left(coalesce(p_reason,'reward'), 60)
          AND created_at > now() - interval '3 seconds') >= 2 THEN
    RAISE EXCEPTION 'Cok hizli tekrar eden islem' USING ERRCODE = '23514';
  END IF;

  UPDATE public.profiles
     SET coins = coins + p_amount
   WHERE id = v_uid
  RETURNING coins INTO v_left;

  IF v_left IS NULL THEN
    RAISE EXCEPTION 'Profil bulunamadi' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.reward_log (user_id, event_type, amount)
  VALUES (v_uid, 'reward:' || left(coalesce(p_reason,'reward'), 60), p_amount);

  RETURN v_left;
END;
$fn$;

REVOKE ALL ON FUNCTION public.reward_coins(bigint, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reward_coins(bigint, text) TO authenticated;

-- =====================================================================
-- ADIM 6 — reward_xp : XP KAZANIMI (VIP carpani sunucuda)
--   Eski add_xp yalnizca service_role'a acikti; bu istemci tarafi
--   ikamesidir ve sadece KENDI xp'sini artirir.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.reward_xp(p_amount bigint)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_uid   uuid := auth.uid();
  v_mult  int := 1;
  v_left  bigint;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 100000 THEN
    RAISE EXCEPTION 'Gecersiz xp miktari: %', p_amount USING ERRCODE = '22023';
  END IF;

  SELECT CASE WHEN role = 'vip' OR (vip_until IS NOT NULL AND vip_until > now())
              THEN 2 ELSE 1 END
    INTO v_mult
    FROM public.profiles
   WHERE id = v_uid;

  UPDATE public.profiles
     SET xp = xp + (p_amount * coalesce(v_mult, 1))
   WHERE id = v_uid
  RETURNING xp INTO v_left;

  IF v_left IS NULL THEN
    RAISE EXCEPTION 'Profil bulunamadi' USING ERRCODE = 'P0002';
  END IF;

  RETURN v_left;
END;
$fn$;

REVOKE ALL ON FUNCTION public.reward_xp(bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reward_xp(bigint) TO authenticated;

-- =====================================================================
-- ADIM 7 — add_xp yetki kontrolu
--   Sorun: fonksiyon icinde auth.uid() = u kontrolu YOKTU.
--   service_role/postgres haric kimse cagirabiliyor olsa bile,
--   yetkisiz kullanicidan birinin baskasina XP kazandirmasini engelle.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.add_xp(u uuid, amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
BEGIN
  IF auth.uid() IS DISTINCT FROM u THEN
    RAISE EXCEPTION 'Not allowed' USING ERRCODE = '42501';
  END IF;
  UPDATE public.profiles SET xp = xp + amount WHERE id = u;
END;
$fn$;

-- =====================================================================
-- ADIM 8 — Kolon bazli UPDATE
--   Profil duzenleme (avatar, renk, arka plan) calissin;
--   para, rol, vip ve ban alanlari istemciden YAZILAMAZ.
--
--   DIKKAT: Bu GRANT satiri calistirilabilmesi icin verilen kolonlarin
--   gercekten var olmasi gerekir. Calistirmadan once dogrula:
--     SELECT column_name FROM information_schema.columns
--      WHERE table_name='profiles' AND column_name IN (...);
-- =====================================================================
REVOKE UPDATE ON public.profiles FROM authenticated;

-- =====================================================================
-- ADIM 9 — EN SON: user_metadata temizligi
--   Istemci kodguncellenip DEPLOY edildikten sonra calistir.
--   Bu andan sonra metadata'daki coins/xp HIC OKUNMAZ.
-- =====================================================================
-- UPDATE auth.users
--    SET raw_user_meta_data = raw_user_meta_data - 'coins' - 'xp';