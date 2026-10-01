# Turkish Tier List — Proje Hafızası ve Sistem Kuralları

> Bu dosya, projede çalışan herhangi bir yapay zeka modeline projenin geçmişini, otonom sistem kurallarını ve en son gelişmeleri otomatik aktarmak için sürekli güncellenir.

---

## 1. Proje Kimliği ve Teknolojiler
* **Kurucu & Ürün Sahibi:** Ahmet Emre Yılmaz (07/12/2003, Adana/Yüreğir)
* **Proje:** Turkish Tier List (Türkiye Pop-Kültür, Dizi, Film, Tarih ve Karakter Tier Listesi & Kart Oyunu)
* **Teknoloji Yığını:** Next.js 14 (App Router), React 18, Tailwind CSS, Supabase, Playwright E2E, ChromaDB Vector Memory.
* **Klasör Konumu:** `C:\Users\EMRE\Desktop\turkish-tier-list-TAM`
* **Canlı Dal (Production):** GitHub `main` -> Railway (`https://turkish-tier-list-web-production.up.railway.app/`)

---

## 2. Kullanıcının Kesin Kuralları ve Çalışma İlkeleri
1. **"Sana Güveniyorum, Otomatik Halledip Test Et":**
   - Kullanıcıya gereksiz sorular sorma. İhtiyaçları analiz et, kodu doğrudan yaz, `python scripts/dual_brain_arbiter.py` ve `npm run build` ile doğrula, GitHub'a push et.
2. **Sıfır Sahte / Bot Veri Kuralı:**
   - Veritabanına veya siteye asla sahte kullanıcı, bot klan, uydurma oy eklenmez.
3. **Localhost Geliştirme Otomasyonu:**
   - Dev sunucusu `npm run dev:auto` ile çalışır. Dosya değişince otomatik başlar, 5 dk işlem yapılmazsa SSD alanını korumak için otomatik kapanır.
5. **5 Temel Mühendislik ve Disiplin Şablonu (Claude Discipline Checklist):**
   - **A. "Ben" Değil "Sistem" Güvenilir Olacak**: Her yeni fonksiyonda Idempotency, RBAC Yetki, Negatif Bakiye ve RLS denetimi zorunludur.
   - **B. Küçük Adım, Hemen Doğrulama (Atomic TDD)**: Tek seferde devasa kod yazmak yerine küçük parçayı yaz ➔ hemen `dual_brain_arbiter.py` & Playwright ile doğrula ➔ ekle.
   - **C. Kritik Kod Okuma & Doğrulama**: Para, yetki ve silme işlemlerinde kod mantığı tam anlaşılmadan onay verilmez.
   - **D. Kategori Düzeyinde Çözüm**: Tekil bug düzeltmek yerine o hata kategorisini yok et (Örn: Tüm bakiye/para güncellemeleri tek bir merkezi `walletTransactionManager.js` süzgecinden geçer).
   - **E. 5 Dakikalık Geri Dönülebilirlik (Atomic Rollback)**: Her değişiklik atomik commit'lerle saklanır, hata anında 5 dakikada eski stabil sürüme dönülebilir.
6. **Ajan Güvenliği:**
   - Kodlarda asla `git stash` kullanılmaz.

---

## 3. Otonom Ajan Sistem Altyapısı (Systemic Engine Stack)
* **1. Dual-Brain Pre-Commit Arbiter (`scripts/dual_brain_arbiter.py`):**
  - Kod yazıldıktan hemen sonra 'use client', stateful regex (/g), ReDoS ve güvenlik hatalarını bağımsız hakem gibi denetler.
* **2. Autonomous Self-Healing Engine (`scripts/self_healing_engine.py`):**
  - `npm run build` veya testlerde hata çıkarsa otomatik olarak hatayı analiz eder, kodu düzeltir ve yeşil ışık yakana kadar yeniden dener.
* **3. Semantic Pre-Hook Memory (`scripts/semantic_memory_hook.py` & `scripts/vector_memory_indexer.py`):**
  - `~/.gemini/antigravity/vector_memory_db` dizinindeki ChromaDB vektör deposuna tüm mimari kararlar ve çözümler indekslenmiştir.
* **4. Playwright Visual & E2E Testing (`playwright.config.js` & `tests/e2e-visual.spec.js`):**
  - Masaüstü (Chrome) ve Mobil (iPhone 12) çözünürlüklerinde arayüz ve dark-mode doğrulaması yapar.

---

## 4. Tamamlanan ve Çalışır Durumdaki Modüller
* **Gacha Engine & Paketler (`app/lib/gachaEngine.js`):** Bronze, Silver ve yeni Platin paketleri active.
* **Dark Mode & Header/Footer:** `DarkModeToggle.jsx`, `/legal.html` DMCA sayfası.
* **Admin Paneli (`app/admin/page.js`):** Basit token-tabanlı (`admin-secret`) kontrol.
* **Multi-Stage Docker Altyapısı (`Dockerfile`):** Railway üzerinde 30-45 saniyelik önbellekli hızlı derleme.
