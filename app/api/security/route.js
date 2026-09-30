import { NextResponse } from 'next/server';

// Sunucu tarafında kalıcı banlanan IP ve kimliklerin listesi
const SERVER_BANNED_LOG = [];

export async function POST(request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const body = await request.json().catch(() => ({}));
    const { action, userId, reason, details } = body;

    const incident = {
      id: `BAN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      ip,
      userId: userId || 'anonymous',
      action: action || 'unknown',
      reason: reason || 'Güvenlik ihlali ve hile teşebbüsü',
      details: details || {},
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'unknown',
    };

    SERVER_BANNED_LOG.push(incident);
    if (SERVER_BANNED_LOG.length > 500) {
      SERVER_BANNED_LOG.shift();
    }

    console.warn(`🚨 [GÜVENLİK SİSTEMİ - PERMA BAN]:`, incident);

    const response = NextResponse.json({
      success: true,
      banned: true,
      incidentId: incident.id,
      message: 'Kalıcı yasaklama uygulandı.',
    });

    // Tarayıcıya kalıcı ban çerezini göm
    response.cookies.set('ttl_banned', '1', {
      maxAge: 315360000,
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
  }
}

// Honeypot (Tuzak) GET isteklerini yakala
export async function GET(request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  console.warn(`🚨 [GÜVENLİK TUZAĞI TETİKLENDİ]: IP=${ip}`);

  const response = NextResponse.json(
    {
      error: 'Erişim Engellendi: Bu adrese yetkisiz erişim teşebbüsü nedeniyle IP adresiniz kalıcı olarak yasaklanmıştır.',
      banned: true,
      timestamp: new Date().toISOString(),
    },
    { status: 403 }
  );

  response.cookies.set('ttl_banned', '1', {
    maxAge: 315360000,
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
  });

  return response;
}
