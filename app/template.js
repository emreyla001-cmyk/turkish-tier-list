'use client';

/**
 * Sayfa gecis animasyonu.
 *
 * Next.js App Router'da `template.js` her sayfa gecisinde YENIDEN mount olur.
 * `layout.js` mount olmaz. Yani buraya yazilan animasyon her sayfada tetiklenir —
 * `layout.js`'e yazsaydik sadece ilk yuklemede calisirdi.
 *
 * Hareket azaltma tercihi olan kullanicilar icin animasyon yok.
 */
export default function Template({ children }) {
  return <div className="sayfa-giris">{children}</div>;
}