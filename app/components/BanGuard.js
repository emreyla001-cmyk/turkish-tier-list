'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { triggerPermaBan } from '../lib/antiCheat';

export default function BanGuard() {
  const pathname = usePathname();

  useEffect(() => {
    // Yasaklandı sayfasındayken döngüye girmeyi önle
    if (pathname === '/yasaklandi') return;

    let mounted = true;

    async function checkBanStatus() {
      if (!mounted) return;

      // 1. Çerez kontrolü
      if (typeof document !== 'undefined' && document.cookie.includes('ttl_banned=1')) {
        window.location.href = '/yasaklandi';
        return;
      }

      // 2. Supabase kullanıcı durumu kontrolü
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !mounted) return;

        // Metadata kontrolü
        if (user.user_metadata?.banned || user.user_metadata?.perma_banned) {
          window.location.href = `/yasaklandi?reason=${encodeURIComponent(user.user_metadata?.ban_reason || 'Güvenlik ihlali tespit edildi.')}`;
          return;
        }

        // Veritabanı profili kontrolü
        const { data: prof } = await supabase
          .from('profiles')
          .select('role, banned_until, ban_reason')
          .eq('id', user.id)
          .maybeSingle();

        if (prof) {
          const isBannedByRole = prof.role === 'banned';
          const isBannedByDate = prof.banned_until && new Date(prof.banned_until) > new Date();

          if (isBannedByRole || isBannedByDate) {
            document.cookie = `ttl_banned=1; Max-Age=315360000; Path=/; SameSite=Lax`;
            window.location.href = `/yasaklandi?reason=${encodeURIComponent(prof.ban_reason || 'Güvenlik kalkanı tarafından kalıcı olarak yasaklandınız.')}`;
          }
        }
      } catch (err) {
        // Hata durumunda akışı aksatma
      }
    }

    checkBanStatus();

    // Anti-Hile İhlal Olaylarını Dinle
    const handleViolation = (e) => {
      const reason = e?.detail?.reason || 'Şüpheli hile girişimi tespit edildi.';
      triggerPermaBan(reason, e?.detail?.details);
    };

    window.addEventListener('anti-cheat-violation', handleViolation);

    // Her 30 saniyede bir periyodik ban kontrolü
    const interval = setInterval(checkBanStatus, 30000);

    return () => {
      mounted = false;
      window.removeEventListener('anti-cheat-violation', handleViolation);
      clearInterval(interval);
    };
  }, [pathname]);

  return null;
}
