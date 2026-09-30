'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { deductCoins } from '../lib/wallet';
import { CoinIcon, CrownIcon, ShieldIcon, SwordsIcon } from '../components/CyberIcons';

const EMBLEMS = ['🐺', '🦁', '🦅', '⚔️', '🛡️', '⚡', '👑', '🐉', '🔥', '🇹🇷'];
const CLAN_CREATION_FEE = 5000;

export default function KlanlarPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [myClan, setMyClan] = useState(null);
  const [allClans, setAllClans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    tag: '',
    emblem: '🐺',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data?.user || null;
      setUser(u);
      if (u) {
        const { data: p } = await supabase
          .from('profiles')
          .select('id, username, coins, xp, role')
          .eq('id', u.id)
          .maybeSingle();

        const userCoins = u.user_metadata?.coins !== undefined
          ? Number(u.user_metadata.coins)
          : Number(p?.coins || 0);

        setProfile(p ? { ...p, coins: userCoins } : {
          id: u.id,
          username: u.user_metadata?.username || u.email?.split('@')[0],
          coins: userCoins,
          xp: 0,
        });

        loadClans(u.id);
      } else {
        loadClans(null);
      }
    });
  }, []);

  async function loadClans(userId) {
    setLoading(true);
    try {
      const url = userId ? `/api/clans?userId=${userId}` : '/api/clans';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setAllClans(data.allClans || []);
        setMyClan(data.myClan || null);
      }
    } catch (err) {
      console.error('Klanlar yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  }

  // Klan Kurma
  async function handleCreateClan(e) {
    e.preventDefault();
    if (!user) {
      showToast('⚠️ Klan kurmak için giriş yapmalısın!');
      return;
    }

    const currentCoins = profile?.coins || 0;
    if (currentCoins < CLAN_CREATION_FEE) {
      showToast(`❌ Yetersiz bakiye! Klan kurmak için ${CLAN_CREATION_FEE.toLocaleString('tr-TR')} Tier Parası gerekir.`);
      return;
    }

    if (!form.name.trim() || !form.tag.trim()) {
      showToast('⚠️ Lütfen klan adı ve etiketi giriniz.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/clans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          user_id: user.id,
          username: profile?.username || user.email?.split('@')[0],
          name: form.name,
          tag: form.tag,
          emblem: form.emblem,
          description: form.description,
        }),
      });

      const data = await res.json();
      if (data.success && data.clan) {
        const deductResult = await deductCoins(user.id, CLAN_CREATION_FEE, currentCoins);
        const finalCoins = deductResult.success ? deductResult.newCoins : currentCoins - CLAN_CREATION_FEE;
        setProfile((prev) => ({ ...prev, coins: finalCoins }));

        try {
          await supabase.auth.updateUser({ data: { clan_tag: data.clan.tag } });
        } catch {}

        setShowCreateModal(false);
        setMyClan(data.clan);
        setAllClans((prev) => [data.clan, ...prev]);
        showToast(`🏰 [${data.clan.tag}] ${data.clan.name} klanı başarıyla kuruldu!`);
      } else {
        showToast('❌ ' + (data.error || 'Klan kurulamadı'));
      }
    } catch (err) {
      showToast('❌ Beklenmeyen bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  }

  // Klana Katılma
  async function handleJoinClan(clan) {
    if (!user) {
      showToast('⚠️ Klana katılmak için giriş yapmalısın!');
      return;
    }

    try {
      const res = await fetch('/api/clans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          clanId: clan.id,
          user_id: user.id,
          username: profile?.username || user.email?.split('@')[0],
        }),
      });

      const data = await res.json();
      if (data.success) {
        try {
          await supabase.auth.updateUser({ data: { clan_tag: clan.tag } });
        } catch {}
        setMyClan(data.clan);
        loadClans(user.id);
        showToast(`✓ [${clan.tag}] ${clan.name} klanına katıldın!`);
      } else {
        showToast('❌ ' + (data.error || 'Katılma başarısız'));
      }
    } catch (err) {
      showToast('❌ Beklenmeyen bir hata oluştu');
    }
  }

  // Klandan Ayrılma
  async function handleLeaveClan() {
    if (!myClan || !user) return;
    if (!confirm(`[${myClan.tag}] ${myClan.name} klanından ayrılmak istediğine emin misin?`)) return;

    try {
      const res = await fetch('/api/clans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'leave',
          clanId: myClan.id,
          user_id: user.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        try {
          await supabase.auth.updateUser({ data: { clan_tag: null } });
        } catch {}
        setMyClan(null);
        loadClans(user.id);
        showToast('Klandan ayrıldın.');
      } else {
        showToast('❌ ' + (data.error || 'İşlem başarısız'));
      }
    } catch (err) {
      showToast('❌ Beklenmeyen bir hata oluştu');
    }
  }

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

      {/* Üst Başlık & Klan Kur Butonu */}
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
            <span>🏰</span> Klanlar & Loncalar (Guilds)
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '.92rem', margin: '6px 0 0' }}>
            Ortak Klan Puanı (CP) kasın, haftalık klan liginde yarışın ve klan ödüllerini kapın!
          </p>
        </div>

        {!myClan && (
          <button
            type="button"
            className="btn"
            onClick={() => (user ? setShowCreateModal(true) : showToast('⚠️ Klan kurmak için giriş yapmalısın!'))}
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
            <CrownIcon size={18} /> Klan Kur (5.000 TP)
          </button>
        )}
      </div>

      {/* KULLANICININ MEVCUT KLANI VARSA VİTRİN */}
      {myClan && (
        <div
          className="card"
          style={{
            marginBottom: '28px',
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(24, 24, 27, 0.95))',
            border: '2px solid rgba(245, 158, 11, 0.5)',
            boxShadow: '0 0 35px rgba(245, 158, 11, 0.12)',
            borderRadius: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '2px solid #f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                }}
              >
                {myClan.emblem}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '1.4rem', margin: 0, color: '#fef08a' }}>{myClan.name}</h2>
                  <span className="tag" style={{ background: '#f59e0b', color: '#000', fontWeight: 900, fontSize: '.75rem' }}>
                    [{myClan.tag}]
                  </span>
                </div>
                <p style={{ color: 'var(--text-dim)', fontSize: '.86rem', margin: '4px 0 0' }}>
                  {myClan.description}
                </p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '.82rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Lider: <strong style={{ color: '#fff' }}>{myClan.leader_name}</strong></span>
                  <span style={{ color: 'var(--text-dim)' }}>Üye Sayısı: <strong style={{ color: '#fff' }}>{myClan.members?.length || 1} / 30</strong></span>
                  <span style={{ color: '#fef08a', fontWeight: 700 }}>⚡ Klan Seviyesi {myClan.level || 1}</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Toplam Klan Puanı</div>
              <strong style={{ fontSize: '1.6rem', color: '#fef08a', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                <ShieldIcon size={24} /> {(myClan.points || 0).toLocaleString('tr-TR')} CP
              </strong>
              {myClan.leader_id !== user?.id && (
                <div style={{ marginTop: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={handleLeaveClan}
                    style={{ fontSize: '.75rem', padding: '4px 10px', color: '#ef4444', borderColor: '#ef4444' }}
                  >
                    Klandan Ayrıl
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Üye Listesi */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '.92rem', color: 'var(--text-dim)' }}>Klan Kadrosu & Katkılar</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              {(myClan.members || []).map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '.82rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '.9rem' }}>{m.role === 'leader' ? '👑' : m.role === 'officer' ? '⚔️' : '👤'}</span>
                    <strong style={{ color: m.role === 'leader' ? '#f59e0b' : '#fff' }}>{m.username}</strong>
                  </div>
                  <span style={{ color: 'var(--text-dim)' }}>+{m.contributed_cp || 0} CP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HAFTALIK KLANLAR LİGİ SIRALAMASI */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🏆</span> Haftalık Klan Sıralaması (Leaderboard)
            </h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '.84rem', margin: '4px 0 0' }}>
              Her Pazar gecesi 00:00'da sıfırlanır. Zirvedeki klanlar tüm üyelerine 2X XP ve dev Tier Parası bonusu kazandırır!
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>Klanlar yükleniyor... 🏰</div>
        ) : allClans.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>Henüz kurulmuş bir klan yok.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {allClans.map((clan, idx) => {
              const isFirst = idx === 0;
              const isSecond = idx === 1;
              const isThird = idx === 2;
              const isMember = myClan?.id === clan.id;

              return (
                <div
                  key={clan.id}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    background: isFirst
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(24, 24, 27, 0.9))'
                      : 'var(--bg-2)',
                    border: isFirst ? '1px solid #f59e0b' : '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span
                      style={{
                        fontSize: isFirst ? '1.5rem' : '1.1rem',
                        fontWeight: 900,
                        color: isFirst ? '#f59e0b' : isSecond ? '#e2e8f0' : isThird ? '#cd7f32' : 'var(--text-dim)',
                        minWidth: '32px',
                        textAlign: 'center',
                      }}
                    >
                      {isFirst ? '👑 1.' : isSecond ? '🥈 2.' : isThird ? '🥉 3.' : `#${idx + 1}`}
                    </span>

                    <span style={{ fontSize: '2rem' }}>{clan.emblem || '🛡️'}</span>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '1.05rem', color: '#fff' }}>{clan.name}</strong>
                        <span className="tag" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontWeight: 800, fontSize: '.72rem' }}>
                          [{clan.tag}]
                        </span>
                        {isMember && <span className="tag" style={{ background: '#22c55e', color: '#000', fontWeight: 800, fontSize: '.68rem' }}>SENİN KLANIN</span>}
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: '.78rem', color: 'var(--text-dim)' }}>
                        {clan.description} • {clan.members?.length || 1} Üye
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: '1.15rem', color: '#fef08a' }}>
                        {(clan.points || 0).toLocaleString('tr-TR')} CP
                      </strong>
                      <span style={{ display: 'block', fontSize: '.72rem', color: 'var(--text-dim)' }}>
                        Seviye {clan.level || 1}
                      </span>
                    </div>

                    {!myClan && (
                      <button
                        type="button"
                        className="btn"
                        onClick={() => handleJoinClan(clan)}
                        style={{ padding: '6px 16px', fontSize: '.84rem', fontWeight: 800 }}
                      >
                        Katıl
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* KLAN KURMA MODALI */}
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
              maxWidth: '540px',
              padding: '28px',
              background: '#121215',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '1.35rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏰</span> Yeni Klan Kur
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '.84rem', color: 'var(--text-dim)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Klan kurma bedeli: <span style={{ color: '#fef08a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CoinIcon size={16} /> <strong>5.000 Tier Parası</strong></span>. Kurucu otomatik olarak klan lideri olur.
            </p>

            <form onSubmit={handleCreateClan}>
              <div className="field">
                <label>Klan Adı *</label>
                <input
                  type="text"
                  placeholder="Örn: Bozkır Kurtları"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={30}
                  required
                />
              </div>

              <div className="field">
                <label>Klan Etiketi (2-5 Karakter) *</label>
                <input
                  type="text"
                  placeholder="Örn: KURT, GS, TIER"
                  value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value.toUpperCase() })}
                  maxLength={5}
                  required
                />
              </div>

              <div className="field">
                <label>Klan Amblemi *</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {EMBLEMS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setForm({ ...form, emblem: em })}
                      style={{
                        fontSize: '1.6rem',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: form.emblem === em ? '2px solid #f59e0b' : '1px solid var(--border)',
                        background: form.emblem === em ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-2)',
                        cursor: 'pointer',
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Klan Sloganı & Açıklaması</label>
                <textarea
                  rows={3}
                  placeholder="Klanınızın vizyonunu veya katılım şartlarını yazın..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  maxLength={180}
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
                  disabled={submitting || (profile?.coins || 0) < CLAN_CREATION_FEE}
                  style={{ fontWeight: 800, padding: '10px 22px', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                >
                  {submitting ? 'Kuruluyor...' : '🏰 5.000 TP ile Kur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
