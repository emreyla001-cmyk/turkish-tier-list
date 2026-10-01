import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'leagues_config.json');

function readLeaguesConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Leagues config read error:', err);
  }
  return { leagues: [], packs: [] };
}

function writeLeaguesConfig(data) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Leagues config write error:', err);
    return false;
  }
}

export async function GET() {
  const config = readLeaguesConfig();
  return NextResponse.json(config);
}

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('x-admin-token');
    if (!authHeader || authHeader !== 'admin-secret') {
      return NextResponse.json({ error: 'Yetkisiz erişim. Admin yetkisi gereklidir.' }, { status: 401 });
    }

    const body = await req.json();
    const current = readLeaguesConfig();
    const updated = {
      ...current,
      ...body,
    };
    writeLeaguesConfig(updated);
    return NextResponse.json({ success: true, config: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Hata oluştu' }, { status: 500 });
  }
}
