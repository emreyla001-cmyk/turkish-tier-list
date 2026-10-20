const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://wgqwizwyftdoxizhrljg.supabase.co', 'sb_publishable_XONl7IYzFgnHU7KwDddDyA_4QDWDYHz');

const previous79 = [
  "Ak Sakallı Dede", "Akıncı", "Alp Er Tunga (Barba Tunga)", "Alşimist", "Arif Işık",
  "Asena (Aşina)", "Ateş Büyücüsü Yılmaz", "Ay Ata", "Azrail", "Battal Gazi",
  "Bay Ülgen", "Behmut", "Bez Bebek Nana", "Bilgecan Dede", "Bürküt (Merküt / Ak Anka)",
  "Buzlar Kraliçesi İlayda", "Çirkin Cadı", "Davaro", "Dede Korkut", "Deli Dumrul",
  "Drakula", "Dudu Peri", "Emiray", "Ergun Plak", "Erlik Han",
  "Ertuğrul Bey", "Fil Necati", "Fındık Sabri", "Gezer Han (Abay Geser)", "Gök Tengri (Kök Tengri)",
  "Gökbörü (Kök Börü)", "Gulyabani", "Gün Ana (Kün Ana)", "Haberci Medet", "Hades",
  "Hakan: Muhafız", "Hızır", "İskender Büyük", "İskender Paşa", "Karabasan",
  "Karakaçan (Eşek)", "Kayra Han", "Keloğlan", "Kemal Kükreyen", "Kertenkele (Ziya / Ayyıldızlı Adam)",
  "Kızagan Tengri", "Komutan Logar", "Kordon Celil", "Kral Şakir", "Kubat 30 Şubat",
  "Lord Turac", "Maraz Ali", "Mergen Tengri", "Mesut Güneri", "Nasreddin Hoca",
  "Osman Hoca", "Polat Alemdar", "Ramiz Karaeski", "Şahmeran", "Selena",
  "Şeytan (İblis)", "Sıran Kaya", "Şoker", "Süleyman Çakır", "Süper Türk",
  "Tarkan", "Tepegöz", "The Qu", "Tosun Paşa", "Tozkoparan İskender",
  "Tulpar", "Turgut Alp", "Umay Ana", "Uzun İhsan Efendi", "Vartolu Sadettin (Salih Koçovalı)",
  "Yamaç Koçovalı", "Yer-Su Ruhları", "Yüce Honos", "Zebani"
];

async function compareCurrent() {
  const { data } = await supabase.from('characters').select('id, name, series, tier, image_url');
  const currentNames = data.map(c => c.name.trim());
  
  const deleted = previous79.filter(p => !currentNames.some(c => c.includes(p) || p.includes(c)));
  console.log('Deleted or renamed recently:');
  deleted.forEach(d => console.log('  -', d));
}

compareCurrent();
