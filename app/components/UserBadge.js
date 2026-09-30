import { nameColorStyle, resolveFrame } from './cosmetics';

export const ROLES = {
  admin: ['👑', 'Admin'],
  moderator: ['🛡️', 'Moderatör'],
  vip: ['💎', 'VIP'],
  member: ['👤', 'Üye'],
  user: ['👤', 'Kullanıcı'],
};

// Seviye n için gereken toplam XP: (n-1)^2 * 100
export function levelFromXp(xp = 0) {
  const safeXp = Number(xp);
  if (isNaN(safeXp) || safeXp < 0) return 1;
  return Math.floor(Math.sqrt(safeXp / 100)) + 1;
}

export function xpForLevel(level) {
  const safeLvl = Math.max(1, Number(level) || 1);
  return (safeLvl - 1) * (safeLvl - 1) * 100;
}

export default function UserBadge({ role = 'user', xp = 0, vipActive = false, badges = [] }) {
  const safeRole = (role && ROLES[role]) ? role : 'user';
  const [icon, label] = ROLES[safeRole] || ['👤', 'Kullanıcı'];
  const hasKatkici = Array.isArray(badges) && badges.includes('katkici');
  const hasKaos = Array.isArray(badges) && badges.includes('kaos_elcisi');
  return (
    <span className="user-badges">
      <span className={`role-badge role-${safeRole}`}>{icon} {label}</span>
      {vipActive && safeRole !== 'vip' && safeRole !== 'admin' && <span className="role-badge role-vip">💎 VIP</span>}
      {hasKatkici && (
        <span
          className="role-badge"
          title="Evren Katkıcısı: Onaylı Karakter Öneren Yazar"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.15))',
            color: '#f59e0b',
            border: '1px solid #f59e0b',
            fontWeight: 700,
          }}
        >
          🌟 Katkıcı
        </span>
      )}
      {hasKaos && (
        <span
          className="role-badge"
          title="Kaos Elçisi: Haftanın Mitik Deliliği Paylaşımı Sahibi"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(185, 28, 28, 0.15))',
            color: '#ef4444',
            border: '1px solid #ef4444',
            fontWeight: 700,
          }}
        >
          🔥 Kaos Elçisi
        </span>
      )}
      <span className="level-badge">Sv. {levelFromXp(xp)}</span>
    </span>
  );
}

export function NameTag({ name, color }) {
  return <span style={nameColorStyle(color)}>{name || '?'}</span>;
}

export function Avatar({ url, name = '?', size = 34, frameGradient, onClick, style }) {
  const safeName = (name && typeof name === 'string' && name.trim().length > 0) ? name.trim() : '?';
  const activeFrame = resolveFrame(frameGradient);

  const wrapStyle = activeFrame
    ? {
        width: size + 8,
        height: size + 8,
        borderRadius: '50%',
        padding: '3px',
        backgroundImage: activeFrame,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }
    : { width: size, height: size, flexShrink: 0, display: 'inline-flex', cursor: onClick ? 'pointer' : undefined, ...style };

  const inner = url ? (
    <img
      className="avatar"
      src={url}
      alt={safeName}
      style={{ width: size, height: size, cursor: onClick ? 'pointer' : undefined }}
      onClick={onClick}
    />
  ) : (
    <span
      className="avatar avatar-fallback"
      style={{ width: size, height: size, fontSize: size * 0.42, cursor: onClick ? 'pointer' : undefined }}
      onClick={onClick}
    >
      {safeName.charAt(0).toLocaleUpperCase('tr')}
    </span>
  );

  if (!activeFrame) return inner;

  return (
    <span style={wrapStyle} onClick={onClick}>
      <span
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'inline-flex',
          background: 'var(--bg-2)',
        }}
      >
        {inner}
      </span>
    </span>
  );
}
