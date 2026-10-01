import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'events_config.json');

const DEFAULT_CONFIG = {
  karakter_bilmece: true,
  kim_alir: true,
  cift_odul: false,
  viral_paylasim: true,
  bilmece_odul: 500,
  kim_alir_odul: 750,
  son_guncelleme: new Date().toISOString(),
};

function readConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Events config read error:', err);
  }
  return DEFAULT_CONFIG;
}

function writeConfig(data) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Events config write error:', err);
    return false;
  }
}

export async function GET() {
  const config = readConfig();
  return NextResponse.json(config);
}

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('x-admin-token');
    if (!authHeader || authHeader !== 'admin-secret') {
      return NextResponse.json({ error: 'Yetkisiz erişim. Admin yetkisi gereklidir.' }, { status: 401 });
    }

    const body = await req.json();
    const current = readConfig();
    const bilmeceOdul = Math.max(0, Number(body.bilmece_odul) || current.bilmece_odul || 500);
    const kimAlirOdul = Math.max(0, Number(body.kim_alir_odul) || current.kim_alir_odul || 750);

    const updated = {
      ...current,
      ...body,
      bilmece_odul: bilmeceOdul,
      kim_alir_odul: kimAlirOdul,
      son_guncelleme: new Date().toISOString(),
    };
    writeConfig(updated);
    return NextResponse.json({ success: true, config: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Hata oluştu' }, { status: 500 });
  }
}
