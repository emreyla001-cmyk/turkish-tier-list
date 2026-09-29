import { supabase } from '../../../lib/supabaseClient';
import CommentForm from '../../components/CommentForm';
import TierBadge from '../../components/TierBadge';
import { tierInfo } from '../../components/tiers';
import UserBadge, { Avatar, NameTag } from '../../components/UserBadge';
import ViewLogger from '../../components/ViewLogger';
import StatRadar from '../../components/StatRadar';

export const revalidate = 0;

async function getComments(characterId) {
  const { data } = await supabase
    .from('comments')
    .select('id, content, created_at, profiles(username, avatar_url, role, xp, equipped_frame, equipped_name_color, vip_until)')
    .eq('character_id', characterId)
    .order('created_at', { ascending: false });
  return data || [];
}

async function getFrameMap() {
  const { data } = await supabase.from('shop_items').select('id, value').eq('kind', 'frame');
  const map = {};
  (data || []).forEach((it) => { map[it.id] = it.value; });
  return map;
}

export default async function CharacterPage({ params }) {
  const { data: character } = await supabase
    .from('characters')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'published')
    .maybeSingle();

  if (!character) {
    return <div className="wrap empty">Bu karakter bulunamadı ya da henüz onaylanmadı.</div>;
  }

  const [comments, frameMap] = await Promise.all([getComments(params.id), getFrameMap()]);

  const stats = [
    { label: 'Güç', val: character.power_score },
    { label: 'Zeka', val: character.intelligence_score },
    { label: 'Hız', val: character.speed_score },
    { label: 'Dayanıklılık', val: character.durability_score },
    { label: 'Etki', val: character.influence_score },
  ];

  const info = tierInfo(character.tier);

  return (
    <div className="wrap" style={{ paddingBottom: '70px' }}>
      <ViewLogger characterId={character.id} />

      {/* Sinematik Karakter Başlığı */}
      <div className="char-hero-modern card">
        <div
          className="char-ambient-bg"
          style={{
            backgroundImage: character.image_url ? `url(${character.image_url})` : undefined,
          }}
        />
        <div className="char-hero-body">
          <div className="char-poster-col">
            <div className="char-main-poster">
              {character.image_url ? (
                <img src={character.image_url} alt={character.name} />
              ) : (
                <div className="poster-placeholder-lg">🎭</div>
              )}
              <div className="char-poster-tier">
                <TierBadge tier={character.tier} large />
              </div>
            </div>
          </div>

          <div className="char-info-col">
            <div className="char-tag-row">
              <span className="tag tag-series">{character.series || 'Dizi/Film Belirtilmedi'}</span>
              {character.category && <span className="tag">{character.category}</span>}
            </div>

            <h1 className="char-title">{character.name}</h1>

            <div className="char-tier-block">
              <div className="char-tier-header">
                <TierBadge tier={character.tier} />
                <span className="char-tier-title">{info?.name || 'Tier Kademesi'}</span>
              </div>
              {info && <p className="char-tier-explanation">{info.desc}</p>}
            </div>

            <div className="char-quick-actions">
              <a href="/vs" className="btn btn-spotlight-primary">
                ⚔️ VS Arenasında Kıyasla
              </a>
              <a href="/tier-sistemi" className="btn btn-ghost">
                Tier Rehberi
              </a>
            </div>
          </div>
        </div>
      </div>

      {character.video_url && (
        <div className="video-card">
          <h3>Kaynak / Gösteri Videosu</h3>
          <video src={character.video_url} controls />
        </div>
      )}

      {/* İstatistikler & Radar Grafiği */}
      <div className="stats-layout" style={{ marginTop: '20px' }}>
        <div className="card stats-bars-card">
          <h3>Scaling İstatistikleri</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '.85rem', marginBottom: '16px' }}>
            VS Battles ve Türk Kurgusu kurallarına göre değerlendirilen temel nitelikler:
          </p>
          {stats.map(({ label, val }) => (
            <div className="stat-row" key={label}>
              <div className="stat-name">{label}</div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: val ? `${val * 10}%` : '0%' }} />
              </div>
              <div className="stat-val">{val ?? '—'}/10</div>
            </div>
          ))}
        </div>

        <div className="card stats-radar-card text-center">
          <h3>Stat Radarı</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '.85rem', marginBottom: '10px' }}>
            5 Eksenli Güç Dağılımı
          </p>
          <StatRadar stats={stats} size={250} />
        </div>
      </div>

      {character.description && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>Scaling & Güç Açıklaması</h3>
          <p style={{ lineHeight: 1.7, color: 'var(--text-light, #e0e4ee)' }}>
            {character.description}
          </p>
        </div>
      )}

      {/* Yorumlar Bölümü */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="section-head" style={{ marginBottom: '14px' }}>
          <h3>Topluluk Tartışmaları ({comments.length})</h3>
          <p style={{ fontSize: '.85rem', color: 'var(--text-dim)' }}>
            Bu karakterin tier&apos;ı ve gücü hakkında ne düşünüyorsun? Görüşünü paylaş.
          </p>
        </div>

        {comments.length === 0 && (
          <p style={{ color: 'var(--text-dim)', margin: '18px 0' }}>
            Henüz yorum yapılmamış. İlk tartışmayı sen başlat!
          </p>
        )}

        <div className="comments-stream">
          {comments.map((c) => (
            <div className="comment msg" key={c.id}>
              <Avatar
                url={c.profiles?.avatar_url}
                name={c.profiles?.username || '?'}
                frameGradient={frameMap[c.profiles?.equipped_frame]}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="msg-head">
                  <span className="msg-name">
                    <NameTag
                      name={c.profiles?.username || 'kullanıcı'}
                      color={c.profiles?.equipped_name_color}
                    />
                  </span>
                  <UserBadge
                    role={c.profiles?.role}
                    xp={c.profiles?.xp}
                    vipActive={c.profiles?.vip_until && new Date(c.profiles.vip_until) > new Date()}
                  />
                  <span className="msg-time">{new Date(c.created_at).toLocaleDateString('tr-TR')}</span>
                </div>
                <p className="comment-text">{c.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <CommentForm characterId={character.id} />
        </div>
      </div>
    </div>
  );
}
