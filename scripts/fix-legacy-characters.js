const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
let url = '', key = '';
for (let l of env.split('\n')) {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.split('=')[1].trim();
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = l.split('=')[1].trim();
}

const supabase = createClient(url, key);

const updates = [
  {
    name: 'Hızır',
    description: `1. Boyutsal Üstünlük ve Mekan Manipülasyonu (Dimensional Transcendence)
📌 Gerekçe: Hızır, Samanyolu TV "Beşinci Boyut" külliyatında insanların algıladığı 3 boyutlu uzayın ve zamanın (4. boyut) tamamen ötesinde bir varoluş düzleminde yaşar.
🔍 Açıklama: Üç boyutlu dünyanın fiziksel sınırlarına, duvarlarına ve mesafelerine tabi değildir. Mekandan tamamen bağımsızdır; aynı anda birden fazla yerde tecelli edebilir veya dilediği mekanda anında belirebilir (Omnipresence / Anlık Teleportasyon).

2. Zamansızlık ve Olay Örüntüsü Manipülasyonu (Acausality & Causality Warping)
📌 Gerekçe: Beşinci Boyut evreninde geçmiş, şimdi ve gelecek onun nazarında tek bir levhada açıktır.
🔍 Açıklama: Nedensellik yasalarının dışındadır; insanların gelecekteki seçimlerini, işleyecekleri günahları ve yaşayacakları akıbeti önceden bilir (Prekognisyon / Kader Görüsü). Olayların sebep-sonuç bağlarına müdahale ederek felaketleri önleyebilir veya ilahi adaletin tecellisini hızlandırabilir.

3. Gerçeklik Bükme, Madde Dönüşümü ve İllüzyon (Reality Warping & Transmutation)
📌 Gerekçe: Dilediği an çevresindeki fiziksel gerçekliği, eşyaların doğasını ve insanların zihin algılarını dönüştürür.
🔍 Açıklama: Maddeleri yoktan var edebilir, nesnelerin formunu değiştirebilir ve insanlara yaşlı bir dede, bir doktor ya da sokak fukarası suretinde tecelli edebilir (Şekil Değiştirme / Avatar Projeksiyonu).

4. İlahi Bilgelik ve Zihinsel Nüfuz (Nigh-Omniscience & Mind Reading)
📌 Gerekçe: Dizi sınırları dahilinde ölümlülerin kalplerinden geçen en gizli niyetleri, pişmanlıkları ve sırları doğrudan okur.
🔍 Açıklama: Fiziksel silahlar, kurşunlar ve patlamalar ruhani bedenine temas bile edemez (Soyut Varlık / Dokunulmazlık). Tier 2-B düzeyinde kozmik/ilahi bir düzenleyicidir.`
  },
  {
    name: 'Haberci Medet',
    description: `1. Mutlak Ecel Algısı ve Kader Bilgisi (Omnipresence of Demise & Limited Omniscience)
📌 Gerekçe: Samanyolu 'Kollama' ve 'Beşinci Boyut' metafizik çizgisine göre Medet, ömrü tükenen insanların ne zaman, nerede ve hangi sebeple can vereceğini eksiksiz olarak bilir.
🔍 Açıklama: Zaman çizelgelerine ve kader defterine doğrudan bağlıdır; kurbanlarına ölüm saati gelmeden önce son bir tövbe veya uyarı fırsatı sunmak üzere tezahür eder.

2. Boyutlararası Geçiş ve Maddesel Saydamlık (Intangibility & Cross-Dimensional Teleportation)
📌 Gerekçe: Fiziksel duvarlar, kilitli çelik kapılar veya mesafeler Medet'i durduramaz; bir saniye içinde bir hastane odasında, bir aynanın yansımasında ya da otoban ortasında belirir.
🔍 Açıklama: Maddesel evrenin katı kurallarına tabi olmayan 5. boyut varlığıdır; 3 boyutlu kütlesi bulunmadığından mermi, bıçak veya patlayıcılar içinden geçip gider (Fiziksel Hasar Bağışıklığı).

3. Zihin ve Kabus Manipülasyonu (Dream & Guilt-Induced Hallucination)
📌 Gerekçe: Sadece eceli yaklaşan veya vicdan azabı çeken şahıslara görünür; sıradan ölümlüler onu asla algılayamaz.
🔍 Açıklama: Hedefinin bilincini kabuslara, ölüm anı projeksiyonlarına ve kabir azabı vizyonlarına hapsederek zihinsel yıkım yaratabilir (Kavramsal Korku ve Vicdan İndüklemesi).`
  },
  {
    name: 'Karabasan',
    description: `1. Soyut Kabus Anatomisi ve Fiziksel Hasar Bağışıklığı (Abstract & Intangible Physiology)
📌 Gerekçe: Karabasan, etten kemikten biyolojik bir varlık değildir; doğrudan insanların uyku felçlerinden, metafizik kabuslarından ve korku enerjisinden teşekkül etmiştir.
🔍 Açıklama: Katı bir gövdesi olmadığından fiziksel saldırılar, kurşunlar veya darbeler ona hiçbir tesir etmez. Dilediği gibi yoğunlaşabilen, akışkan karanlık bir forma sahiptir (Tam İntangibility ve Biyolojik Direnç).

2. Kavramsal Güç Kaynağı ve Vicdan Parazitliği (Conceptual Feeding & Reality Warping)
📌 Gerekçe: Gücü doğrudan hedefin taşıdığı suçluluk, günah, vicdan azabı ve ruhsal çöküşten beslenir; "uykunun ve bilincin sonu" olarak kendini tanımlar.
🔍 Açıklama: Düşmanının ruhunda kötülük ve vicdan yükü ne kadar fazlaysa, Karabasan o derece kudret kazanır. 5. Boyut hiyerarşisinde metafiziksel bir yargı/ceza aracı olarak çalışır (Low 1-C Boyutsal Tezahür).

3. Telekinezi ve Uyku Felci Projeksiyonu (Paralysis & Telekinetic Oppression)
📌 Gerekçe: Kurbanının üzerine çöktüğü anda tüm motor sinirleri kilitler, nefesini keser ve fiziksel ağırlık uygulayarak göğüs kafesini ezer.
🔍 Açıklama: Maddeleri zihinsel ve boyutsal baskıyla hareket ettirebilir; rüya ile uyanıklık arasındaki boyutsal sınırda mutlak kontrol sahibidir.`
  }
];

async function update() {
  for (const u of updates) {
    const { error } = await supabase.from('characters').update({ description: u.description }).eq('name', u.name);
    if (error) {
      console.error(`Error updating ${u.name}:`, error);
    } else {
      console.log(`✅ Updated ${u.name} with rigorous academic formatting.`);
    }
  }
}

update();
