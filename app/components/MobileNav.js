'use client';

import { usePathname } from 'next/navigation';

export default function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Keşfet', icon: '🏠' },
    { href: '/vs', label: 'VS Arenası', icon: '⚔️' },
    { href: '/sohbet', label: 'Sohbet', icon: '💬' },
    { href: '/magaza', label: 'Mağaza', icon: '🪙' },
    { href: '/profil', label: 'Profil', icon: '👤' },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobil Menü">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <a
            key={link.href}
            href={link.href}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">{link.icon}</span>
            <span className="mobile-nav-label">{link.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
