import { supabase } from '../../lib/supabaseClient';

/**
 * TURKISH TIER LIST - GELİŞMİŞ ANTİ-HİLE VE İHLAL YÖNETİM SİSTEMİ
 * Herhangi bir hile, açık arama veya manipülasyon teşebbüsünde
 * kullanıcıyı ve IP'yi anında kalıcı olarak yasaklar (Perma-Ban).
 */

const PERMA_BAN_DATE = '2099-12-31T23:59:59.000Z';

export async function triggerPermaBan(reason, details = {}) {
  const timestamp = new Date().toISOString();
  console.error(`🚨 [GÜVENLİK ALARMI] Hile / Saldırı Girişimi Tespit Edildi: ${reason}`, details);

  // 1. Çerez seviyesinde yasaklama (Middleware tarafından hemen yakalanması için)
  if (typeof document !== 'undefined') {
    document.cookie = `ttl_banned=1; Max-Age=315360000; Path=/; SameSite=Lax`;
    localStorage.setItem('ttl_banned', 'true');
    localStorage.setItem('ttl_ban_reason', reason);
    localStorage.setItem('ttl_ban_time', timestamp);
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Sunucu Güvenlik API'sine Bildir (IP ve Kullanıcı kara listeye alınır)
    try {
      await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'report_violation',
          userId: user?.id || 'anonymous',
          reason,
          details,
          timestamp,
        }),
      });
    } catch {}

    // 3. Kullanıcı oturumunu ve veritabanı profilini kalıcı olarak damgala
    if (user) {
      await supabase.auth.updateUser({
        data: {
          banned: true,
          perma_banned: true,
          ban_reason: reason,
          banned_at: timestamp,
          banned_until: PERMA_BAN_DATE,
        },
      });

      try {
        await supabase
          .from('profiles')
          .update({
            role: 'banned',
            banned_until: PERMA_BAN_DATE,
            ban_reason: reason,
          })
          .eq('id', user.id);
      } catch {}

      // Oturumu tamamen sonlandır
      await supabase.auth.signOut();
    }
  } catch (err) {
    console.error('Yasaklama işlemi sırasında hata:', err);
  }

  // 4. Yasaklanma ekranına yönlendir
  if (typeof window !== 'undefined') {
    const encodedReason = encodeURIComponent(reason);
    window.location.href = `/yasaklandi?reason=${encodedReason}&t=${Date.now()}`;
  }
}

/**
 * Şüpheli Değer Kontrolü (Bakiye Manipülasyonu, Negatif Sayılar, NaN Hileleri)
 */
export function checkNumericIntegrity(val, fieldName = 'Değer') {
  if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
    triggerPermaBan(`Sayısal Veri Manipülasyonu (${fieldName}): Geçersiz format tespit edildi.`);
    return false;
  }
  if (val < 0) {
    triggerPermaBan(`Sayısal Veri Manipülasyonu (${fieldName}): Negatif değer (${val}) hilesi tespit edildi.`);
    return false;
  }
  return true;
}

/**
 * Günlük Oyun Hakkı Bütünlük Kontrolü (Client-Side Exploit Engelleme)
 */
export function verifyDailyPlayIntegrity(userPlays, serverPlays, maxLimit = 5) {
  // Eğer sunucu limiti dolmuş ama yerel sayaç sıfırlanmaya çalışılmışsa hile denemesidir
  if (serverPlays >= maxLimit && userPlays < serverPlays) {
    triggerPermaBan('Günlük Hak Hilesi: Mini oyun limitlerini aşmak için sayaç sıfırlama teşebbüsü.');
    return false;
  }
  return true;
}
