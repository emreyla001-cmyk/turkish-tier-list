'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import AdminGuard from '../../components/AdminGuard';

function CharacterList() {
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    supabase.from('characters').select('id, name, series, status').order('created_at', { ascending: false })
      .then(({ data }) => setCharacters(data || []));
  }, []);

  return (
    <div className="wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Karakterler</h1>
        <a href="/admin/karakterler/yeni" className="btn">+ Yeni Karakter</a>
      </div>
      <div className="grid">
        {characters.map((c) => (
          <a key={c.id} href={`/admin/karakterler/${c.id}`} className="card">
            <h3>{c.name}</h3>
            <p>{c.series || '—'}</p>
            <span className="tag">{c.status === 'published' ? 'Yayında' : 'Taslak'}</span>
          </a>
        ))}
        {characters.length === 0 && <p style={{ color: 'var(--text-dim)' }}>Henüz karakter eklenmedi.</p>}
      </div>
    </div>
  );
}

export default function AdminCharactersPage() {
  return (
    <AdminGuard>
      <CharacterList />
    </AdminGuard>
  );
}
