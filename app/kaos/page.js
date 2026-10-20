'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import UserBadge, { Avatar, NameTag } from '../components/UserBadge';
import { resolveFrame, resolveNameColor } from '../components/cosmetics';

const CATEGORIES = [
  { id: 'all', label: 'Tümü', icon: '🌐' },
  { id: 'meme', label: 'Meme & Mizah', icon: '🎭' },
  { id: 'tier_list', label: 'Çılgın Tier List', icon: '📊' },
  { id: 'sicak_teori', label: 'Sıcak Teori', icon: '⚡' },
  { id: 'tartisma', label: 'Tartışma / VS', icon: '⚔️' },
];

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Az önce';
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

export default function KaosDuvariPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userBadges, setUserBadges] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hot'); // 'hot' | 'mythic' | 'newest'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [toast, setToast] = useState(null);

  // Yeni Paylaşım Form State
  const [form, setForm] = useState({
    title: '',
    category: 'tartisma',
    content: '',
    image_url: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    // Kullanıcı bilgisini çek
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data?.user || null;
      setUser(u);
      if (u) {
        const { data: p } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, role, xp, equipped_frame, equipped_name_color')
          .eq('id', u.id)
          .maybeSingle();

        setProfile(p || {
          id: u.id,
          username: u.user_metadata?.username || u.email?.split('@')[0],
          avatar_url: u.user_metadata?.avatar_url || null,
          role: 'user',
          xp: 0,
        });

        // Kullanıcı rozetlerini çek
        fetch(`/api/badges?userId=${u.id}`)
          .then((res) => res.json())
          .then((d) => {
            if (d.badgeIds) setUserBadges(d.badgeIds);
          })
          .catch(() => {});
      }
    });

    loadPosts(activeTab, selectedCategory);
  }, []);

  async function loadPosts(tab = activeTab, cat = selectedCategory) {
    setLoading(true);
    try {
      const res = await fetch(`/api/kaos?tab=${tab}&category=${cat}`);
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Kaos posts yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    loadPosts(tab, selectedCategory);
  }

  function handleCategoryChange(cat) {
    setSelectedCategory(cat);
    loadPosts(activeTab, cat);
  }

  // Oy Verme (Optimistic UI)
  async function handleVote(postId, type) {
    if (!user) {
      showToast('⚠️ Oy vermek için önce giriş yapmalısın!');
      return;
    }

    // Optimistic Update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const up = new Set(p.upvoted_by || []);
        const down = new Set(p.downvoted_by || []);

        if (type === 'up') {
          if (up.has(user.id)) {
            up.delete(user.id);
          } else {
            up.add(user.id);
            down.delete(user.id);
          }
        } else {
          if (down.has(user.id)) {
            down.delete(user.id);
          } else {
            down.add(user.id);
            up.delete(user.id);
          }
        }

        return {
          ...p,
          upvotes: up.size,
          downvotes: down.size,
          upvoted_by: Array.from(up),
          downvoted_by: Array.from(down),
        };
      })
    );

    try {
      await fetch('/api/kaos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'vote',
          postId,
          userId: user.id,
          type,
        }),
      });
    } catch (err) {
      console.error('Oy verme hatası:', err);
    }
  }

  // Yorum Gönderme
  async function handleSendComment(postId) {
    if (!user) {
      showToast('⚠️ Yorum yapmak için giriş yapmalısın!');
      return;
    }

    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      const res = await fetch('/api/kaos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'comment',
          postId,
          user_id: user.id,
          username: profile?.username || user.email?.split('@')[0],
          avatar_url: profile?.avatar_url || null,
          text,
        }),
      });

      const data = await res.json();
      if (data.comment) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              comments: [...(p.comments || []), data.comment],
            };
          })
        );
        setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
        showToast('✓ Yorumun eklendi!');
      }
    } catch (err) {
      console.error('Yorum eklenemedi:', err);
    }
  }

  // Yeni Kaos Paylaşımı Oluşturma
  async function handleCreatePost(e) {
    e.preventDefault();
    if (!user) {
      showToast('⚠️ Paylaşım yapmak için giriş yapmalısın!');
      return;
    }

    if (!form.title.trim() || !form.content.trim()) {
      showToast('⚠️ Lütfen başlık ve açıklama giriniz.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/kaos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          content: form.content,
          image_url: form.image_url,
          author: {
            id: user.id,
            username: profile?.username || user.email?.split('@')[0],
            role: profile?.role || 'user',
            equipped_frame: profile?.equipped_frame || null,
            equipped_name_color: profile?.equipped_name_color || null,
            badges: userBadges,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.post) {
        setPosts((prev) => [data.post, ...prev]);
        setShowCreateModal(false);
        setForm({ title: '', category: 'tartisma', content: '', image_url: '' });
        showToast('🔥 Kaos başlatıldı! Paylaşımın duvarda.');
      } else {
        showToast('❌ Hata: ' + (data.error || 'Gönderilemedi'));
      }
    } catch (err) {
      showToast('❌ Beklenmeyen bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  }

  const copyPostLink = (id) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/kaos#${id}`);
      showToast('🔗 Paylaşım bağlantısı kopyalandı!');
    }
  };

  // En yüksek oy alan haftanın mitik deliliği
  const mythicPost = posts.length > 0
    ? [...posts].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))[0]
    : null;

  return (
    <div className="wrap" style={{ maxWidth: '960px', paddingBottom: '90px' }}>
      {/* Toast Bildirimi */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#18181b',
            color: '#fef08a',
            padding: '12px 20px',
            borderRadius: '10px',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
            zIndex: 9999,
            fontWeight: 700,
            fontSize: '.9rem',
          }}
        >
          {toast}
        </div>
      )}

      {/* Üst Başlık & Kaos Başlat Butonu */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginTop: '20px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '1.8rem' }}>
            <span>🔥</span> Topluluk Kaos Duvarı
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '.92rem', margin: '6px 0 0' }}>
            En hararetli tartışmalar, tartışmalı tier listeler, Türk kurgu memeleri ve mitik teoriler!
          </p>
        </div>

        <button
          type="button"
          className="btn"
          onClick={() => (user ? setShowCreateModal(true) : showToast('⚠️ Paylaşım yapmak için giriş yapmalısın!'))}
          style={{
            fontWeight: 800,
            padding: '10px 22px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>➕</span> Kaos Başlat
        </button>
      </div>

      {/* HAFTANIN MİTİK DELİLİĞİ VİTRİNİ */}
      {mythicPost && (mythicPost.upvotes - mythicPost.downvotes) > 10 && (
        <div
          className="card"
          style={{
            marginBottom: '28px',
            padding: '22px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(245, 158, 11, 0.08))',
            border: '2px solid rgba(245, 158, 11, 0.6)',
            boxShadow: '0 0 35px rgba(245, 158, 11, 0.15)',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span
              className="tag"
              style={{
                background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
                color: '#fff',
                fontWeight: 900,
                fontSize: '.78rem',
                letterSpacing: '.5px',
                padding: '4px 12px',
              }}
            >
              👑 HAFTANIN MİTİK DELİLİĞİ
            </span>
            <span style={{ fontSize: '.84rem', color: '#fef08a', fontWeight: 700 }}>
              🔥 Net Kaos Puanı: +{mythicPost.upvotes - mythicPost.downvotes}
            </span>
          </div>

          <h2 style={{ fontSize: '1.35rem', margin: '0 0 10px', color: '#fef08a' }}>
            {mythicPost.title}
          </h2>
          <p style={{ color: '#e4e4e7', fontSize: '.92rem', lineHeight: 1.55, margin: '0 0 14px', whiteSpace: 'pre-line' }}>
            {mythicPost.content}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Avatar
                url={mythicPost.author?.avatar_url}
                name={mythicPost.author?.username}
                size={26}
                frameGradient={mythicPost.author?.equipped_frame}
              />
              <span style={{ fontSize: '.86rem', fontWeight: 700, color: 'var(--text-dim)' }}>
                {mythicPost.author?.username}
              </span>
              <UserBadge
                role={mythicPost.author?.role}
                badges={mythicPost.author?.badges}
              />
            </div>

            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: '.82rem', padding: '6px 14px', color: '#fef08a' }}
              onClick={() => {
                const el = document.getElementById(mythicPost.id);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Tartışmaya Katıl ({mythicPost.comments?.length || 0} Yorum) →
            </button>
          </div>
        </div>
      )}

      {/* SEKME VE KATEGORİ ÇUBUĞU */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
        {/* Sıralama Sekmeleri */}
        <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'hot' ? '' : 'btn-ghost'}`}
            style={{ fontWeight: 800, fontSize: '.88rem' }}
            onClick={() => handleTabChange('hot')}
          >
            🔥 En Hararetli (Kaos)
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'mythic' ? '' : 'btn-ghost'}`}
            style={{ fontWeight: 800, fontSize: '.88rem' }}
            onClick={() => handleTabChange('mythic')}
          >
            👑 Haftanın Mitik Deliliği
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'newest' ? '' : 'btn-ghost'}`}
            style={{ fontWeight: 800, fontSize: '.88rem' }}
            onClick={() => handleTabChange('newest')}
          >
            ✨ En Yeniler
          </button>
        </div>

        {/* Kategori Filtre Butonları */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CATEGORIES.map((c) => {
            const isSel = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleCategoryChange(c.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '.82rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: isSel ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: isSel ? 'rgba(234, 179, 8, 0.15)' : 'var(--bg-2)',
                  color: isSel ? 'var(--accent)' : 'var(--text-dim)',
                  transition: 'all .2s ease',
                }}
              >
                {c.icon} {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* GÖNDERİ LİSTESİ */}
      {loading ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
          Kaos yükleniyor... 🔥
        </div>
      ) : posts.length === 0 ? (
        <div className="card" style={{ padding: '50px', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem' }}>🦗</span>
          <h3 style={{ margin: '12px 0 6px' }}>Burada Henüz Kaos Yok!</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '.9rem' }}>
            İlk tartışmayı başlatan veya en komik tier listeyi paylaşan sen ol.
          </p>
          <button
            type="button"
            className="btn"
            style={{ marginTop: '14px', fontWeight: 800 }}
            onClick={() => setShowCreateModal(true)}
          >
            🔥 İlk Paylaşımı Yap
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map((post) => {
            const netScore = (post.upvotes || 0) - (post.downvotes || 0);
            const userUpvoted = user && post.upvoted_by?.includes(user.id);
            const userDownvoted = user && post.downvoted_by?.includes(user.id);
            const isCommentsOpen = activeCommentsPostId === post.id;
            const comments = post.comments || [];

            return (
              <article
                key={post.id}
                id={post.id}
                className="card"
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '20px',
                  borderRadius: '14px',
                  background: 'var(--bg-1)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Sol Taraf: Reddit Stili Upvote / Downvote */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    minWidth: '42px',
                    paddingTop: '2px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleVote(post.id, 'up')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.3rem',
                      color: userUpvoted ? '#f59e0b' : 'var(--text-dim)',
                      transition: 'transform .15s ease',
                      padding: '2px',
                    }}
                    title="Hak Verdim (Upvote)"
                  >
                    ▲
                  </button>
                  <span
                    style={{
                      fontSize: '.95rem',
                      fontWeight: 900,
                      color: netScore > 0 ? '#f59e0b' : netScore < 0 ? '#ef4444' : 'var(--text-dim)',
                    }}
                  >
                    {netScore}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleVote(post.id, 'down')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.3rem',
                      color: userDownvoted ? '#ef4444' : 'var(--text-dim)',
                      transition: 'transform .15s ease',
                      padding: '2px',
                    }}
                    title="Katılmıyorum (Downvote)"
                  >
                    ▼
                  </button>
                </div>

                {/* Sağ Taraf: İçerik */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Başlık Üstü Meta Bilgisi */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                      marginBottom: '8px',
                      fontSize: '.82rem',
                    }}
                  >
                    <span
                      className="tag"
                      style={{
                        background: 'rgba(234, 179, 8, 0.1)',
                        color: 'var(--accent)',
                        fontWeight: 800,
                        fontSize: '.75rem',
                        textTransform: 'uppercase',
                      }}
                    >
                      {CATEGORIES.find((c) => c.id === post.category)?.label || post.category}
                    </span>

                    <Avatar
                      url={post.author?.avatar_url}
                      name={post.author?.username}
                      size={22}
                      frameGradient={post.author?.equipped_frame}
                    />

                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      <NameTag name={post.author?.username} color={post.author?.equipped_name_color} />
                    </span>

                    <UserBadge
                      role={post.author?.role}
                      badges={post.author?.badges}
                    />

                    <span style={{ color: 'var(--text-dim)' }}>• {timeAgo(post.created_at)}</span>
                  </div>

                  {/* Post Başlığı */}
                  <h3 style={{ fontSize: '1.2rem', margin: '0 0 10px', color: 'var(--text-main)' }}>
                    {post.title}
                  </h3>

                  {/* Post Metni */}
                  <p
                    style={{
                      fontSize: '.92rem',
                      lineHeight: 1.6,
                      color: 'var(--text-dim)',
                      margin: '0 0 14px',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {post.content}
                  </p>

                  {/* Varsa Görsel */}
                  {post.image_url && (
                    <div style={{ marginBottom: '14px', borderRadius: '10px', overflow: 'hidden', maxHeight: '420px' }}>
                      <img
                        src={post.image_url}
                        alt={post.title}
                        style={{ width: '100%', height: 'auto', objectFit: 'contain', background: '#000' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  )}

                  {/* Alt Etkileşim Çubuğu */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setActiveCommentsPostId(isCommentsOpen ? null : post.id)}
                      style={{ fontSize: '.84rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span>💬</span>
                      <strong>{comments.length} Yorum</strong>
                    </button>

                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => copyPostLink(post.id)}
                      style={{ fontSize: '.84rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span>🔗</span> Paylaş
                    </button>
                  </div>

                  {/* Yorumlar Bölümü (Açılır Kapanır) */}
                  {isCommentsOpen && (
                    <div
                      style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      {/* Yorum Yazma Formu */}
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder={user ? 'Tartışmaya katıl, yorumunu yaz...' : 'Yorum yapmak için giriş yapmalısın...'}
                          disabled={!user}
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSendComment(post.id); }}
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: '8px',
                            background: 'var(--bg-2)',
                            border: '1px solid var(--border)',
                            color: '#fff',
                            fontSize: '.88rem',
                          }}
                        />
                        <button
                          type="button"
                          className="btn"
                          disabled={!user || !commentInputs[post.id]?.trim()}
                          onClick={() => handleSendComment(post.id)}
                          style={{ padding: '10px 18px', fontWeight: 800, fontSize: '.85rem' }}
                        >
                          Gönder
                        </button>
                      </div>

                      {/* Yorumlar Listesi */}
                      {comments.length === 0 ? (
                        <p style={{ color: 'var(--text-dim)', fontSize: '.82rem', margin: '4px 0' }}>
                          Henüz kimse yorum yapmadı. İlk yorumu sen yaz!
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                          {comments.map((c) => (
                            <div
                              key={c.id}
                              style={{
                                padding: '10px 14px',
                                background: 'var(--bg-2)',
                                borderRadius: '8px',
                                fontSize: '.85rem',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <strong style={{ color: 'var(--accent)' }}>{c.username}</strong>
                                <span style={{ color: 'var(--text-dim)', fontSize: '.75rem' }}>{timeAgo(c.created_at)}</span>
                              </div>
                              <p style={{ margin: 0, color: '#e4e4e7', lineHeight: 1.4 }}>{c.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* YENİ KAOS PAYLAŞIMI MODALI */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '620px',
              padding: '28px',
              background: '#121215',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔥</span> Kaos Başlat (Paylaşım Yap)
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost}>
              <div className="field">
                <label>Kategori Seç *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-2)', color: '#fff', border: '1px solid var(--border)' }}
                >
                  <option value="tartisma">⚔️ Tartışma / VS Analizi</option>
                  <option value="tier_list">📊 Çılgın Tier List</option>
                  <option value="meme">🎭 Meme & Mizah</option>
                  <option value="sicak_teori">⚡ Sıcak Teori</option>
                </select>
              </div>

              <div className="field">
                <label>Başlık *</label>
                <input
                  type="text"
                  placeholder="Örn: Ezel vs Ramiz Dayı: Kim kimi alt ederdi?"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  maxLength={120}
                  required
                />
              </div>

              <div className="field">
                <label>Açıklama & Argümanın *</label>
                <textarea
                  rows={6}
                  placeholder="Argümanlarını, scaling detaylarını ya da tier listesi maddelerini buraya yaz..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  maxLength={2500}
                  required
                />
              </div>

              <div className="field">
                <label>Görsel Bağlantısı (İsteğe Bağlı URL)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... ya da resim linki"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowCreateModal(false)}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={submitting}
                  style={{ fontWeight: 800, padding: '10px 24px', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                >
                  {submitting ? 'Yayınlanıyor...' : '🔥 Kaosu Yayınla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
