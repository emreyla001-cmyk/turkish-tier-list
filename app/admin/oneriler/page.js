'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import AdminGuard from '../../components/AdminGuard';
import TierBadge from '../../components/TierBadge';

const STATS = [['proposed_power', 'Güç'], ['proposed_intelligence', 'Zeka'], ['proposed_speed', 'Hız'], ['proposed_durability', 'Dayanıklılık'], ['proposed_influence', 'Etki']];

function Submissions() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState(null);

  async function load() {
    const { data } = await supabase
      .from('character_submissions')
      .select('*, profiles(username)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    setItems(data || []);
  }
  useEffect(() => { load(); }, []);

  async function approve(item) {
    const description = item.evidence ? `${item.proposed_scaling} (Kaynak: ${item.evidence})` : item.proposed_scaling;
    const { error } = await supabase.from('characters').insert({
      name: item.proposed_name,
      series: item.proposed_series,
      category: item.proposed_category,
      tier: item.proposed_tier,
      power_score: item.proposed_power,
      intelligence_score: item.proposed_intelligence,
      speed_score: item.proposed_speed,
      durability_score: item.proposed_durability,
      influence_score: item.proposed_influence,
      description,
      image_url: item.image_url,
      status: 'draft',
    });
    if (error) { setMsg('Eklenemedi: ' + error.message); return; }
    await supabase.from('character_submissions').update({ status: 'approved' }).eq('id', item.id);

    // Öneren kullanıcıya "🌟 Evren Katkıcısı" rozeti ve ödül tanımla
    if (item.submitted_by) {
      try {
        await fetch('/api/badges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: item.submitted_by, badgeId: 'katkici' }),
        });
        const { data: prof } = await supabase.from('profiles').select('coins, xp').eq('id', item.submitted_by).maybeSingle();
        if (prof) {
          await supabase.from('profiles').update({
            coins: (prof.coins || 0) + 1000,
            xp: (prof.xp || 0) + 500,
          }).eq('id', item.submitted_by);
        }
      } catch (err) {
        console.error('Katkıcı rozeti verilirken hata:', err);
      }
    }

    setMsg(`"${item.proposed_name}" taslak olarak eklendi! Öneren kullanıcıya "🌟 Evren Katkıcısı" rozeti ve 1.000 Tier Parası tanımlandı.`);
    load();
  }

  async function reject(item) {
    await supabase.from('character_submissions').update({ status: 'rejected' }).eq('id', item.id);
    load();
  }

  return (
    <div className="wrap">
      <h1>Bekleyen Öneriler</h1>
      {msg && <p style={{ color: 'var(--accent)' }}>{msg}</p>}
      {items.length === 0 && <p style={{ color: 'var(--text-dim)' }}>Bekleyen öneri yok.</p>}
      {items.map((item) => (
        <div key={item.id} className="card" style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0 }}>{item.proposed_name}</h3>
            {item.proposed_category && <span className="tag">{item.proposed_category}</span>}
            <TierBadge tier={item.proposed_tier} />
          </div>
          <p style={{ marginTop: '6px' }}>{item.proposed_series} · öneren: {item.profiles?.username || '—'}</p>
          <p style={{ marginTop: '8px' }}>{STATS.map(([k, l]) => `${l}: ${item[k] ?? '—'}`).join('  ·  ')}</p>
          <p style={{ marginTop: '8px' }}>{item.proposed_scaling}</p>
          {item.evidence && <p style={{ marginTop: '6px' }}>Kaynak: {item.evidence}</p>}
          {item.image_url && <p style={{ marginTop: '6px' }}><a href={item.image_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Görsel bağlantısı</a></p>}
          <div style={{ marginTop: '12px' }}>
            <button className="btn" onClick={() => approve(item)}>Onayla (taslak olarak ekle)</button>
            <button className="btn btn-ghost" onClick={() => reject(item)} style={{ marginLeft: '10px' }}>Reddet</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SubmissionsPage() {
  return (
    <AdminGuard>
      <Submissions />
    </AdminGuard>
  );
}
