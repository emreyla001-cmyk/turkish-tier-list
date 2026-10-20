import { NextResponse } from 'next/server';

/**
 * TURKISH TIER LIST - MERKEZİ PROFESYONEL GÜVENLİK YAZILIMI (IPS & WAF)
 * Next.js Edge seviyesinde çalışan aktif sızma engelleme ve anti-hile zırhı:
 * 1. Otomatik Kalıcı Yasaklama (Active Honeypot & Auto Perma-Ban)
 * 2. Cihaz / IP / Çerez Seviyesinde Kara Liste İnfazı
 * 3. SQL Injection & XSS Anında Engelleme
 * 4. Kötü Niyetli Bot & Scanner İmhası
 * 5. DDoS & Brute-Force Rate Limiting
 * 6. OWASP Güvenlik Başlıkları
 */

// Otomatik kalıcı banlanan IP adresleri (Bellek İnfaz Listesi)
const PERMANENT_IP_BLACKLIST = new Set();

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

// Aktif Güvenlik Tuzakları (Honeypot). Bu yollardan birine istek atan kişi / bot anında kalıcı olarak banlanır.
const HONEYPOT_TRAP_PATTERNS = [
  /\/api\/admin\/free-coins/i,
  /\/api\/dev\/god-mode/i,
  /\/admin\/exploit/i,
  /\/\.env/i,
  /\/\.git/i,
  /\/\.aws/i,
  /\/wp-admin/i,
  /\/wp-login/i,
  /\/phpmyadmin/i,
  /\/pma/i,
  /\/actuator/i,
  /\/etc\/passwd/i,
  /\.\.\//, // Dizin atlama saldırısı
  /%2e%2e%2f/i,
];

// SQL Injection ve XSS saldırı kalıpları (URL ve Parametreler için)
const ATTACK_PARAM_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
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

// In-Memory Rate Limiter
const rateLimitMap = new Map();
const CLEANUP_INTERVAL = 60 * 1000;
let lastCleanup = Date.now();

function getRateLimitRule(pathname) {
  if (pathname.startsWith('/api/')) {
    return { limit: 40, windowMs: 10 * 1000 };
  }
  if (pathname === '/giris-yap' || pathname === '/kayit-ol') {
    return { limit: 15, windowMs: 30 * 1000 };
  }
  return { limit: 120, windowMs: 10 * 1000 };
}

function checkRateLimit(ip, pathname) {
  const now = Date.now();
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

  // Statik dosyaları ve iç Next.js kaynaklarını es geç
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') && !pathname.endsWith('.html') && !pathname.endsWith('.php')
  ) {
    return NextResponse.next();
  }

  // 1. KARA LİSTE KONTROLÜ (Daha önce banlanmış cihazlar ve IP'ler anında engellenir)
  const isBannedCookie = request.cookies.get('ttl_banned')?.value === '1';
  const isBannedIp = PERMANENT_IP_BLACKLIST.has(ip);

  if (isBannedCookie || isBannedIp) {
    if (pathname !== '/yasaklandi') {
      const banUrl = new URL('/yasaklandi', request.url);
      banUrl.searchParams.set('reason', 'Kalıcı Güvenlik İhracı (Perma-Ban): Bu cihaz / IP yasaklanmıştır.');
      const res = NextResponse.redirect(banUrl);
      res.cookies.set('ttl_banned', '1', { maxAge: 315360000, path: '/' });
      return res;
    }
    return NextResponse.next();
  }

  // 2. AKTİF GÜVENLİK TUZAKLARI (HONEYPOT TRAPS - ANINDA PERMA-BAN)
  for (const trap of HONEYPOT_TRAP_PATTERNS) {
    if (trap.test(pathname)) {
      console.error(`🚨 [GÜVENLİK ALARMI] Saldırgan tuzağa düştü! Anında Kalıcı Ban (Perma-Ban): IP=${ip} Yol=${pathname}`);
      PERMANENT_IP_BLACKLIST.add(ip);

      const banUrl = new URL('/yasaklandi', request.url);
      banUrl.searchParams.set('reason', `Güvenlik Tuzağı Tetiklendi: Yetkisiz sistem dosyası/açık arama teşebbüsü (${pathname})`);
      const res = NextResponse.redirect(banUrl);
      res.cookies.set('ttl_banned', '1', { maxAge: 315360000, path: '/' });
      return res;
    }
  }

  // 3. KÖTÜ NİYETLİ OTOMATİK BOT VE SCANNER TESPİTİ
  const lowerUA = userAgent.toLowerCase();
  for (const bot of BLOCKED_USER_AGENTS) {
    if (lowerUA.includes(bot)) {
      console.warn(`[GÜVENLİK DUVARI] Zararlı bot kalıcı engellendi: IP=${ip} UA=${userAgent}`);
      PERMANENT_IP_BLACKLIST.add(ip);
      return new NextResponse('Erişim Kalıcı Olarak Engellendi: Güvenlik ihlali.', {
        status: 403,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  }

  // 4. SQL INJECTION VE XSS SALDIRI TESPİTİ (ANINDA PERMA-BAN)
  const fullUrlQuery = decodeURIComponent(search || '');
  for (const attackPattern of ATTACK_PARAM_PATTERNS) {
    if (attackPattern.test(fullUrlQuery) || attackPattern.test(pathname)) {
      console.error(`🚨 [GÜVENLİK ALARMI] SQLi / XSS saldırı teşebbüsü tespit edildi! Perma-ban uygulandı: IP=${ip} Param=${fullUrlQuery}`);
      PERMANENT_IP_BLACKLIST.add(ip);

      const banUrl = new URL('/yasaklandi', request.url);
      banUrl.searchParams.set('reason', 'SQL Injection / XSS Kod Çalıştırma Teşebbüsü');
      const res = NextResponse.redirect(banUrl);
      res.cookies.set('ttl_banned', '1', { maxAge: 315360000, path: '/' });
      return res;
    }
  }

  // 5. DDoS & BRUTE-FORCE RATE LIMITING
  const rateLimitResult = checkRateLimit(ip, pathname);
  if (!rateLimitResult.allowed) {
    console.warn(`[GÜVENLİK DUVARI] Aşırı istek (Rate Limit): IP=${ip} Yol=${pathname}`);
    return new NextResponse('Çok Fazla İstek: Kısa sürede anormal sayıda istek gönderdiniz. Lütfen bekleyin.', {
      status: 429,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Retry-After': String(rateLimitResult.resetIn || 10),
      },
    });
  }

  // 6. OWASP GÜVENLİK BAŞLIKLARINI EKLE
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  if (pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
