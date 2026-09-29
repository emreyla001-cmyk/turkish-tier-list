'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import AdminGuard from '../../components/AdminGuard';

export const WHEEL_CHARACTERS_BATCH_1 = [
  {
    name: 'Battal Gazi',
    series: 'Battal Gazi Destanı',
    category: 'Dizi / Film',
    tier: '9-B',
    power_score: 5,
    intelligence_score: 6,
    speed_score: 6,
    durability_score: 7,
    influence_score: 8,
    description: 'Türk sinemasının ve halk destanlarının efsanevi cengaveri. Onlarca Bizans askerini tek başına kılıçtan geçirebilmesi, surlardan ve kayalıklardan metrelerce uzağa insanüstü akrobasiyle atlayabilmesi, kalın ahşap kapıları ve duvarları kırabilmesiyle Duvar Seviyesi (9-B) gücündedir.',
    image_url: 'https://upload.wikimedia.org/wikipedia/tr/6/63/Battalgazi.jpg',
    status: 'published',
  },
  {
    name: 'Kertenkele (Ziya / Akıncı)',
    series: 'Kertenkele',
    category: 'Dizi / Film',
    tier: '9-B',
    power_score: 4,
    intelligence_score: 8,
    speed_score: 7,
    durability_score: 5,
    influence_score: 6,
    description: 'Profesyonel hırsız, kılık değiştirme ustası ve sonrasında gizli süper kahraman (Akıncı). İmkansız çatılardan ve binalardan düşmeden süzülebilmesi, kurşunlardan refleksif olarak sıyrılabilmesi ve duvarlara tırmanabilmesiyle insan sınırının üzerinde akrobatik kabiliyetlere sahiptir.',
    image_url: 'https://iaftm.tmgrup.com.tr/3257fc/829/469/0/0/640/362?u=https://iftm.tmgrup.com.tr/2021/04/16/kertenkele-nerede-cekildi-kertenkele-dizisi-oyunculari-kimler-ne-zaman-cekildi-1618585642456.jpg',
    status: 'published',
  },
  {
    name: 'Yamaç Koçovalı',
    series: 'Çukur',
    category: 'Dizi / Film',
    tier: '9-C',
    power_score: 3,
    intelligence_score: 7,
    speed_score: 5,
    durability_score: 5,
    influence_score: 8,
    description: 'Çukur mahallesinin lideri. Yakın dövüş, tabanca ve bıçak kullanımında üst düzey reflekslere sahiptir. Onlarca sokak kavgasından ve pusudan yaralı kurtulabilen yüksek acı toleransı ve taktiksel çatışma zekası bulunur.',
    image_url: 'https://im.showtv.com.tr/5/6877/yamac-kocovali-aras-bulut-iynemli-500x500.png',
    status: 'published',
  },
  {
    name: 'Kordon Celil',
    series: 'Şefkat Tepe',
    category: 'Dizi / Film',
    tier: '9-C',
    power_score: 4,
    intelligence_score: 6,
    speed_score: 5,
    durability_score: 6,
    influence_score: 7,
    description: 'Özel Harekat timinin en sert ve gözü kara askeri. Ağır silahlar, keskin nişancılık ve dağ koşullarında hayatta kalma ustasıdır. Ağır işkencelere ve kurşun yaralarına rağmen savaşmaya devam edebilen yüksek irade ve dayanıklılığa sahiptir.',
    image_url: 'https://iaftm.tmgrup.com.tr/8ceb4b/829/469/0/0/800/453?u=https://iftm.tmgrup.com.tr/2021/02/10/ertugrul-sakar-kimdir-kac-yasinda-kurtlar-vadisi-ve-sefkat-tepenin-yildizi-ertugrul-sakardan-mujdeli-haber-1612948682121.jpg',
    status: 'published',
  },
  {
    name: 'Polat Alemdar',
    series: 'Kurtlar Vadisi',
    category: 'Dizi / Film',
    tier: '9-B',
    power_score: 4,
    intelligence_score: 9,
    speed_score: 5,
    durability_score: 7,
    influence_score: 10,
    description: 'Türkiye nin en derin istihbarat ve mafya yapılanmalarını tek başına çökertebilen stratejik deha. Yakın dövüş, taktiksel pusu, suikast ve psikolojik harpte ustalaşmıştır. Bombalı saldırılardan, roketlerden ve ağır işkencelerden sağ çıkabilen inanılmaz bir dayanıklılığı ve devasa bir nüfuzu vardır.',
    image_url: 'https://upload.wikimedia.org/wikipedia/tr/3/30/Polat_Alemdar.jpg',
    status: 'published',
  },
  {
    name: 'Erlik Han',
    series: 'Türk Mitolojisi',
    category: 'Mitoloji / Efsane',
    tier: '1-A',
    power_score: 10,
    intelligence_score: 9,
    speed_score: 9,
    durability_score: 10,
    influence_score: 10,
    description: 'Türk ve Altay mitolojisinde yeraltı dünyasının (Tamu) mutlak hakimi ve ölümün tanrısı. Kayra Han ın yarattığı evrenin karanlık kutbu olup ruhları yargılar, hastalıkları ve canavarları yönetir. Boyutlar üstü metafizik güçleriyle Kayra Han ın altındaki en güçlü varlıktır.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Erlik_Khan.jpg/800px-Erlik_Khan.jpg',
    status: 'published',
  },
  {
    name: 'Azrail (Küçük Kıyamet)',
    series: 'Küçük Kıyamet',
    category: 'Dizi / Film',
    tier: '2-B',
    power_score: 9,
    intelligence_score: 10,
    speed_score: 10,
    durability_score: 10,
    influence_score: 10,
    description: 'Samanyolu TV kurgusal evreninde ölüm vaktini getiren metafiziksel varlık. Zamanı ve mekanı durdurabilme, boyutlar arası geçiş yapabilme, insan kaderine doğrudan müdahale edebilme ve maddeye hükmetme gücüne sahiptir.',
    image_url: 'https://wgqwizwyftdoxizhrljg.supabase.co/storage/v1/object/public/character-media/haberci%20medet.jpg',
    status: 'published',
  },
  {
    name: 'Selena',
    series: 'Selena',
    category: 'Dizi / Film',
    tier: '3-A',
    power_score: 8,
    intelligence_score: 8,
    speed_score: 9,
    durability_score: 8,
    influence_score: 9,
    description: 'Ütopya gezegeninden gelen iyilik perisi. Selena dendiğinde anında ses hızını aşarak belirebilme, zamanı tamamen dondurabilme, insanları ve nesneleri dilediği maddeye dönüştürebilme, zihin okuma ve boyutlar arası seyahat etme gibi olağanüstü büyü güçlerine sahiptir.',
    image_url: 'https://iaftm.tmgrup.com.tr/1a88bb/829/469/0/0/640/362?u=https://iftm.tmgrup.com.tr/2021/04/09/selena-nerede-cekildi-selena-dizisi-oyunculari-kimler-ne-zaman-cekildi-1617961205315.jpg',
    status: 'published',
  },
  {
    name: 'Tarkan',
    series: 'Tarkan Efsanesi',
    category: 'Dizi / Film',
    tier: '9-B',
    power_score: 5,
    intelligence_score: 7,
    speed_score: 6,
    durability_score: 6,
    influence_score: 8,
    description: 'Hun İmparatorluğu nun sadık kurdu Kurt ile büyümüş vahşi ve efsanevi savaşçısı. İnsanüstü çeviklik, kılıç ustalığı, zindan demirlerini bükebilme ve ahtapot/dev gibi canavarları alt edebilme yeteneklerine sahiptir.',
    image_url: 'https://upload.wikimedia.org/wikipedia/tr/c/cb/Tarkan_G%C3%BCm%C3%BC%C5%9F_Eyer.jpg',
    status: 'published',
  },
  {
    name: 'Komutan Logar',
    series: 'G.O.R.A.',
    category: 'Dizi / Film',
    tier: '8-C',
    power_score: 4,
    intelligence_score: 7,
    speed_score: 4,
    durability_score: 5,
    influence_score: 8,
    description: 'G.O.R.A. gezegeni Güvenlik Komutanı. Gelişmiş uzay teknolojisi, lazer silahları, uzay gemileri filosu ve kılık değiştirme hologramlarına erişimi vardır. Fiziksel olarak sıradan olsa da teknolojik envanteriyle bina seviyesinde yıkım gücüne sahiptir.',
    image_url: 'https://iaftm.tmgrup.com.tr/0628ce/829/469/0/0/800/450?u=https://iftm.tmgrup.com.tr/2022/10/24/gora-nerede-cekildi-gora-filmi-konusu-nedir-oyunculari-kimler-ne-zaman-cekildi-1666611388656.jpg',
    status: 'published',
  },
];

function CharacterList() {
  const [characters, setCharacters] = useState([]);
  const [importing, setImporting] = useState(false);
  const [msg, setMsg] = useState(null);

  function load() {
    supabase
      .from('characters')
      .select('id, name, series, tier, status')
      .order('created_at', { ascending: false })
      .then(({ data }) => setCharacters(data || []));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleBatchImport() {
    if (!confirm('Çarktaki 10 popüler karakteri (Battal Gazi, Polat Alemdar, Selena, Erlik Han vb.) otomatik olarak eklemek istiyor musun?')) return;
    setImporting(true);
    setMsg('Karakterler ekleniyor...');

    try {
      const existingNames = new Set(characters.map((c) => c.name.toLowerCase()));
      const toInsert = WHEEL_CHARACTERS_BATCH_1.filter((c) => !existingNames.has(c.name.toLowerCase()));

      if (toInsert.length === 0) {
        setMsg('Çarktaki tüm karakterler zaten ekli durumda!');
        setImporting(false);
        return;
      }

      const { data, error } = await supabase.from('characters').insert(toInsert);
      if (error) {
        setMsg('Hata oluştu: ' + error.message);
      } else {
        setMsg(`${toInsert.length} yeni karakter başarıyla yayınlandı!`);
        load();
      }
    } catch (err) {
      setMsg('Hata: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="wrap" style={{ paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1>Karakter Yönetimi</h1>
          <p style={{ color: 'var(--text-dim)', margin: '4px 0 0', fontSize: '.9rem' }}>
            Toplam <strong>{characters.length}</strong> karakter yayında/taslakta.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn"
            style={{ background: 'linear-gradient(135deg, #e6455b, #e6b325)', color: '#111' }}
            onClick={handleBatchImport}
            disabled={importing}
          >
            {importing ? 'Ekleniyor...' : '🎡 Çarktaki 10 Karakteri Otomatik Ekle'}
          </button>
          <a href="/admin/karakterler/yeni" className="btn btn-ghost">
            + Manuel Yeni Karakter
          </a>
        </div>
      </div>

      {msg && (
        <div className="card" style={{ marginTop: '16px', borderColor: 'var(--accent)', color: 'var(--accent)', fontWeight: 700 }}>
          {msg}
        </div>
      )}

      <div className="grid" style={{ marginTop: '20px' }}>
        {characters.map((c) => (
          <a key={c.id} href={`/admin/karakterler/${c.id}`} className="card">
            <h3>{c.name}</h3>
            <p>{c.series || '—'} · <strong>{c.tier || 'Tier ?'}</strong></p>
            <span className="tag" style={{ marginTop: '8px' }}>
              {c.status === 'published' ? 'Yayında' : 'Taslak'}
            </span>
          </a>
        ))}
        {characters.length === 0 && <p style={{ color: 'var(--text-dim)' }}>Henüz karakter eklenmedi.</p>}
      </div>
    </div>
  );
}

export default function AdminCharactersPage() {
  return (
    <AdminGuard>
      <CharacterList />
    </AdminGuard>
  );
}
