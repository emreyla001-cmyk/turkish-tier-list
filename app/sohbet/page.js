'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import UserBadge, { Avatar, NameTag } from '../components/UserBadge';
import { useFrameMap } from '../components/useFrameMap';
import UserProfileModal from '../components/UserProfileModal';

const SELECT = 'id, user_id, content, created_at, profiles(username, avatar_url, role, xp, equipped_frame, equipped_name_color, vip_until)';

function formatTime(iso) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === new Date().toDateString()) return time;
  return `${d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })} ${time}`;
}

export default function SohbetPage() {
  const frameMap = useFrameMap();
  const [user, setUser] = useState(null);
  const [me, setMe] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const boxRef = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: p } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
        setMe(p);
      }
    });

    supabase.from('chat_messages').select(SELECT).order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => setMessages((data || []).reverse()));

    const channel = supabase
      .channel('chat_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, async (payload) => {
        const { data } = await supabase.from('chat_messages').select(SELECT).eq('id', payload.new.id).maybeSingle();
        if (data) setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_messages' }, (payload) => {
        setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const el = boxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const isStaff = me?.role === 'admin' || me?.role === 'moderator';

  async function handleSend(e) {
    e.preventDefault();
    const content = text.trim();
    if (!content || !user) return;
    setError(null);
    const { error: err } = await supabase.from('chat_messages').insert({ user_id: user.id, content });
    if (err) { setError('Mesaj gönderilemedi.'); return; }
    setText('');
  }

  async function handleDelete(id) {
    if (!confirm('Bu mesajı silmek istiyor musun?')) return;
    const { error: err } = await supabase.from('chat_messages').delete().eq('id', id);
    if (err) { setError('Mesaj silinemedi.'); return; }
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="wrap">
      <h1>Sohbet</h1>
      <div className="card chat-box" ref={boxRef}>
        {messages.length === 0 && <p>Henüz mesaj yok, ilk mesajı sen yaz.</p>}
        {messages.map((m) => (
          <div className="msg" key={m.id}>
            <Avatar
              url={m.profiles?.avatar_url}
              name={m.profiles?.username || '?'}
              frameGradient={frameMap ? (frameMap[m.profiles?.equipped_frame] || m.profiles?.equipped_frame) : m.profiles?.equipped_frame}
              onClick={() => setSelectedUser(m.user_id)}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="msg-head">
                <span
                  className="msg-name"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedUser(m.user_id)}
                  title="Profili Gör / Moderatör İşlemleri"
                >
                  <NameTag
                    name={m.profiles?.username || 'kullanıcı'}
                    color={frameMap ? (frameMap[m.profiles?.equipped_name_color] || m.profiles?.equipped_name_color) : m.profiles?.equipped_name_color}
                  />
                </span>
                <UserBadge role={m.profiles?.role} xp={m.profiles?.xp} vipActive={m.profiles?.vip_until && new Date(m.profiles.vip_until) > new Date()} />
                <span className="msg-time">{formatTime(m.created_at)}</span>
                {user && (m.user_id === user.id || isStaff) && (
                  <button className="msg-del" onClick={() => handleDelete(m.id)}>Sil</button>
                )}
              </div>
              <p>{m.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Kullanıcı Profili & Hızlı Moderasyon Modalı */}
      {selectedUser && (
        <UserProfileModal
          userId={selectedUser}
          onClose={() => setSelectedUser(null)}
          currentViewerRole={me?.role || 'user'}
        />
      )}

      {error && <p style={{ color: 'var(--accent-2)', fontSize: '.85rem' }}>{error}</p>}

      {user ? (
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <div className="field" style={{ flex: 1, margin: 0 }}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Mesaj yaz..." maxLength={500} />
          </div>
          <button className="btn" type="submit">Gönder</button>
        </form>
      ) : (
        <p style={{ marginTop: '12px', color: 'var(--text-dim)' }}>
          Sohbete yazmak için <a href="/giris-yap" style={{ color: 'var(--accent)' }}>giriş yap</a> ya da <a href="/kayit-ol" style={{ color: 'var(--accent)' }}>kayıt ol</a>.
        </p>
      )}
    </div>
  );
}
