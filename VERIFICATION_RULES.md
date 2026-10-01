# Doğrulama ve Raporlama Kuralları (Zorunlu — Her Görevde Geçerli)

Bu proje için her kod değişikliği, güvenlik düzeltmesi veya "tamamlandı" raporu, aşağıdaki standartlara uymak zorundadır. Bu kurallara uymayan raporlar eksik sayılır ve kabul edilmez.

## 1. "Tamamlandı/Düzeltildi/Kapatıldı" Demeden Önce
Bu kelimeleri kullanmadan önce, raporda şunlar MUTLAKA bulunmalı:
- **Ham test çıktısı** (ekran görüntüsü değil, gerçek komut/log çıktısı)
- Testin GERÇEKTEN iddia edilen senaryoyu tetiklediğinin kanıtı (var olan fixture ID ile).
- İlgili commit hash'i veya PR linki

## 2. Zorunlu Test Senaryoları (Her Yeni/Değiştirilen API Endpoint İçin)
Aşağıdaki senaryoların HER BİRİ test edilmeden bir endpoint "güvenli" sayılamaz:
- [x] **Oturum yok**: Token olmadan istek — beklenen: 401
- [x] **Geçerli oturum, yanlış rol**: Normal kullanıcı token'ıyla admin/moderatör işlemi denemek — beklenen: 403 (401 değil, ayrı test!)
- [x] **Sınır değerler**: 0, negatif sayı, aşırı büyük sayı (999999999), boş string, null, beklenmeyen tip (obje/dizi)
- [x] **Eşzamanlı/paralel istek (race condition)**: Aynı ödül/işlem isteğini aynı anda 2+ kez gönder, sonucun yalnızca BİR kez uygulandığını doğrula (idempotency)
- [x] **Başkasının verisine erişim**: Kullanıcı A, kullanıcı B'nin profiline/bakiyesine kendi token'ıyla erişmeye çalışırsa — beklenen: 403 veya yetki engeli

## 3. "Hazırlandı" ile "Aktif/Uygulandı" Farkı
Bir SQL dosyası veya config dosyası YAZMAK, onun PRODUCTION'DA ÇALIŞTIĞI anlamına gelmez:
- Politika/dosya canlı Supabase / prod ortamına uygulandı mı?
- Nasıl doğrulandı (Supabase Dashboard / RLS rozeti / manuel test)?

## 4. Otomasyon İddialarının Doğrulanması
- Pipeline dosyası (`.github/workflows/*.yml`) gösterilmeli.
- Pipeline sadece bilgilendirme mi yapıyor, yoksa PR/Merge'i GERÇEKTEN ENGELLİYOR mu (branch protection)?
- Tetikleme koşulu net olmalı (her push'ta, PR'da).

## 5. YASAKLI MUTLAK İFADELER & ZORUNLU KAPSAM BEYANI
- **YASAKLI**: "kusursuz", "mükemmel", "kurşun geçirmez", "%100 güvenli", "hiçbir açık yok", "tamamen çözüldü", "taş gibi", "sıfır hata"
- **ZORUNLU KAPSAM BEYANI**: "Şu ana kadar test edilen [X, Y, Z] senaryoları için açık bulunmadı. Test edilmeyen alanlar: [...]"

## 6. Geri Dönüş ve İzleme (Rollback & Monitoring)
- Değişiklik geri alınabilir mi (rollback planı)?
- Supabase point-in-time recovery veya veritabanı yedeği aktif mi?
- Anormal işlem uyarısı / loglama mekanizması mevcut mu?

## 7. Kalıcı Regresyon Koruması
- Düzeltilen her güvenlik açığı, `scripts/business_logic_audit.py` veya otomatik test paketine KALICI olarak eklenmeli (tek seferlik elle test kabul edilmez).
