import { getAnimatedFrameInfo, nameColorStyle, resolveFrame } from './cosmetics';

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
  const animInfo = getAnimatedFrameInfo(frameGradient);
  const activeFrame = resolveFrame(frameGradient);

  const inner = url ? (
    <img
      className="avatar"
      src={url}
      alt={safeName}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: '50%' }}
      onClick={onClick}
    />
  ) : (
    <span
      className="avatar avatar-fallback"
      style={{ width: '100%', height: '100%', fontSize: size * 0.42, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
      onClick={onClick}
    >
      {safeName.charAt(0).toLocaleUpperCase('tr')}
    </span>
  );

  // 1. Gerçek Hareketli Conic Çerçeve (360° Dönen Neon Işıma)
  if (animInfo) {
    const framePadding = Math.max(3, Math.round(size * 0.08));
    const totalSize = size + framePadding * 2;
    return (
      <span
        className="avatar-animated-frame-wrap"
        style={{
          width: totalSize,
          height: totalSize,
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: onClick ? 'pointer' : undefined,
          ...style,
        }}
        onClick={onClick}
        title={animInfo.name ? `Çerçeve: ${animInfo.name}` : undefined}
      >
        <span
          className="avatar-animated-frame-spinner"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: animInfo.conic,
            boxShadow: animInfo.glow,
            animation: `frameSpinContinuous ${animInfo.speed || '2.5s'} linear infinite`,
            zIndex: 1,
          }}
        />
        <span
          style={{
            position: 'relative',
            zIndex: 2,
            width: size,
            height: size,
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'inline-flex',
            background: 'var(--bg-2, #0e121b)',
          }}
        >
          {inner}
        </span>
      </span>
    );
  }

  // 2. Statik veya Gradient Çerçeve
  if (activeFrame) {
    const framePadding = Math.max(3, Math.round(size * 0.07));
    const totalSize = size + framePadding * 2;
    return (
      <span
        style={{
          width: totalSize,
          height: totalSize,
          borderRadius: '50%',
          padding: `${framePadding}px`,
          backgroundImage: activeFrame,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: onClick ? 'pointer' : undefined,
          ...style,
        }}
        onClick={onClick}
      >
        <span
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'inline-flex',
            background: 'var(--bg-2, #0e121b)',
          }}
        >
          {inner}
        </span>
      </span>
    );
  }

  // 3. Standart Çerçevesiz Avatar
  return (
    <span
      style={{
        display: 'inline-flex',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      onClick={onClick}
    >
      {inner}
    </span>
  );
}
