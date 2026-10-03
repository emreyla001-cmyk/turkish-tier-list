'use client';

/**
 * MOTION ROOT — Lenis smooth scroll + GSAP ScrollTrigger
 *
 * Amac: yumusak kaydirma, scroll'a bagli belirme, kademeli (stagger) giris.
 *
 * DIKKAT: sitede zaten `.stagger-in`, `.poster-card` gibi CSS animasyonlari var.
 * Burada SADECE [data-reveal] / [data-stagger] isaretli ogeler hedeflenir —
 * mevcut CSS siniflarina dokunulmaz, cift animasyon olusmaz.
 *
 * Erişilebilirlik: `prefers-reduced-motion: reduce` tercihinde HIC BIR sey
 * calismaz; kullanici hareket azaltma istiyorsa sayfa normal gorunur.
 */

import { useEffect } from 'react';

const AZALT = '(prefers-reduced-motion: reduce)';

export default function MotionRoot() {
  useEffect(() => {
    const mq = window.matchMedia(AZALT);
    if (mq.matches) return;             // kullanici hareketi azaltmak istiyor

    let iptal = false;
    let degisti_ = null;
    let lenis = null;
    let gsap = null;

    const temizle = () => {
      if (iptal) return;
      iptal = true;
      if (degisti_) mq.removeEventListener('change', degisti_);
      try { lenis?.destroy(); } catch { /* yok */ }
      try { gsap?.globalTimeline.clear(); } catch { /* temizlenemez */ }
          };

    const kur = async () => {
      // 1) Kutuphaneler (SSR'da calismaz, sadece tarayicida)
   const g = await import('gsap');
      if (iptal) return;
  gsap = g.gsap || g.default;

      const L = (await import('lenis')).default;
      if (iptal) return;

      // 2) Lenis: yumusak kaydirma
      lenis = new L({
        duration: 1.05,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.6,
      });

      // Lenis -> GSAP zaman cizelgesi: her karede ilerlet
      gsap.ticker.add((zaman) => lenis.raf(zaman * 1000));
      gsap.ticker.lagSmoothing(0);

      // 3) Scroll'a bagli belirme
      //
      // DIKKAT: Bunun icin ScrollTrigger KULLANILMADI.
      // Olculdu: Lenis + ScrollTrigger birlikte calistiginda tetiklenme
      // gerceklesmiyordu — element gecildi (rectTop -6807) ama opacity 0
    // kaldi, yani icerik gorunmez oluyordu. IntersectionObserver
      // tarayicinin kendi scroll bilgisini kullanir, Lenis'ten bagimsiz
      // calisir ve boyle bir kacmayi olusturmaz.
      const gozlemci = new IntersectionObserver((girisler) => {
        girisler.forEach((g) => {
          if (!g.isIntersecting) return;
          const el = g.target;
          const cocuklar = el.children;
          const gecikmeler = el.dataset.stagger === 'cocuk';

          if (cocuklar.length && gecikmeler) {
            gsap.from(cocuklar,
              { opacity: 0, y: 22 },
              { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.07 });
          } else {
            gsap.from(el,
              { opacity: 0, y: 28 },
              { opacity: 1, y: 0, duration: 0.72, ease: 'power3.out' });
          }
          gozlemci.unobserve(el);       // bir kez: geri don, ikinci kez oynatma
        });
      }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
      // Gozlem: ogeler GIZLENMEZ. Icerik sayfa acildiginda gorunur durur;
      // gozlemci tetiklendiginde `from()` ile animasyon baslar.
      // Boylece gozlemci hic calismasa bile (JS hatasi, uzun bolum, kenar
      // durum) icerik gorunmez kalmaz — ozellikle sunucu degil, icerik.
      gsap.utils.toArray('[data-reveal], [data-stagger]').forEach((el) => {
        if (el.dataset.stagger) el.dataset.stagger = 'cocuk';
        gozlemci.observe(el);
      });
      // 5) Ilk ekran: hero girisi
      const hero = document.querySelector('[data-hero]');
      if (hero) {
        const parcalar = hero.querySelectorAll('[data-hero-part]');
        const hedef = parcalar.length ? Array.from(parcalar) : [hero];
        hedef.forEach((el, i) => {
          gsap.from(el,
            { opacity: 0, y: 34 },
            { opacity: 1, y: 0, duration: 0.85, delay: 0.08 * i, ease: 'power3.out' });
        });
      }

      // 6) GUVENLIK AGI — bu olmadan yukaridaki gizleme kalici olur.
      // Gozlemci bir sekilde tetiklenmezse (cok uzun bolum, kenar durum,
      // JS hatasi) icerik gorunmez kalir ve kullanici sayfayi acamaz.
      // 2,5 sn sonra hala gizli olan her seyi goster.
      setTimeout(() => {
        document.querySelectorAll('[data-reveal], [data-stagger]').forEach((el) => {
          const gizli = parseFloat(getComputedStyle(el).opacity) < 0.9;
          const cocuklar = Array.from(el.children);
          const cocukGizli = cocuklar.some(
            (c) => parseFloat(getComputedStyle(c).opacity) < 0.9);
          if (gizli) {
            gsap.to(el, { opacity: 1, y: 0, duration: 0.35, overwrite: true });
          }
          if (cocukGizli) {
            gsap.to(cocuklar, { opacity: 1, y: 0, duration: 0.35, overwrite: true });
          }
        });
      }, 2500);

      // 7) Kullanici ayarini calisma aninda degistirirse      degisti_ = () => { if (mq.matches) temizle(); };
      mq.addEventListener('change', degisti_);
    };

    kur();

    return () => { temizle(); };
  }, []);

  return null;
}