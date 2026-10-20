# Turkish Tier List

## Kurulum
1. `npm install`
2. `.env.local.example` dosyasını `.env.local` olarak kopyala (içindeki Supabase bilgileri zaten dolu)
3. `npm run dev`
4. Tarayıcıda `http://localhost:3000`

## Supabase Backend
- Proje: turkish-tier-list (eu-central-1)
- Tablolar: `profiles`, `characters`, `comments`, `character_submissions`
- Karakter eklemek için Supabase panelinde Table Editor > characters > yeni satır, `status` alanını `published` yap.
- Görsel/video yüklemek için Storage > character-media bucket'ına dosya yükle, oradaki public URL'i karakterin `image_url` / `video_url` alanına yapıştır.

## Admin Olmak
1. Sitede normal şekilde kayıt ol (`/kayit-ol`).
2. Kayıt olduğun e-postayı Claude'a söyle — Supabase'de senin `profiles` satırındaki `is_admin` alanını `true` yapacak.
3. Bundan sonra `/admin` sayfası açılır: karakter ekle/düzenle/sil, kullanıcı önerilerini onayla/reddet.

## Kullanıcı akışı
- Ziyaretçi: `/` üzerinden yayınlanmış karakterleri görür.
- Kayıtlı kullanıcı: yorum yapabilir (`/karakter/[id]`), karakter önerebilir (`/karakter-oner`).
- Admin: `/admin` üzerinden karakter CRUD + öneri onayı yapar. Onaylanan öneriler "taslak" olarak eklenir, admin görsel/stat/tier girip yayına alana kadar sitede görünmez.

## Sıradaki adım
- Vercel'e deploy (GitHub'a yükleyip birkaç tıkla bağlanacak)
