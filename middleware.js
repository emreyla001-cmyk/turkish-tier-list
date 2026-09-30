import { NextResponse } from 'next/server';

/**
 * TURKISH TIER LIST - MERKEZİ GÜVENLİK YAZILIMI (WAF & RATE LIMITER)
 * Next.js Edge Runtime üzerinde her isteği anlık olarak filtreler:
 * 1. SQL Injection Engelleme
 * 2. Cross-Site Scripting (XSS) Engelleme
 * 3. Dizin Tarama (Path Traversal & Probe) Engelleme
 * 4. Kötü Niyetli Bot & Tarayıcı (Scanner) Engelleme
 * 5. DDoS & Brute-Force Rate Limiting (Kayan Zaman Pencereli IP Sınırlama)
 * 6. OWASP Güvenlik Başlıkları (Security Headers)
 */

// Kötü niyetli otomatik güvenlik açığı tarayıcıları ve bot imzaları
const BLOCKED_USER_AGENTS = [
  'sqlmap',
  'nikto',
  'acunetix',
  'nessus',
  'nmap',
  'gobuster',
  'dirbuster',
  'masscan',
  'wpscan',
  'burpcollaborator',
  'havij',
  'fuzz',
  'zgrab',
];

// Yasaklı dosya yolları ve hassas sistem dosyalarını arayan saldırgan filtreleri
const BLOCKED_PATH_PATTERNS = [
  /\/\.env/i,
  /\/\.git/i,
  /\/\.aws/i,
  /\/wp-admin/i,
  /\/wp-login/i,
  /\/wp-content/i,
  /\/phpmyadmin/i,
  /\/pma/i,
  /\/actuator/i,
  /\/swagger/i,
  /\/api-docs/i,
  /\/shell/i,
  /\/eval-stdin/i,
  /\/etc\/passwd/i,
  /\.\.\//, // Path traversal
  /%2e%2e%2f/i, // Encoded path traversal
];

// SQL Injection ve XSS saldırı kalıpları (URL ve Query Parametreleri için)
const ATTACK_PARAM_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // Basic SQL comment / quote
  /(union(\s+all)?\s+select)/i,
  /(exec(\s+all)?\s+xp_)/i,
  /(waitfor\s+delay)/i,
  /(benchmark\s*\(.*,.*\))/i,
  /(sleep\s*\(.*\))/i,
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
  /<script[\s\S]*?>/i,
  /javascript\s*:/i,
  /onload\s*=/i,
  /onerror\s*=/i,
  /onclick\s*=/i,
  /document\.cookie/i,
];

// In-Memory Rate Limiting (Kayan pencere sayacı)
// Bellek şişmesini önlemek için periyodik temizlenir
const rateLimitMap = new Map();
const CLEANUP_INTERVAL = 60 * 1000; // 1 dakika
let lastCleanup = Date.now();

function getRateLimitRule(pathname) {
  if (pathname.startsWith('/api/')) {
    // API rotaları: 10 saniyede en fazla 40 istek
    return { limit: 40, windowMs: 10 * 1000 };
  }
  if (pathname === '/giris-yap' || pathname === '/kayit-ol') {
    // Giriş ve Kayıt (Brute force koruması): 30 saniyede en fazla 15 istek
    return { limit: 15, windowMs: 30 * 1000 };
  }
  // Genel sayfalar: 10 saniyede en fazla 120 istek (normal insan hızının çok üstü)
  return { limit: 120, windowMs: 10 * 1000 };
}

function checkRateLimit(ip, pathname) {
  const now = Date.now();

  // Periyodik eski kayıt temizliği
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    for (const [key, data] of rateLimitMap.entries()) {
      if (now - data.resetTime > 60000) {
        rateLimitMap.delete(key);
      }
    }
    lastCleanup = now;
  }

  const rule = getRateLimitRule(pathname);
  const key = `${ip}:${pathname.startsWith('/api') ? 'api' : 'web'}`;
  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + rule.windowMs });
    return { allowed: true, remaining: rule.limit - 1 };
  }

  current.count++;
  if (current.count > rule.limit) {
    return { allowed: false, remaining: 0, resetIn: Math.ceil((current.resetTime - now) / 1000) };
  }

  return { allowed: true, remaining: rule.limit - current.count };
}

export function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  // Statik dosyalara ve iç Next.js varlıklarına gereksiz filtre uygulamayı atla
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') && !pathname.endsWith('.html') && !pathname.endsWith('.php')
  ) {
    return NextResponse.next();
  }

  // 1. Kötü Niyetli Scanner / Bot Engelleme
  const lowerUA = userAgent.toLowerCase();
  for (const bot of BLOCKED_USER_AGENTS) {
    if (lowerUA.includes(bot)) {
      console.warn(`[GÜVENLİK DUVARI] Zararlı bot engellendi: IP=${ip} UA=${userAgent}`);
      return new NextResponse('Erişim Reddedildi: Güvenlik politikası ihlali.', {
        status: 403,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  }

  // 2. Dizin Tarama (Path Traversal) ve Hassas Dosya Probları
  for (const pattern of BLOCKED_PATH_PATTERNS) {
    if (pattern.test(pathname)) {
      console.warn(`[GÜVENLİK DUVARI] Hassas dosya tarama teşebbüsü engellendi: IP=${ip} Path=${pathname}`);
      return new NextResponse('Erişim Reddedildi: Geçersiz istek rotası.', {
        status: 403,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  }

  // 3. URL ve Query Parametrelerinde SQLi & XSS Taraması
  const fullUrlQuery = decodeURIComponent(search || '');
  for (const attackPattern of ATTACK_PARAM_PATTERNS) {
    if (attackPattern.test(fullUrlQuery) || attackPattern.test(pathname)) {
      console.warn(`[GÜVENLİK DUVARI] SQLi / XSS saldırı örüntüsü tespit edildi: IP=${ip} URL=${pathname}${search}`);
      return new NextResponse('Hatalı İstek: Güvenlik filtresi tarafından şüpheli içerik tespit edildi.', {
        status: 400,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  }

  // 4. Rate Limiting (DDoS & Brute-Force Koruması)
  const rateLimitResult = checkRateLimit(ip, pathname);
  if (!rateLimitResult.allowed) {
    console.warn(`[GÜVENLİK DUVARI] Rate limit aşıldı: IP=${ip} Path=${pathname}`);
    return new NextResponse('Çok Fazla İstek: Kısa sürede çok fazla istek gönderdiniz. Lütfen biraz bekleyin.', {
      status: 429,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Retry-After': String(rateLimitResult.resetIn || 10),
      },
    });
  }

  // 5. OWASP Güvenlik Başlıklarını Ekle
  const response = NextResponse.next();

  // Clickjacking saldırılarına karşı koruma (Sitenin başka siteler içine iframe ile gömülmesini engeller)
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  // Tarayıcıların dosya MIME türünü yanlış yorumlamasını engeller
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer sızıntılarını sınırlar
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Donanım izinlerini (kamera, mikrofon) tamamen kapatır
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // Tarayıcı XSS filtresini aktif eder
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // HTTPS zorunluluğu (HSTS)
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Admin sayfaları için tarayıcı önbelleğe almayı devre dışı bırak
  if (pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Aşağıdaki yollar dışındaki tüm rotaları filtreler:
     * - api/auth/callback (Supabase auth redirect)
     * - _next/static (statik dosyalar)
     * - _next/image (görsel optimizasyonu)
     * - favicon.ico, icon.svg vb.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
