const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
let url = '', key = '';
for (let l of env.split('\n')) {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.split('=')[1].trim();
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = l.split('=')[1].trim();
}

const supabase = createClient(url, key);

// Rasyonel ve tutarlı VS Battles Wiki tier düzeltmeleri
const CORRECTIONS = [
  {
    name: 'Uzun İhsan Efendi',
    tier: 'Low 2-C',
    reason: '3D Osmanlı evrenini zihninde düşleyen kurgusal rüya yaratımı (Low 2-C Zihinsel / 10-B Fiziksel Beden). 1-A/High 1-A abartısı kaldırıldı.'
  },
  {
    name: 'Nasreddin Hoca',
    tier: '9-C',
    reason: 'Fiziksel olarak 13. yy alimi (10-B / 9-C); 2-B multiversal saçmalığı kaldırıldı. Gücü zeka (10/10), felsefi mantık paradoksları ve hicivsel dokunulmazlıktır.'
  },
  {
    name: 'Dede Korkut',
    tier: '9-B',
    reason: 'Oğuz boylarının destan ozanı ve bilgesi. 2-B multiversal saçmalığı kaldırıldı. Gücü isim verme, hayır duası ve destansı manevi otoritedir.'
  },
  {
    name: 'Ak Sakallı Dede',
    tier: '9-A',
    reason: 'Masallarda darda kalan kahramanların rüyalarında beliren yol gösterici ruhani arketip. 2-B saçmalığı kaldırıldı.'
  },
  {
    name: 'Haberci Medet',
    tier: '9-A',
    reason: 'Kollama dizisinde eceli gelen insanları uyaran metafizik elçi. Silah işlemezliği (intangibility) ve ecel görüsü vardır; evren yıkma gücü (2-B) yoktur.'
  },
  {
    name: 'Karabasan',
    tier: '9-A',
    reason: 'Uyku felci ve vicdan azabından beslenen metafizik kabus varlığı. 5D evren yıkıcısı (Low 1-C) değil, 9-A zihinsel/felç varlığıdır.'
  },
  {
    name: 'Hızır',
    tier: '9-A',
    reason: 'Beşinci Boyut dizisinde fakir bir dede suretinde tecelli edip öğüt veren, su/ekmek dönüştüren manevi rehber. Videoda da Easy grubundadır.'
  },
  {
    name: 'Beşinci Boyut Şeytan (İblis)',
    tier: '9-A',
    reason: 'Manevi vesvese veren, insan kılığına giren soyut metafizik kötülük. 2-B multiversal gücü yoktur.'
  },
  {
    name: 'Yüce Honos',
    tier: '3-A',
    reason: 'Selena/Ütopya evreninde büyücülerin güçlerini alan Yüce Yargıç. Selena ve Şoker (3-A) ile aynı evrensel büyü ölçeğindedir.'
  },
  {
    name: 'Azrail',
    tier: 'Low 2-C',
    reason: 'Tüm kainattaki nefislerin canını alma otoritesi; fiziksel zırhları geçersiz kılan mutlak ölüm kavramı (Durability Negation).'
  },
  {
    name: 'Kayra Han',
    tier: '1-A',
    reason: 'Altay mitolojisinin 17. katındaki yaratıcı tanrısı. High 1-A yerine 1-A çok daha sağlam ve tutarlıdır.'
  },
  {
    name: 'Umay Ana',
    tier: '3-A',
    reason: 'Göksel bereket ve doğum tanrıçası. Low 1-C yerine 3-A göksel katman seviyesi.'
  },
  {
    name: 'Kızagan Tengri',
    tier: '3-A',
    reason: '9. gök katı Savaş Tanrısı. 1-A abartısı yerine 3-A göksel makam.'
  },
  {
    name: 'Mergen Tengri',
    tier: '3-A',
    reason: '7. gök katı Bilgelik Tanrısı. 1-A abartısı yerine 3-A göksel makam.'
  }
];

async function applyCorrections() {
  console.log('Rasyonel VS Battles Wiki Tier Düzeltmeleri Uygulanıyor...\n');
  for (const c of CORRECTIONS) {
    const { data: existing } = await supabase.from('characters').select('id, tier, description').eq('name', c.name).maybeSingle();
    if (existing) {
      // Metin içindeki eski tier referansını da temizle
      let newDesc = existing.description || '';
      newDesc = newDesc.replace(/Tier\s*2-B/gi, `Tier ${c.tier}`)
                       .replace(/High\s*1-A/gi, `Tier ${c.tier}`)
                       .replace(/Low\s*1-C/gi, `Tier ${c.tier}`)
                       .replace(/Tier\s*1-A/gi, `Tier ${c.tier}`);

      const { error } = await supabase.from('characters').update({
        tier: c.tier,
        description: newDesc
      }).eq('id', existing.id);

      if (error) {
        console.error(`❌ Hata (${c.name}):`, error);
      } else {
        console.log(`✅ [${existing.tier.padEnd(8)} ➡️  ${c.tier.padEnd(7)}] ${c.name.padEnd(25)} | ${c.reason}`);
      }
    } else {
      console.warn(`⚠️ Karakter bulunamadı: ${c.name}`);
    }
  }
  console.log('\n🏁 Tüm tierler rasyonel VS Battles Wiki standartlarına oturtuldu!');
}

applyCorrections();
