import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const BADGES_FILE = path.join(DATA_DIR, 'user_badges.json');

export const BADGE_DEFINITIONS = {
  katkici: {
    id: 'katkici',
    name: 'Evren Katkıcısı',
    icon: '🌟',
    description: 'Önerdiği karakter editör onayından geçerek Türk Kurgu Evrenine eklenen usta yazar.',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  kaos_elcisi: {
    id: 'kaos_elcisi',
    name: 'Kaos Elçisi',
    icon: '🔥',
    description: 'Kaos Duvarında Haftanın Mitik Deliliğine seçilen paylaşımın yaratıcısı.',
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.4)',
  },
  onur_muhafizi: {
    id: 'onur_muhafizi',
    name: 'Cumhuriyet & Kültür Muhafızı',
    icon: '🇹🇷',
    description: '5816 kanununa tam saygılı, Türk kültür ve destanlarını en yüksek başarımla onurlandıran elit.',
    color: '#e11d48',
    glow: 'rgba(225, 29, 72, 0.4)',
  },
};

function ensureBadgeFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(BADGES_FILE)) {
      fs.writeFileSync(BADGES_FILE, JSON.stringify({}), 'utf-8');
    }
  } catch (e) {
    console.error('Badge file init error:', e);
  }
}

function readBadges() {
  ensureBadgeFile();
  try {
    const raw = fs.readFileSync(BADGES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function writeBadges(data) {
  ensureBadgeFile();
  try {
    fs.writeFileSync(BADGES_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    return false;
  }
}

// GET /api/badges?userId=...
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const store = readBadges();

    if (userId) {
      const userBadgeIds = store[userId] || [];
      const badgeDetails = userBadgeIds.map((id) => BADGE_DEFINITIONS[id] || { id, name: id, icon: '🎖️' });
      return NextResponse.json({ success: true, badgeIds: userBadgeIds, badges: badgeDetails });
    }

    return NextResponse.json({ success: true, definitions: BADGE_DEFINITIONS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/badges (Award a badge)
export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, badgeId } = body;

    if (!userId || !badgeId) {
      return NextResponse.json({ error: 'userId ve badgeId zorunludur' }, { status: 400 });
    }

    const store = readBadges();
    const current = store[userId] || [];

    if (!current.includes(badgeId)) {
      current.push(badgeId);
      store[userId] = current;
      writeBadges(store);
    }

    return NextResponse.json({
      success: true,
      badges: current,
      awarded: BADGE_DEFINITIONS[badgeId] || { id: badgeId },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
