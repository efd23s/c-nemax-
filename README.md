# 🎬 CineStream+ Pro | Gelişmiş Dizi & Film İzleme Platformu

<div align="center">
  <img src="logo.png" alt="CineStream Pro Logo" width="380" />
  <p><strong>Ultra HD Sinema ve Dizi Portalı • Çoklu Kaynak • İnteraktif Profil & Google Giriş</strong></p>
</div>

---

## 🌟 Proje Hakkında

**CineStream+ Pro**, modern kullanıcı deneyimi sunan, bağımsız sayfalarla çalışan, sinema modu, çoklu kaynak değiştirici (Türkçe Dublaj & Altyazı), favori listesi, izleme geçmişi ve Google tabanlı kimlik doğrulama sistemi içeren gelişmiş bir web platformudur.

## 🚀 Öne Çıkan Özellikler

* **👑 3D Sinematik Tasarım:** Özel metallic ve neon kırmızı CineStream Pro logosu, glassmorphism cam efektleri ve koyu tema.
* **📱 Dikey Afiş Deneyimi:** Ana sayfa ve diziler sayfasında temiz 2:3 dikey afişler; konusu ve detayları üzerine gelindiğinde (hover) akıcı bir şekilde açılır.
* **🍿 Ayrı İzleme Sayfası (`watch.html`):** Her dizi ve film için bağımsız sinema sayfası:
  * 16:9 geniş ekran oynatıcı
  * Çoklu kaynak ve dublaj/altyazı geçişi
  * Sezon ve bölüm çekmecesi
  * Hızlı bölüm atlama (Önceki / Sonraki)
  * **💡 Işıkları Kapat (Sinema Modu)**
  * İnteraktif izleyici yorumları ve beğeni sistemi
* **🔑 Google & GitHub Giriş Sistemi:** Gerçekçi Google OAuth hesap seçici arayüzü ve oturum kalıcılığı (`localStorage`).
* **👤 Profil Yönetimi (`profile.html`):** Hazır avatar galerisi, özel resim URL'si ekleme, isim/biyografi düzenleme ve izleme istatistikleri.
* **🏷️ Gelişmiş Filtreleme (`categories.html`):** Türlere (Aksiyon, Korku, Dram, Komedi, Salgın vb.), IMDb puanına ve formata göre filtreleme.
* **📑 Kişisel Kütüphane (`watchlist.html`):** Favorilere ekleme ve kaldığınız bölümü hatırlayan izleme geçmişi.

---

## 📺 Dahil Edilen İçerikler

### Diziler
1. **Hellbound** (1. Sezon 6 Bölüm & 2. Sezon 6 Bölüm - Dzen & FastStream)
2. **Small Prophets** (1. Sezon 6 Bölüm - Türkçe Dublaj & Türkçe Altyazı)
3. **The East Palace** (1. Sezon 8 Bölüm - OK.ru)
4. **D.P.** (1. Sezon 6 Bölüm - MolyStream & Dizibox/OK.ru)

### Filmler
1. **Badland Hunters (2024) / Çöl Avcıları** (Türkçe Dublaj, Türkçe Altyazı, Fragman)
2. **Apocalipsis Z: Nuevo mundo (2026) / Kıyamet Z: Yeni Dünya** (Türkçe Dublaj, Türkçe Altyazı, Fragman)

---

## 💻 Kurulum ve Çalıştırma

Projeyi yerel bilgisayarınızda çalıştırmak için:

### 1. Yöntem: Node.js ile (Önerilen)
```bash
node server.js
```
Ardından tarayıcınızda açın:
```
http://localhost:5000
```

### 2. Yöntem: Python ile
```bash
python server.py
```

### 3. Yöntem: Windows Çift Tıkla Başlatıcı
`start.bat` dosyasına çift tıklayarak tek adımda çalıştırabilirsiniz.

---

## 📁 Dosya Yapısı

```
stream-verse/
├── index.html        # Ana Sayfa (Hero Banner, Dikey Afişler, Trendler)
├── series.html       # Diziler Sayfası (Dikey Afişler, Sezonlar)
├── movies.html       # Filmler Sayfası (Vizyondaki Yapımlar)
├── categories.html   # Kategorilere Göre Keşif ve Filtreleme
├── watchlist.html    # Favorilerim ve İzleme Geçmişim
├── watch.html        # Bağımsız Sinema İzleme Sayfası
├── profile.html      # Profil ve Hesap Ayarları
├── data.js           # Dizi, Film, Bölüm ve Kaynak Veritabanı
├── auth.js           # Google, GitHub & E-posta Kimlik Doğrulama
├── navbar.js         # Ortak Başlık, Canlı Arama ve Menü
├── home.js           # Ana Sayfa Kontrolcüsü
├── watch.js          # Oynatıcı ve Bölüm Kontrolcüsü
├── style.css         # Modern Glassmorphism & Sinema Teması
├── logo.png          # Özel 3D CineStream Pro Logosu
├── server.js         # Node.js Sunucu Dosyası
├── server.py         # Python 3 Sunucu Dosyası
└── start.bat         # Windows Hızlı Başlatıcı
```

---

## 📄 Lisans
Bu proje eğitim ve portfolyo amaçlı geliştirilmiştir. Tüm hakları saklıdır © 2026 CineStream+ Pro.
