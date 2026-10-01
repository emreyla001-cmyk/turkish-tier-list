/**
 * GÜVENLİK YARDIMCI KÜTÜPHANESİ (SECURITY UTILITIES)
 * XSS, HTML Injection ve Kötü Niyetli Girdileri Temizleme Modülü
 */

// Tehlikeli HTML etiketleri ve nitelikleri
const DANGEROUS_PATTERNS = [
  /<script\b[\s\S]*?<\/script>/gi,
  /<iframe\b[\s\S]*?<\/iframe>/gi,
  /<object\b[\s\S]*?<\/object>/gi,
  /<embed\b[\s\S]*?<\/embed>/gi,
  /<applet\b[\s\S]*?<\/applet>/gi,
  /<meta\b[\s\S]*?>/gi,
  /<link\b[\s\S]*?>/gi,
  /on\w+\s*=\s*(?:["'][^"']*["']|[^\s>]+)/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /data:\s*text\/html/gi,
];

/**
 * Metin içeriğini XSS ve zararlı HTML kodlarından arındırır
 */
export function sanitizeText(input) {
  if (typeof input !== 'string') return '';

  let clean = input.trim();

  // Null byte saldırılarını engelle
  clean = clean.replace(/\0/g, '');

  // Tehlikeli etiket ve nitelikleri temizle
  for (const pattern of DANGEROUS_PATTERNS) {
    clean = clean.replace(pattern, '');
  }

  // Temel HTML varlıklarını güvenli hale getir
  return clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Kullanıcı girdisi olan URL'lerin (avatar, profil arka planı vb.) güvenli olup olmadığını doğrular
 */
export function isSafeUrl(url) {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();

  // javascript:, data: veya vbscript: ile başlayan tehlikeli URL'leri reddet
  if (/^(javascript|vbscript|data):/i.test(trimmed)) {
    return false;
  }

  // Sadece güvenli HTTP/HTTPS veya göreceli URL'lere izin ver
  try {
    if (trimmed.startsWith('/') || trimmed.startsWith('./')) {
      return true;
    }
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Kullanıcı adını güvenli karakter setiyle sınırlar (SQL Injection & XSS önlemi)
 */
export function validateUsername(username) {
  if (!username || typeof username !== 'string') return false;
  // Sadece 3-20 karakter, harf, rakam ve alt çizgi
  return /^[A-Za-z0-9_]{3,20}$/.test(username.trim());
}

/**
 * Yorum ve öneri metinlerinin uzunluk ve güvenlik kontrolü
 */
export function validateComment(text, maxLength = 1000) {
  if (!text || typeof text !== 'string') return { valid: false, error: 'Metin boş olamaz.' };
  const trimmed = text.trim();
  if (trimmed.length < 2) return { valid: false, error: 'Metin en az 2 karakter olmalıdır.' };
  if (trimmed.length > maxLength) return { valid: false, error: `Metin en fazla ${maxLength} karakter olabilir.` };

  // Şüpheli XSS içeriği var mı?
  for (const p of DANGEROUS_PATTERNS) {
    p.lastIndex = 0;
    if (p.test(trimmed)) {
      return { valid: false, error: 'Metinde güvenlik kurallarına aykırı kod veya karakter tespit edildi.' };
    }
  }

  return { valid: true, cleanText: sanitizeText(trimmed) };
}
