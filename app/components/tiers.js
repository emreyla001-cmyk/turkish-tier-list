// Tier sistemi: VS Battles Wiki "Tiering System" sayfasından Türkçeye uyarlanmıştır.
// Sıralama en zayıftan (11-C) en güçlüye (0) doğrudur.
const RAW = [
  ['11-C', "Düşük Hipoverse", "Sıfır boyutlu yapıları yaratıp yok edebilecek düzey; 3 boyutlu gerçekliğin çok altında bir varlık seviyesi."],
  ['11-B', "Hipoverse", "Tek boyutlu yapıları yaratıp yok edebilecek düzey."],
  ['11-A', "Yüksek Hipoverse", "İki boyutlu yapıları yaratıp yok edebilecek düzey."],
  ['10-C', "İnsan altı seviye", "Ortalamanın altında insan gücü: küçük çocuklar, hasta kişiler ve kedi, köpek gibi küçük hayvanlar."],
  ['10-B', "İnsan seviyesi", "Sıradan insan gücü: gençler ve spor yapmayan yetişkinler."],
  ['10-A', "Atlet seviyesi", "Fiziksel olarak formda insanlar: antrenmanlı dövüşçüler ve sporcular."],
  ['9-C', "Sokak seviyesi", "İnsan gücünün sınırı: olimpiyat düzeyinde sporcular, çok iyi eğitimli dövüş sanatçıları ve büyük hayvanlar. Adı gerçek bir sokağı yıkmakla ilgili değil, dövüş filmlerindeki sokak dövüşçülerinden gelir."],
  ['9-B', "Duvar seviyesi", "Taş, metal ve çelik gibi çok dayanıklı malzemeleri ve duvarları yıkabilir ya da ciddi hasar verebilir."],
  ['9-A', "Küçük bina seviyesi", "Oda ya da küçük ev gibi yapıları yıkabilir."],
  ['8-C', "Bina seviyesi", "Fabrika ya da market gibi orta boy yapıları yıkabilir."],
  ['High 8-C', "Büyük bina seviyesi", "Gökdelen gibi büyük binaları yıkabilir."],
  ['8-B', "Şehir bloğu seviyesi", "Bir şehir bloğunu yıkabilir."],
  ['8-A', "Çoklu şehir bloğu seviyesi", "Birden fazla şehir bloğunu yıkabilir."],
  ['Low 7-C', "Küçük kasaba seviyesi", "Küçük bir kasabayı ya da yerleşimi yok edebilir."],
  ['7-C', "Kasaba seviyesi", "Bir kasabayı yok edebilir."],
  ['High 7-C', "Büyük kasaba seviyesi", "Büyük bir kasabayı yok edebilir."],
  ['Low 7-B', "Küçük şehir seviyesi", "Küçük bir şehri yok edebilir."],
  ['7-B', "Şehir seviyesi", "Bir şehri yok edebilir."],
  ['7-A', "Dağ seviyesi", "Bir dağı yok edebilir."],
  ['High 7-A', "Büyük dağ seviyesi", "Büyük bir dağı yok edebilir."],
  ['6-C', "Ada seviyesi", "Bir adayı yok edebilir."],
  ['High 6-C', "Büyük ada seviyesi", "Büyük bir adayı yok edebilir."],
  ['Low 6-B', "Küçük ülke seviyesi", "Küçük bir ülkeyi yok edebilir."],
  ['6-B', "Ülke seviyesi", "Bir ülkeyi yok edebilir."],
  ['High 6-B', "Büyük ülke seviyesi", "Büyük bir ülkeyi yok edebilir."],
  ['6-A', "Kıta seviyesi", "Bir kıtayı yok edebilir."],
  ['High 6-A', "Çoklu kıta seviyesi", "Birden fazla kıtayı yok edebilir."],
  ['5-C', "Ay seviyesi", "Ay ya da benzer büyüklükte bir gök cismini yok edebilir."],
  ['Low 5-B', "Küçük gezegen seviyesi", "Küçük bir gezegeni yok edebilir."],
  ['5-B', "Gezegen seviyesi", "Bir gezegeni yaratıp yok edebilir."],
  ['5-A', "Büyük gezegen seviyesi", "Uranüs ve Neptün gibi büyük buz devlerini yaratıp yok edebilir."],
  ['High 5-A', "Cüce yıldız seviyesi", "Çok küçük yıldızları yaratıp yok edebilir."],
  ['Low 4-C', "Küçük yıldız seviyesi", "Küçük yıldızları yaratıp yok edebilir."],
  ['4-C', "Yıldız seviyesi", "Bir yıldızı yaratıp yok edebilir."],
  ['High 4-C', "Büyük yıldız seviyesi", "Büyük bir yıldızı yaratıp yok edebilir."],
  ['4-B', "Güneş sistemi seviyesi", "Bir güneş sistemini yaratıp yok edebilir."],
  ['4-A', "Çoklu güneş sistemi seviyesi", "Birden fazla güneş sistemini yaratıp yok edebilir."],
  ['3-C', "Galaksi seviyesi", "Gök cisimleri arasındaki boşluk da hesaba katılarak bir galaksiyi yaratıp yok edebilir."],
  ['3-B', "Çoklu galaksi seviyesi", "Birden fazla galaksiyi, aradaki boşlukla birlikte yaratıp yok edebilir."],
  ['3-A', "Evren seviyesi", "Gözlemlenebilir evren büyüklüğündeki sonlu bir 3 boyutlu evreni yaratıp yok edebilir ya da ciddi biçimde etkileyebilir."],
  ['High 3-A', "Yüksek evren seviyesi", "Sonsuz enerji ölçeğinde güç: sonsuz büyüklükteki 3 boyutlu uzayı etkileyebilir."],
  ['Low 2-C', "Evren üstü (Evren+) seviyesi", "Sonsuz bir 3 boyutlu uzaydan niteliksel olarak daha büyük bir alanı, örneğin bir evrenin tüm uzay-zaman sürekliliğini etkileyebilir."],
  ['2-C', "Düşük çoklu evren seviyesi", "İki ile bin arasında ayrı uzay-zamandan oluşan küçük çoklu evrenleri etkileyebilir."],
  ['2-B', "Çoklu evren seviyesi", "Bin bir ve üzeri sayıda ayrı uzay-zamandan oluşan çoklu evrenleri etkileyebilir."],
  ['2-A', "Çoklu evren+ seviyesi", "Sayılabilir sonsuzlukta ayrı uzay-zaman sürekliliğini etkileyebilir."],
  ['Low 1-C', "Düşük karmaşık çoklu evren", "Standart evren modelinden bir ya da iki sonsuzluk kademesi daha büyük yapıları etkileyebilir (5 ve 6 boyutlu uzaylar)."],
  ['1-C', "Karmaşık çoklu evren", "Üç ila beş sonsuzluk kademesi daha büyük yapıları etkileyebilir (7 ila 9 boyutlu uzaylar)."],
  ['High 1-C', "Yüksek karmaşık çoklu evren", "Altı ila yedi sonsuzluk kademesi daha büyük yapıları etkileyebilir (10 ve 11 boyutlu uzaylar)."],
  ['1-B', "Hiperverse", "Sekiz ve üzeri sonlu sayıda sonsuzluk kademesi daha büyük yapıları etkileyebilir (12 ve üzeri boyutlu uzaylar)."],
  ['High 1-B', "Yüksek hiperverse", "Sayılabilir sonsuzlukta kademe: her biri bir öncekini anlamsızlaştıran sonsuz katmanlı varoluş hiyerarşileri."],
  ['Low 1-A', "Düşük dış-evren (Outerverse)", "Sayılabilir sonsuzluktan daha fazla, yani sayılamaz sonsuzlukta boyuta sahip yapıları etkileyebilir."],
  ['1-A', "Dış-evren (Outerverse)", "Low 1-A yapılarını, onların High 1-B yapılarını aştığı ölçüde aşar; tier sisteminin geri kalanını işlevsel olarak aşan varlıklar."],
  ['High 1-A', "Yüksek dış-evren", "1-A ve altını tanımlayan mantıksal çerçevenin izin verdiğinden daha büyük yapıları etkileyebilir."],
  ['0', "Sınırsız (Boundless)", "High 1-A yapılarının mantıksal temellerini bile aşar ve üst sınırı yoktur. Sadece her şeye kadir olmak bu tier için yeterli sayılmaz."],
];

export const TIERS = RAW.map(([id, name, desc]) => ({ id, name, desc }));

export const GROUPS = {
  11: ['Hipoverse', 'Düşük boyutlu (0, 1 ve 2 boyutlu) yapılar; teorik ve nadir bir aralık.'],
  10: ['İnsan', 'Sıradan insan güç aralığı.'],
  9: ['Üstün insan', 'İnsan gücünün sınırı ve biraz ötesi.'],
  8: ['Kentsel', 'Bina ve şehir bloğu ölçeğinde yıkım.'],
  7: ['Nükleer', 'Kasaba, şehir ve dağ ölçeğinde yıkım.'],
  6: ['Tektonik', 'Ada, ülke ve kıta ölçeğinde yıkım.'],
  5: ['Gezegensel', 'Ay ve gezegen ölçeğinde yıkım.'],
  4: ['Yıldızsal', 'Yıldız ve güneş sistemi ölçeğinde yıkım.'],
  3: ['Kozmik', 'Galaksi ve evren ölçeğinde güç.'],
  2: ['Çoklu evren', 'Birden fazla evrenin uzay-zamanını etkileyen güç.'],
  1: ['Boyut ötesi', 'Evren modellerinin ötesindeki yüksek boyutlu yapılar.'],
  0: ['Sınırsız', 'Sistemin mantıksal temellerini bile aşan, üst sınırı olmayan seviye.'],
};

export function tierInfo(id) {
  if (!id) return null;
  return TIERS.find((t) => t.id === id.trim()) || null;
}

// En zayıf = 0, en güçlü = son. Bilinmeyen tier = -1
export function tierRank(id) {
  return id ? TIERS.findIndex((t) => t.id === id.trim()) : -1;
}

export function tierNumber(id) {
  if (!id) return null;
  const t = id.trim();
  if (t === '0') return 0;
  const m = t.match(/(\d+)-[ABC]/i);
  return m ? Number(m[1]) : null;
}

// Rozet renk grubu: sayı küçüldükçe güç artar
export function tierGroup(id) {
  const n = tierNumber(id);
  if (n === null) return 'tg-none';
  if (n === 0 || id.trim().toLowerCase() === 'high 1-a') return 'tg-0';
  if (n >= 9) return 'tg-9';
  if (n >= 7) return 'tg-7';
  if (n >= 5) return 'tg-5';
  if (n >= 3) return 'tg-3';
  return 'tg-1';
}
