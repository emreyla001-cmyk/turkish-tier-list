import './globals.css';
import HeaderNav from './components/HeaderNav';
import Logo from './components/Logo';
import Heartbeat from './components/Heartbeat';
import BanGuard from './components/BanGuard';
import SpotlightSearch from './components/SpotlightSearch';
import MobileNav from './components/MobileNav';
import BDSNAmbientCanvas from './components/BDSNAmbientCanvas';

export const metadata = {
  title: {
    default: 'Turkish Tier List | Türk Kurgusunun Karakter Güç Sıralaması',
    template: '%s | Turkish Tier List',
  },
  description:
    'Türk dizi, film, mitoloji ve kurgusal evrenlerindeki karakterlerin güç sıralaması, VS düelloları ve topluluk tartışmaları.',
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
        <link rel="icon" href="/logo.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,600;0,700;1,700&family=Manrope:wght@400;500;600;700;800&family=Rajdhani:wght@600;700;800&family=Sora:wght@600;700;800;900&family=Unbounded:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Klavye ve ekran okuyucu kullanicilari icin: ilk Tab'da icerige atla.
            CSS'te gizli, :focus ile gorunur. <body>'nin ilk odaklanabilir cocugu. */}
        <a href="#ana-icerik" className="skip-link">İçeriğe geç</a>

        <BDSNAmbientCanvas />
        <Heartbeat />
        <BanGuard />

        {/* MERLİNTOON / UZAYMANGA MODELİ ÜST HEADER */}
        <header className="site-header">
          <div className="wrap main-header-container">
            {/* SOL LOGO & MARKA */}
            <a href="/" className="brand-logo-link">
              <Logo size={32} />
              <span className="brand-title">Turkish Tier List</span>
            </a>

            {/* ORTA: TEK ÇİZGİ MENÜ & HIZLI ARAMA */}
            <div className="header-nav-center">
              <HeaderNav />
              <div className="header-spotlight-inline">
                <SpotlightSearch />
              </div>
            </div>
          </div>
        </header>

        <main id="ana-icerik" tabIndex={-1}>{children}</main>

        {/* MODERN FOOTER (MERLİNTOON & UZAYMANGA FOOTER STYLE) */}
        <footer className="site-footer">
          <div className="wrap">
            <div className="footer-grid">
              <div>
                <a href="/" className="brand-logo-link" style={{ marginBottom: '12px' }}>
                  <Logo size={32} id="logo-g2" />
                  <span className="brand-title">Turkish Tier List</span>
                </a>
                <p style={{ color: 'var(--text-dim)', fontSize: '.88rem', lineHeight: 1.6, maxWidth: '420px' }}>
                  Türk dizi, film, mitoloji ve kurgusal evrenlerindeki karakterlerin güç sıralamasını bilimsel scaling standartlarıyla ortaya koyan topluluk platformu.
                </p>
              </div>
              <div className="footer-links-grid">
                <div>
                  <h4 style={{ fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--accent)', margin: '0 0 10px' }}>Keşfet</h4>
                  <a href="/#karakterler">Karakter Kataloğu</a>
                  <a href="/vs">VS Arenası (Düellolar)</a>
                  <a href="/kart-oyunu">Kart Oyunu & Ligler</a>
                  <a href="/tier-sistemi">Tier Sistemi Rehberi</a>
                </div>
                <div>
                  <h4 style={{ fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--accent)', margin: '0 0 10px' }}>Topluluk & Mağaza</h4>
                  <a href="/magaza">Kozmetik Mağazası</a>
                  <a href="/klanlar">Klanlar & Loncalar</a>
                  <a href="/sohbet">Canlı Sohbet Odası</a>
                  <a href="/hakkinda">Hakkında & Adil Kullanım</a>
                </div>
              </div>
            </div>
            <div className="footer-copy">
              © 2026 Turkish Tier List. Tüm hakları saklıdır. Bu platform parodi, inceleme ve adil kullanım (Fair Use) ilkesine dayanır.
            </div>
          </div>
        </footer>

        {/* MOBİL ALT NAVİGASYON ÇUBUĞU */}
        <MobileNav />
      </body>
    </html>
  );
}
