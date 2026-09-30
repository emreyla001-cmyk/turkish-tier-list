# Turkish Tier List — Proje Hafızası ve Durum Özeti

> Bu dosya, projede çalışan herhangi bir yapay zeka modeline (OmniRoute, Claude, Gemini, Cursor vb.) projenin geçmişini, kurallarını ve en son kalınan noktayı tek seferde aktarmak için hazırlanmıştır.

---

## 1. Proje Kimliği ve Teknolojiler
* **Proje:** Turkish Tier List (Türkiye Pop-Kültür, Dizi, Film ve Karakter Tier Listesi & Kart Oyunu)
* **Teknoloji Yığını:** Next.js 14 (App Router), React 18, Tailwind CSS, Supabase (PostgreSQL, Auth, Storage, Realtime).
* **Klasör Konumu:** `C:\Users\EMRE\Desktop\turkish-tier-list-TAM`
* **Canlı Dal:** GitHub `main`

---

## 2. Kullanıcının Kesin Kuralları ve Tercihleri
1. **Sıfır Sahte / Bot Veri Kuralı:** Veritabanına veya siteye asla sahte kullanıcı, bot klan, uydurma oy veya otomatik üye eklenmez. Her şey temiz ve gerçekçi olmalıdır.
2. **"Bana Sorma, Halledip Test Et":** Gerekli iyileştirmeleri doğrudan koda dök, `npm run build` ile doğrula ve temiz çalışır halde teslim et.
3. **Ekonomi ve Gacha Dengesi:**
   - **UR (Ultra Rare):** Hemen çıkmaz, oyunu domine etmeyi engellemek için elit ve uzun vadeli ödül olarak kalmalıdır.
   - **SSR:** Her pakette değil; Mobile Legends Adventure mantığıyla şansa bağlı olarak 2 ya da 3 pakette bir çıkmalıdır.
   - **Ekonomi:** Kullanıcıya oyun oynatarak (kart savaşı, bilmece, kim alır vb.) bol para kazandırıp mağazada çok harcatacak zengin içerikler (paketler, hareketli çerçeveler, unvanlar, arka planlar) sunulmalıdır.
4. **Çoklu Oturum / Ajan Güvenliği:** Kodlarda asla `git stash` kullanılmaz; her commit öncesi build alınır.

---

## 3. Tamamlanan ve Çalışır Durumdaki Modüller
* **3 Katmanlı Cüzdan ve XP Sistemi (`app/lib/wallet.js` & `app/lib/gamificationUtils.js`):**
  - XP ve Bakiye; `user_metadata`, `localStorage` ve `profiles` tablosunda anında eşitlenir.
  - OmniRoute tabanlı **Anti-Cheat (Hız Limiti)** devrededir (Dakikada maks 1500 XP sınırı ile sonsuz döngü ve hileler engellenir).
  - Seviye kademeleri (Çırak, Gezgin, Usta, Şampiyon, Efsane) aktiftir.
* **Mağaza & Kozmetikler (`app/magaza`, `app/components/cosmetics.js`, `app/profil`):**
  - Hareketli avatar çerçeveleri (VIP, Neon, Alev, Kozmik vb.).
  - Hareketli profil arka planları (Profil banner'ında ve arka planında canlı görünüm).
  - Profil kozmetik galerisinde sahip olunan arka planları seçip donatma.
* **Oyun Modları (`app/kart-oyunu/savas`, `app/oyunlar/*`):**
  - Kart Savaşı, Karakter Bilmece, Kim Alır, Draft Duel.
* **OmniRoute Entegrasyonu:**
  - Yerel sunucu port 20128'de hazır. Google Gemini, OpenRouter ve Ollama (RTX 4060 Llama 3.2) bağlı.

---

## 4. Sıradaki Yapılacak İşler Listesi
1. **Gacha Oranlarının Matematiksel Rafinesi:** Kart paketlerindeki UR ve SSR çıkma yüzdelerini MLA (Mobile Legends Adventure) gacha matematiğiyle tam oturtmak.
2. **Discord Tarzı Hareketli Avatarlar & Çerçeveler:** Hareketli çerçevelerin ve efektlerin mağaza ve profil entegrasyonunu genişletmek.
3. **Kart Oyununa AI Rakip / Karakter Sohbeti:** İleride OmniRoute yerel API'si üzerinden siteye yapay zeka desteği kazandırmak.
