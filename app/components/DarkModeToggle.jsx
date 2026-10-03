"use client";
import { useEffect, useState } from 'react';

/**
 * Karanlik / aydinlik mod anahtari.
 *
 * - Onceki secim `localStorage.theme` icinde ("dark" | "light")
 * - Kayit yoksa sistem tercihi (`prefers-color-scheme`) esas alinir
 *   -- bu, layout.js icindeki inline <script> ile AYNI karari verir;
 *      iki yer farkli karar verirse ikon yanlis gorunur (hydration uyusmazligi).
 * - Sistem tercihi, kullanicinin kaydi yoksa canli olarak izlenir.
 */

const SISTEM = '(prefers-color-scheme: light)';

export default function DarkModeToggle() {
  // Sunucu tarafi her zaman koyu varsayiyor; gercek durum mount sonrasi okunur
  const [dark, setDark] = useState(true);
  const [hazir, setHazir] = useState(false);

  useEffect(() => {
    const kok = document.documentElement;
    const oku = () => {
      const simdi = !kok.classList.contains('light');
      setDark(simdi);
      setHazir(true);
    };
    oku();

    // Sistem tercihi degisirse (kayit yoksa) temayi takip et
    const mq = window.matchMedia(SISTEM);
    const dinle = () => {
      if (localStorage.getItem('theme')) return;   // kullanicinin secimi var, dokunma
      const t = mq.matches ? 'light' : 'dark';
      kok.classList.remove('dark', 'light');
      kok.classList.add(t);
      setDark(t === 'dark');
    };
    mq.addEventListener('change', dinle);
    return () => mq.removeEventListener('change', dinle);
  }, []);

  const degistir = () => {
    const yeni = !dark;
    const kok = document.documentElement;
    kok.classList.remove('dark', 'light');
    kok.classList.add(yeni ? 'dark' : 'light');
    localStorage.setItem('theme', yeni ? 'dark' : 'light');
    setDark(yeni);
  };

  return (
    <button
      type="button"
      onClick={degistir}
      className="btn btn-ghost"
      aria-label={dark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
      title={dark ? 'Aydınlık Moda Geç' : 'Karanlık Moda Geç'}
      style={{ padding: '6px 12px', fontSize: '1.1rem', cursor: 'pointer' }}
    >
      {/* hazir olmadan ikon gosterme: sunucu/istemci uyusmazligi olmasin */}
      {hazir ? (dark ? '🌙' : '☀️') : <span style={{ opacity: .5 }}>◐</span>}
    </button>
  );
}