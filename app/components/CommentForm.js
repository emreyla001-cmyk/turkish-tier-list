'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function CommentForm({ characterId }) {
  const [user, setUser] = useState(null);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;
    setStatus('loading');

    const { error } = await supabase.from('comments').insert({
      character_id: characterId,
      user_id: user.id,
      content,
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    setContent('');
    setStatus('Yorum eklendi! Sayfayı yenileyince görünecek.');
  }

  if (!user) {
    return (
      <p style={{ marginTop: '10px', color: 'var(--text-dim)', fontSize: '.85rem' }}>
        Yorum yapmak için <a href="/kayit-ol" style={{ color: 'var(--accent)' }}>kayıt ol</a>.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '14px' }}>
      <div className="field">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Yorumunu yaz..."
          required
        />
      </div>
      <button className="btn" type="submit">Gönder</button>
      {status && <p style={{ marginTop: '8px', color: 'var(--text-dim)', fontSize: '.8rem' }}>{status}</p>}
    </form>
  );
}
