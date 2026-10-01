"use client";
import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setDark(false);
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      setDark(true);
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !dark;
    setDark(newDark);
    const root = document.documentElement;
    if (newDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      type="button"
      aria-label="Karanlık/Aydınlık Modu Değiştir"
      onClick={toggleTheme}
      className="btn btn-ghost"
      title={dark ? "Aydınlık Moda Geç" : "Karanlık Moda Geç"}
      style={{ padding: '6px 12px', fontSize: '1.1rem', cursor: 'pointer' }}
    >
      {dark ? '🌙' : '☀️'}
    </button>
  );
}
