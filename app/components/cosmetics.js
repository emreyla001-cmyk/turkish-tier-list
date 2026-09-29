export function frameStyle(gradient) {
  if (!gradient || typeof gradient !== 'string') return {};
  return { border: '3px solid transparent', backgroundImage: `linear-gradient(var(--bg-2),var(--bg-2)), ${gradient}`, backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' };
}
export function nameColorStyle(value) {
  if (!value || typeof value !== 'string') return {};
  if (value.startsWith('linear-gradient')) {
    return { backgroundImage: value, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', fontWeight: 800 };
  }
  return { color: value, fontWeight: 800 };
}
