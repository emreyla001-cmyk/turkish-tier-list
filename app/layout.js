import './globals.css';
import HeaderNav from './components/HeaderNav';
import DarkModeToggle from './components/DarkModeToggle.jsx';
import Logo from './components/Logo';
import Heartbeat from './components/Heartbeat';
import BanGuard from './components/BanGuard';
import SpotlightSearch from './components/SpotlightSearch';
import MobileNav from './components/MobileNav';

export const metadata = {
  title: {
    default: 'Turkish Tier List | Türk Kurgusunun Karakter Güç Sıralaması',
    template: '%s | Turkish Tier List',
  },
  description:
    'Türk dizi ve filmlerindeki karakterlerin güç, zeka, hız ve dayanıklılık sıralaması. Gerekçeleriyle incele, VS arenasında karşılaştır, toplulukla tartış.',
  openGraph: {
    title: 'Turkish Tier List',
    description: 'Türk kurgusundaki karakterlerin güç sıralaması, VS düelloları ve topluluk tartışmaları.',
    type: 'website',
    locale: 'tr_TR',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Heartbeat />
        <BanGuard />
        <header className="site-header">
          <div className="wrap nav">
            <div className="nav-brand-group">
              <a href="/" className="brand">
                <Logo /> <span>Turkish Tier List</span>
              </a>
            </div>

            {/* Hızlı Arama Butonu (Ctrl+K) */}
            <div className="nav-search-wrap">
              <SpotlightSearch />
            </div>

            <div className="flex items-center space-x-2">
            <DarkModeToggle />
          </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="site-footer">
          <div className="wrap">
            <div className="footer-grid">
              <div>
                <a href="/" className="brand">
                  <Logo id="logo-g2" /> Turkish Tier List
                </a>
                <p>
                  Türk dizi, film ve kurgusal evrenlerindeki karakterlerin güç sıralamasını bilimsel scaling kurallarıyla ortaya koyan, topluluk destekli modern başvuru platformu.
                </p>
              </div>
              <div className="footer-links">
                <a href="/#karakterler">Karakter Kataloğu</a>
                <a href="/vs">VS Arenası (Düellolar)</a>
                <a href="/tier-sistemi">Tier Sistemi Rehberi</a>
                <a href="/karakter-oner">Yeni Karakter Öner</a>
                <a href="/sohbet">Canlı Sohbet Odası</a>
                <a href="/kayit-ol">Topluluğa Katıl</a>
              </div>
            </div>
            <div className="footer-copy">
              © 2026 Turkish Tier List. Bu site resmî bir yapım veya yayıncı sitesi değildir; tüm karakter ve yapım hakları ilgili sahiplerine aittir.
            </div>
          </div>
        </footer>

        {/* Mobil Ekranlar İçin Alt Navigasyon Çubuğu */}
        <MobileNav />
      </body>
    </html>
  );
}
