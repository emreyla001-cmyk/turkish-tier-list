import { supabase } from '../../../lib/supabaseClient';
import CommentForm from '../../components/CommentForm';
import TierBadge from '../../components/TierBadge';
import { tierInfo } from '../../components/tiers';
import UserBadge, { Avatar, NameTag } from '../../components/UserBadge';
import ViewLogger from '../../components/ViewLogger';

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
    .single();

  if (!character) {
    return <div className="wrap empty">Bu karakter bulunamadı ya da henüz onaylanmadı.</div>;
  }

  const [comments, frameMap] = await Promise.all([getComments(params.id), getFrameMap()]);

  const stats = [
    ['güç', character.power_score],
    ['zeka', character.intelligence_score],
    ['hız', character.speed_score],
    ['dayanıklılık', character.durability_score],
    ['etki', character.influence_score],
  ];

  return (
    <div className="wrap">
      <ViewLogger characterId={character.id} />
      <div className="char-hero">
        <div className="media-col">
          <div className="main-photo">
            {character.image_url ? <img src={character.image_url} alt={character.name} /> : 'Görsel eklenmedi'}
          </div>
        </div>
        <div className="info-col">
          <h1>{character.name}</h1>
          <div className="char-meta">
            <span className="tag">{character.series || 'Dizi/film belirtilmedi'}</span>
            {character.category && <span className="tag">{character.category}</span>}
          </div>
          {character.tier && (
            <div>
              <div className="rank-pill">
                <TierBadge tier={character.tier} large />
                <div className="lbl">{tierInfo(character.tier)?.name || 'Tier'}</div>
              </div>
              {tierInfo(character.tier) && (
                <p className="tier-desc">{tierInfo(character.tier).desc} <a href="/tier-sistemi">Tüm tier'lar</a></p>
              )}
            </div>
          )}
        </div>
      </div>

      {character.video_url && (
        <div className="video-card">
          <video src={character.video_url} controls />
        </div>
      )}

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Scaling İstatistikleri</h3>
        {stats.map(([label, val]) => (
          <div className="stat-row" key={label}>
            <div className="stat-name">{label}</div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: val ? `${val * 10}%` : '0%' }} />
            </div>
            <div className="stat-val">{val ?? 'Girilmedi'}</div>
          </div>
        ))}
      </div>

      {character.description && (
        <div className="card" style={{ marginTop: '14px' }}>
          <h3>Scaling Açıklaması</h3>
          <p>{character.description}</p>
        </div>
      )}

      <div className="card" style={{ marginTop: '14px' }}>
        <h3>Yorumlar ({comments.length})</h3>
        {comments.length === 0 && <p style={{ color: 'var(--text-dim)' }}>Henüz yorum yok.</p>}
        {comments.map((c) => (
          <div className="comment msg" key={c.id}>
            <Avatar url={c.profiles?.avatar_url} name={c.profiles?.username || '?'} frameGradient={frameMap[c.profiles?.equipped_frame]} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="msg-head">
                <span className="msg-name"><NameTag name={c.profiles?.username || 'kullanıcı'} color={c.profiles?.equipped_name_color} /></span>
                <UserBadge role={c.profiles?.role} xp={c.profiles?.xp} vipActive={c.profiles?.vip_until && new Date(c.profiles.vip_until) > new Date()} />
                <span className="msg-time">{new Date(c.created_at).toLocaleDateString('tr-TR')}</span>
              </div>
              <p>{c.content}</p>
            </div>
          </div>
        ))}
        <CommentForm characterId={character.id} />
      </div>
    </div>
  );
}
