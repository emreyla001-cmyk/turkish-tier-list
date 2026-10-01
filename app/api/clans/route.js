import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CLANS_FILE = path.join(DATA_DIR, 'clans.json');

const INITIAL_CLANS = [];

function ensureClansFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CLANS_FILE)) {
      fs.writeFileSync(CLANS_FILE, JSON.stringify(INITIAL_CLANS, null, 2), 'utf-8');
    }
  } catch (e) {
    console.error('Clans file init error:', e);
  }
}

function readClans() {
  ensureClansFile();
  try {
    const raw = fs.readFileSync(CLANS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_CLANS;
  }
}

function writeClans(data) {
  ensureClansFile();
  try {
    fs.writeFileSync(CLANS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    return false;
  }
}

// GET /api/clans?userId=...
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const clans = readClans();

    // CP Puanına göre sırala
    clans.sort((a, b) => (b.points || 0) - (a.points || 0));

    if (userId) {
      const myClan = clans.find((c) => c.members?.some((m) => m.id === userId));
      return NextResponse.json({ success: true, myClan: myClan || null, allClans: clans });
    }

    return NextResponse.json({ success: true, allClans: clans });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { withProtectedTransaction } from '../../lib/protectedApiWrapper';

export const POST = withProtectedTransaction(async (req, context, body) => {
  const { action } = body;
  const clans = readClans();

  // 1. KLAN KURMA (Ücret: 5.000 Tier Parası)
  if (action === 'create') {
    const { user_id, username, name, tag, emblem, description } = body;

    if (!user_id || !name?.trim() || !tag?.trim()) {
      return NextResponse.json({ error: 'Klan adı ve etiketi zorunludur' }, { status: 400 });
    }

    // Kullanıcının zaten bir klanı var mı?
    const alreadyInClan = clans.some((c) => c.members?.some((m) => m.id === user_id));
    if (alreadyInClan) {
      return NextResponse.json({ error: 'Zaten bir klan üyesisin! Önce mevcut klanından ayrılmalısın.' }, { status: 400 });
    }

    const cleanTag = tag.trim().toUpperCase().slice(0, 5);
    const isTagTaken = clans.some((c) => c.tag?.toUpperCase() === cleanTag);
    if (isTagTaken) {
      return NextResponse.json({ error: `[${cleanTag}] klan etiketi zaten alınmış.` }, { status: 400 });
    }

    const newClan = {
      id: 'clan-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: name.trim().slice(0, 30),
      tag: cleanTag,
      emblem: emblem || '🛡️',
      description: description?.trim().slice(0, 200) || 'Birlikte daha güçlüyüz!',
      leader_id: user_id,
      leader_name: username || 'Lider',
      points: 500,
      level: 1,
      members: [
        { id: user_id, username: username || 'Lider', role: 'leader', contributed_cp: 500 },
      ],
      created_at: new Date().toISOString(),
    };

    clans.unshift(newClan);
    writeClans(clans);
    return NextResponse.json({ success: true, clan: newClan });
  }

  // 2. KLANA KATILMA
  if (action === 'join') {
    const { clanId, user_id, username } = body;
    if (!clanId || !user_id) {
      return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });
    }

    const alreadyInClan = clans.some((c) => c.members?.some((m) => m.id === user_id));
    if (alreadyInClan) {
      return NextResponse.json({ error: 'Zaten bir klandasın!' }, { status: 400 });
    }

    const clan = clans.find((c) => c.id === clanId);
    if (!clan) {
      return NextResponse.json({ error: 'Klan bulunamadı' }, { status: 404 });
    }

    if (clan.members?.length >= 30) {
      return NextResponse.json({ error: 'Bu klan maksimum üye sayısına (30/30) ulaşmış!' }, { status: 400 });
    }

    clan.members = clan.members || [];
    clan.members.push({
      id: user_id,
      username: username || 'Üye',
      role: 'member',
      contributed_cp: 0,
    });

    writeClans(clans);
    return NextResponse.json({ success: true, clan });
  }

  // 3. KLANDAN AYRILMA
  if (action === 'leave') {
    const { clanId, user_id } = body;
    const clan = clans.find((c) => c.id === clanId);
    if (!clan) return NextResponse.json({ error: 'Klan bulunamadı' }, { status: 404 });

    if (clan.leader_id === user_id) {
      return NextResponse.json({ error: 'Klan lideri klandan ayrılamaz! Önce liderliği devretmeli veya klanı dağıtmalısınız.' }, { status: 400 });
    }

    clan.members = clan.members.filter((m) => m.id !== user_id);
    writeClans(clans);
    return NextResponse.json({ success: true });
  }

  // 4. KLAN PUANI (CP) KAZANMA
  if (action === 'contribute_cp') {
    const { user_id, points } = body;

    // Boundary & Falsy Check: Handle 0, NaN, invalid types, and default 50 only if undefined
    const parsedPoints = points === undefined ? 50 : Number(points);
    const numericPoints = isNaN(parsedPoints) ? 0 : Math.max(0, Math.min(1000, Math.floor(parsedPoints)));
    const clan = clans.find((c) => c.members?.some((m) => m.id === user_id));
    if (clan) {
      clan.points = (clan.points || 0) + numericPoints;
      const member = clan.members.find((m) => m.id === user_id);
      if (member) {
        member.contributed_cp = (member.contributed_cp || 0) + numericPoints;
      }
      clan.level = Math.floor(Math.sqrt((clan.points || 0) / 1000)) + 1;
      writeClans(clans);
      return NextResponse.json({ success: true, clanPoints: clan.points, clanLevel: clan.level });
    }
    return NextResponse.json({ success: false, reason: 'Klan bulunamadı' });
  }

  return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
});

