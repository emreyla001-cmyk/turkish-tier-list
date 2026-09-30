const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://wgqwizwyftdoxizhrljg.supabase.co', 'sb_publishable_XONl7IYzFgnHU7KwDddDyA_4QDWDYHz');

const oldList = [
  "Ak Sakallı Dede", "Akıncı Fatih", "Akıncı Hicabi", "Alp Er Tunga (Barba Tunga)", "Alşimist",
  "Arif Işık", "Asena (Aşina)", "Ay Ata", "Azrail", "Battal Gazi",
  "Bay Ülgen", "Behmut", "Bez Bebek Nana", "Bilgecan Dede", "Buzlar Kraliçesi İlayda",
  "Bürküt (Merküt / Ak Anka)", "Davaro", "Dede Korkut", "Deli Dumrul", "Drakula",
  "Dudu Peri", "Emiray", "Ergun Plak", "Erlik Han", "Ertuğrul Bey",
  "Fil Necati", "Fındık Sabri", "Gezer Han (Abay Geser)", "Gulyabani", "Gök Tengri (Kök Tengri)",
  "Gökbörü (Kök Börü)", "Gün Ana (Kün Ana)", "Haberci Medet", "Hades", "Hakan: Muhafız",
  "Hamati", "Hızır", "Karabasan", "Karakaçan (Eşek)", "Kayra Han",
  "Keloğlan", "Kemal Kükreyen", "Kertenkele (Ziya / Ayyıldızlı Adam)", "Komutan Logar", "Kordon Celil",
  "Kral Şakir", "Kubat 30 Şubat", "Kızagan Tengri", "Lord Turoc", "Maraz Ali",
  "Mergen Tengri", "Mesut Güneri", "Metruk", "Nasreddin Hoca", "Osman Hoca",
  "Polat Alemdar", "Ramiz Karaeski", "Selena", "Süleyman Çakır", "Süper Türk",
  "Sıran Kaya", "Tarkan", "Tepegöz", "The Qu", "Tosun Paşa",
  "Tozkoparan İskender", "Tulpar", "Turgut Alp", "Umay Ana", "Uzman Ağa",
  "Uzun İhsan Efendi", "Vartolu Sadettin (Salih Koçovalı)", "Wizard Yılmaz", "Yamaç Koçovalı", "Yer-Su Ruhları",
  "Yüce Honos", "Zebani", "Çirkin Cadı", "İnek Şaban", "İskender Büyük",
  "İskender Paşa", "Şahmeran", "Şeytan (İblis)", "Şoker"
];

async function compare() {
  const { data: current } = await supabase.from('characters').select('id, name, series, tier, image_url, description');
  const currentNames = current.map(c => c.name.trim());

  console.log('Old count:', oldList.length);
  console.log('Current count:', current.length);

  // Missing from current
  const missing = oldList.filter(name => !currentNames.includes(name));
  console.log('\n--- In Old List but NOT in Current DB (or renamed/deleted) ---');
  missing.forEach(name => console.log('  -', name));

  // In current but not in old
  const added = current.filter(c => !oldList.includes(c.name.trim()));
  console.log('\n--- In Current DB but NOT in Old List (newly named/added) ---');
  added.forEach(c => console.log('  +', c.name, `[ID: ${c.id.slice(0, 8)}] [Series: ${c.series}]`));
}

compare();
