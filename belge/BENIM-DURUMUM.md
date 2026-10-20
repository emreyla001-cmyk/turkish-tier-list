# BENİM DURUMUM — turkish-tier-list

**Son güncelleme:** 2026-10-03

| Alan | Değer |
|---|---|
| **Projeler** | 1 |
| **Durum** | Erişilebilirlik deploy edildi, ekonomi bekliyor |
| **Canlı** | https://turkish-tier-list-web-production.up.railway.app |
| **Repo** | https://github.com/emreyla001-cmyk/turkish-tier-list (**herkese açık**) |
| **Çalışan kod** | `ff04c5f` |
| **Önceki hali** | `2d6a167` + etiket `YEDEK-ekonomi-oncesi` |
| **Tam yedek** | branch `yedek/ekonomi-2026-10-03` |

---

## ANA HEDEF

Çok amaçlı yapay zekâ sistemi kurmak. Bu site, sistemin **web geliştirme dalının test projesi.**

## ŞU ANKİ ANA ÇİZGİ

1. Ekonomiyi güvenli hale getir (`user_metadata` hile vektörü)
2. Erişilebilirliği tamamla (klavye oynanamıyor)
3. Ajan zincirlemesini kurulumun parçası yap

## EN GÜÇLÜ ÇELİŞKİ

**"Çok amaçlı AI" hedefi** ile **"bir sitede uzun süre takılmak"** davranışı çatışıyor.
Bu oturumda site iyi gitti; ama sistemi geliştiren şey site değil.

## SON NODE

3 Ekim 2026 — Ajan zinciri (strateji → denetci → uygulama). 3 kritik hata yakalandı,
hepsi doğrulandı ve düzeltildi. Erişilebilirlik canlıya alındı.

3 Ekim 2026 (akşam) — **Sistem yapısı oturumu.** Asistan sadeleştirildi, test altyapısı kuruldu.
Detay: `01-fakt/2026-10-03_sistem-yapisi.md`

## ASISTAN SİSTEMİ — GÜNCEL DURUM

| | Değer | Nerede |
|---|---|---|
| Ajan | **6** | `.opencode/agents/` |
| Komut | **7** | `.opencode/commands/` |
| Skill | **24 / 25** | `.opencode/skills/` |
| Yapısal test | **7/7 geçiyor** | `powershell -File .opencode\testler.ps1` |
| Davranışsal test | **0/6 koşuldu** | `TESTLER.md` |
| MCP | 6 sunucu | `opencode.jsonc` |

**Varsayılan model:** `omniroute/antigravity/claude-sonnet-4-6` — ✅ çalışıyor (HTTP 200, doğrulandı)

**Test etme kuralı:** Değişiklikten sonra `testler.ps1` koş. Çıkış kodu 0 = hepsi geçti.

## GÜNCEL BEKLENEN SONUÇ

- `user_metadata` temizliği → coin hilesi kapanır
- 9 oyun kartı `<button>` olur → klavye oynayabilir
- Form alanları etiketlenir

## BEKLEYEN DOĞRULAMA

- **Kullanıcı gözü:** Canlıda Tab'a basınca "İçeriğe geç" görünüyor mu? (Bot penceresi odaklanamıyor, ölçemedim)

## ŞİMDİLİK UZAK DURULAN

- `reward_coins` istemciden çağrılabilir (tavan içi hile). Tam çözüm = oyun mantığını sunucuya taşımak (yarım gün)
- Anti-cheat tarayıcıda. Gerçek çözüm middleware'e taşımak
- `authenticated` rolünde UPDATE yok → profil düzenleme çalışmıyor mu bilinmiyor

## ⚠️ DÜZELTMELER (silinmedi, altına not düşüldü)

| Ne | Gerçek |
|---|---|
| "OmniRoute anahtarı bayat, varsayılan model bozuk" | **YANLIŞ ALARM.** `claude-sonnet-4-6` ve `gemini-3.1-flash-lite` HTTP 200 çalışıyor. 401 sadece `openrouter/...` ön ekli isimlerde — kullanılmayan yol |
| "Gemini ücretsiz, en düşük engel giriş noktası" | **YANLIŞ.** Araştırma ajanının iddiası. Metin ücretsiz, **görsel `limit: 0`** |
| "Pollinations çalışıyor, 4/4 geçti" | **EKSİK.** HTTP 200 idi ama 4 görsel aynı hash — gerçek üretim yok. ~25 sn/görsel, tek model |
| "Gemini modelleri 429 veriyor, hepsi ölmüş" | **YANLIS ALARM.** 6 paralel istekten geldi. Sırayla denendi → `gemini-3.5-flash-lite` ve `gemini-3.1-flash-lite` 3/3 HTTP 200. Gerçek ölü olan: `gemini-3.8-flash-tiered`, `gemini-3-flash` (timeout) |

## SON KARARLAR

| Tarih | Karar | Gerekçe |
|---|---|---|
| 2026-10-03 | **Görsel üretimi ertelendi** | Site işi kapandı. Uzak yollar tık (Gemini `limit: 0`, Pollinations 25 sn/görsel tek model, HF Spaces erişilemiyor). İhtiyaç doğduğunda SDXL yerel kurulur |
| 2026-10-03 | **`arastirma` skill'i slash komutu oldu**, `/araştır` silindi | İkisi çakışıyordu. Tek doğruluk kaynağı bırak |
| 2026-10-03 | **`code-reviewer` silindi**, kod incelemesi `denetci`'ye | 7 aylık kullanımda hiç çağrılmamış, `denetci` aynı işi yapıyor |
| 2026-10-03 | **Test, orkestra'dan önce yazıldı** | Claude Bulgu 5: test olmadan orkestra "çalışıyor gibi görünür" |
| 2026-10-03 | **Anahtar sohbete yazılmaz**, `gemini.key` dosyasına | `omniroute.key` deseni. `opencode.jsonc` içinde `{env:GEMINI_API_KEY}` ile okunur |
| 2026-10-03 | **25 skill limiti korundu** | `agent-skills`'in 25'ini kurmak 46'ya çıkarırdı. 3 tanesi seçildi |
| 2026-10-03 | Para kaynağı `profiles` | `user_metadata`'yı kullanıcı serbestçe yazabiliyor |
| 2026-10-03 | `description` yerine `description_short` | Tam açıklama payload'un %72'si, sadece 160 karakteri kullanılıyor |
| 2026-10-03 | `*:focus-visible` kuralına `border-radius`/`box-shadow` yazma | Specificity eşitliğiyle avatarı kareleştirir, 40 gölge kuralını siler |
| 2026-10-03 | **`ai-toplanti` skill'i kuruldu** (25/25) | "AI toplantısını aç" → arka planda Claude Opus + GPT-OSS + Gemini sırayla konuşur, birbirini dinler, Opus kararı verir. `toplanti.py`. Ölçü: 33-45 sn, 3.515 token, 0 hata |
| 2026-10-03 | **Toplantı `antigravity/*` rotasını kullanır, OpenRouter'ı değil** | Kredi harcanmaz. 5 model ölçüldü çalışıyor; `gemini-3.8-flash-tiered` ve `gemini-3-flash` ölü (timeout) |
| 2026-10-03 | Gerçek para = 141.985 | Kullanıcı beyanı |