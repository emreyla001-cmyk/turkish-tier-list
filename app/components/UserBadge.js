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

export default function UserBadge({ role = 'user', xp = 0, vipActive = false }) {
  const safeRole = (role && ROLES[role]) ? role : 'user';
  const [icon, label] = ROLES[safeRole] || ['👤', 'Kullanıcı'];
  return (
    <span className="user-badges">
      <span className={`role-badge role-${safeRole}`}>{icon} {label}</span>
      {vipActive && safeRole !== 'vip' && safeRole !== 'admin' && <span className="role-badge role-vip">💎 VIP</span>}
      <span className="level-badge">Sv. {levelFromXp(xp)}</span>
    </span>
  );
}

export function NameTag({ name, color }) {
  return <span style={nameColorStyle(color)}>{name || '?'}</span>;
}

export function Avatar({ url, name = '?', size = 34, frameGradient }) {
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
      }
    : { width: size, height: size, flexShrink: 0, display: 'inline-flex' };

  const inner = url ? (
    <img className="avatar" src={url} alt={safeName} style={{ width: size, height: size }} />
  ) : (
    <span
      className="avatar avatar-fallback"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {safeName.charAt(0).toLocaleUpperCase('tr')}
    </span>
  );

  if (!activeFrame) return inner;

  return (
    <span style={wrapStyle}>
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
