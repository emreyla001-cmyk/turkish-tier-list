import './globals.css';
import NavAuth from './components/NavAuth';
import Logo from './components/Logo';
import Heartbeat from './components/Heartbeat';

export const metadata = {
  title: {
    default: 'Turkish Tier List | Türk Kurgusunun Karakter Güç Sıralaması',
    template: '%s | Turkish Tier List',
  },
  description:
    'Türk dizi ve filmlerindeki karakterlerin güç, zeka, hız ve dayanıklılık sıralaması. Gerekçeleriyle incele, toplulukla tartış, karakter öner.',
  openGraph: {
    title: 'Turkish Tier List',
    description: 'Türk kurgusundaki karakterlerin güç sıralaması ve topluluk tartışmaları.',
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
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Sora:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Heartbeat />
        <header className="site-header">
          <div className="wrap nav">
            <a href="/" className="brand"><Logo /> Turkish Tier List</a>
            <nav className="nav-links">
              <a href="/#karakterler">Karakterler</a>
              <a href="/tier-sistemi">Tier Sistemi</a>
              <a href="/karakter-oner">Karakter Öner</a>
              <a href="/sohbet">Sohbet</a>
              <NavAuth />
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <div className="footer-grid">
              <div>
                <a href="/" className="brand"><Logo id="logo-g2" /> Turkish Tier List</a>
                <p>Türk dizi ve filmlerindeki karakterlerin güç sıralamasını gerekçeleriyle ortaya koyan, topluluk destekli bir başvuru sitesi.</p>
              </div>
              <div className="footer-links">
                <a href="/#karakterler">Karakterler</a>
                <a href="/tier-sistemi">Tier Sistemi</a>
                <a href="/karakter-oner">Karakter Öner</a>
                <a href="/sohbet">Sohbet</a>
                <a href="/kayit-ol">Kayıt Ol</a>
              </div>
            </div>
            <div className="footer-copy">© 2026 Turkish Tier List. Bu site resmî bir yapım veya yayıncı sitesi değildir; tüm karakter ve yapım hakları sahiplerine aittir.</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
