const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
let url = '', key = '';
for (let l of env.split('\n')) {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.split('=')[1].trim();
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = l.split('=')[1].trim();
}

const supabase = createClient(url, key);

const RESTORATIONS = [
  {
    name: 'Kayra Han',
    tier: 'High 1-A',
    note: '17. Gök katı ve Türk kozmolojisinin en yüce yaratıcı tanrısı (High 1-A standardı korundu).'
  },
  {
    name: 'Bay Ülgen',
    tier: '1-A',
    note: '16. Gök katı Altın Dağ, evrenin ve göklerin yaratıcı hükümdarı.'
  },
  {
    name: 'Erlik Han',
    tier: '1-A',
    note: '9 yeraltı katının mutlak efendisi, primordial karanlık varlığı.'
  },
  {
    name: 'Kızagan Tengri',
    tier: '1-A',
    note: '9. gök katı Savaş Tanrısı, al at ve kızıl asa ile kozmik savaş prensibi.'
  },
  {
    name: 'Mergen Tengri',
    tier: '1-A',
    note: '7. gök katı Bilgelik ve Zeka Tanrısı, evrensel bilgi ve okuyla karanlığı delen ilahi akıl.'
  },
  {
    name: 'Umay Ana',
    tier: 'Low 1-C',
    note: 'Yaşam, doğum, hayat ağacı ve Süt Gölü ile göksel boyuttan yeryüzünü kuşatan ana tanrıça.'
  },
  {
    name: 'Azrail',
    tier: '2-B',
    note: 'Tüm alemlerdeki ve yaratılmış canlılardaki eceli uygulayan mutlak ölüm meleği.'
  },
  {
    name: 'Hızır',
    tier: '2-B',
    note: 'Beşinci Boyut varlığı, zamandan ve mekandan münezzeh, geçmiş-gelecek hakimiyeti ve nedensellik dışılık (Acausality).'
  },
  {
    name: 'Haberci Medet',
    tier: '2-B',
    note: 'Beşinci Boyut / Kollama evreninde ecel habercisi, mekansızlık ve fiziksel hasar bağışıklığı.'
  },
  {
    name: 'Beşinci Boyut Şeytan (İblis)',
    tier: '2-B',
    note: 'Hızırın kozmik zıttı, tüm insan bilincine nüfuz eden evrensel vesvese ve çoklu evren kötülük prensibi.'
  },
  {
    name: 'Karabasan',
    tier: 'Low 1-C',
    note: 'Beşinci Boyut ve rüyalar düzleminde çalışan, fiziksel bedeni aşan soyut vicdan paraziti.'
  },
  {
    name: 'Yüce Honos',
    tier: '2-B',
    note: 'Ütopya ve peri boyutlarının baş yargıcı, tüm perilerin ve büyülerin üzerindeki kavramsal yasa koyucu.'
  }
];

async function restore() {
  console.log('Kozmik ve Metafizik Varlıkların Tierleri İstenen Standarda Geri Getiriliyor...\n');
  for (const item of RESTORATIONS) {
    const { data: existing } = await supabase.from('characters').select('id, tier, description').eq('name', item.name).maybeSingle();
    if (existing) {
      const { error } = await supabase.from('characters').update({
        tier: item.tier
      }).eq('id', existing.id);

      if (error) {
        console.error(`❌ Hata (${item.name}):`, error);
      } else {
        console.log(`✅ [${existing.tier.padEnd(7)} ➡️  ${item.tier.padEnd(8)}] ${item.name.padEnd(28)} | ${item.note}`);
      }
    } else {
      console.warn(`⚠️ Bulunamadı: ${item.name}`);
    }
  }
  console.log('\n🏁 Kozmik varlıklar ve tanrılar başarıyla ait oldukları zirve kademelere taşındı!');
}

restore();
