/**
 * Türk sinema ve dizi tarihine damga vurmuş, aramızdan ayrılan değerli
 * sanatçılarımız için özel saygı ve anma (In Memoriam) kayıtları.
 */
export const TRIBUTES = {
  'Niyazi': {
    actor: 'Vural Çelik',
    years: '1973 – 2024',
    roleNote: 'Seksenler dizisindeki unutulmaz "Artist Niyazi" ve Avrupa Yakası\'ndaki "Kubilay Peynircioğlu" performanslarıyla hafızalarımıza kazınan kıymetli oyuncumuz.',
    message: 'Erken yaşta aramızdan ayrılan usta tiyatro ve dizi oyuncumuz Vural Çelik\'i saygı, sevgi ve rahmetle anıyoruz.',
  },
  'İnek Şaban': {
    actor: 'Kemal Sunal',
    years: '1944 – 2000',
    roleNote: 'Türk sinemasının gülen ve güldüren yüzü, nesiller boyu kalplerde yaşayan büyük usta.',
    message: 'Halkın sevgilisi, büyük usta Kemal Sunal\'ı sonsuz sevgi, saygı ve özlemle anıyoruz.',
  },
  'Tosun Paşa': {
    actor: 'Kemal Sunal',
    years: '1944 – 2000',
    roleNote: 'Yeşilçam\'ın unutulmaz başyapıtlarından Tosun Paşa\'ya can veren dev oyuncu.',
    message: 'Büyük efsane Kemal Sunal\'ı rahmet ve hürmetle anıyoruz.',
  },
  'Davaro': {
    actor: 'Kemal Sunal',
    years: '1944 – 2000',
    roleNote: 'Davaro / Memo karakteriyle Yeşilçam klasiğine imza atan eşsiz komedi dehası.',
    message: 'Kemal Sunal\'ı sonsuz sevgi ve saygıyla anıyoruz.',
  },
  'Ramiz Karaeski': {
    actor: 'Tuncel Kurtiz',
    years: '1936 – 2013',
    roleNote: 'Ramiz Dayı karakterine derinliği, tok sesi ve bilgeliğiyle hayat veren tiyatro ve sinemamızın çınarı.',
    message: 'Usta sanatçı Tuncel Kurtiz\'i derin bir saygı, hürmet ve rahmetle anıyoruz.',
  },
};

/**
 * Karakter adı veya serisine göre anma kaydını döner.
 */
export function getTribute(characterName, seriesName) {
  if (!characterName) return null;
  
  // Tam eşleşme
  if (TRIBUTES[characterName]) return TRIBUTES[characterName];
  
  // İsim içinde geçiyorsa
  for (const [key, tribute] of Object.entries(TRIBUTES)) {
    if (characterName.toLowerCase().includes(key.toLowerCase())) {
      return tribute;
    }
  }
  
  return null;
}
