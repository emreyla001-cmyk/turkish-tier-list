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

import { withProtectedTransaction } from '../../lib/protectedApiWrapper';

export async function GET() {
  const config = readLeaguesConfig();
  return NextResponse.json(config);
}

export const POST = withProtectedTransaction(async (req, context, body) => {
  const current = readLeaguesConfig();
  const updated = {
    ...current,
    ...body,
  };
  writeLeaguesConfig(updated);
  return NextResponse.json({ success: true, config: updated });
}, { requireAdmin: true });

