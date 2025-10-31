# 📚 Uludağ Üniversitesi Tıp Fakültesi Ders Programı

Modern, responsive ve PWA özellikli ders programı uygulaması.

## ✨ Özellikler

- 📱 **Mobil Uyumlu Tasarım** - Tüm cihazlarda mükemmel görünüm
- 🔍 **Akıllı Arama** - Ders, öğretim üyesi ve mekan bazlı arama
- 📅 **Etkileşimli Takvim** - FullCalendar ile modern takvim deneyimi
- � **Akıllı Bildirimler** - Sheet değişikliklerinde anında bildirim
- 📲 **PWA Desteği** - Ana ekrana ekleme ve offline kullanım
- 🎨 **Modern UI** - Bootstrap 5 ve özel tasarım
- 🌙 **Tam Ekran Modu** - Mobil cihazlarda native app deneyimi

## � Kurulum

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/kullanici-adi/tip-fakultesi-ders-programi.git
cd tip-fakultesi-ders-programi
```

### 2. Dosyaları Düzenleyin
- `Index.html` - Ana sayfa
- `JavaScript.html` - Uygulama mantığı
- `Style.html` - Stil dosyası
- `manifest.json` - PWA manifest
- `sw.js` - Service Worker

### 3. Web Sunucusunda Yayınlayın
Herhangi bir statik web hosting servisi kullanabilirsiniz:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting

## 📁 Proje Yapısı

```
├── Index.html          # Ana HTML dosyası
├── JavaScript.html     # JavaScript kodu
├── Style.html          # CSS stilleri
├── manifest.json       # PWA manifest
├── sw.js              # Service Worker
├── .gitignore         # Git ignore kuralları
└── README.md          # Bu dosya
```

## 🔧 Yapılandırma

### Google Sheets Bağlantısı
Uygulama Google Sheets API kullanarak veri çeker. Sheet URL'lerinizi `JavaScript.html` dosyasındaki yapılandırma bölümünden güncelleyin.

### Dönem Ayarları
`CONFIG.sheetConfig` bölümünden dönem ve sheet yapılandırmasını düzenleyin.

## 🌐 Kullanım

1. **Web Tarayıcısında Açın** - Modern bir tarayıcıda uygulamayı açın
2. **Ana Ekrana Ekleyin** - "Ana ekrana ekle" seçeneği ile app olarak kullanın
3. **Dönem Seçin** - Üst kısımdaki dönem seçicilerinden istediğinizi seçin
4. **Programı Görüntüleyin** - Takvimde derslerinizi görün
5. **Arama Yapın** - Arama kutusu ile ders veya öğretim üyesi bulun

## 📱 PWA Özellikleri

- **Offline Çalışma** - İnternet bağlantısı olmadan temel özellikler
- **Tam Ekran** - Mobil cihazlarda native app deneyimi
- **Hızlı Yükleme** - Service Worker ile önbellekleme
- **Push Bildirimler** - Sheet değişikliklerinde bildirim

## 🛠️ Geliştirme

### Gereksinimler
- Modern web tarayıcısı
- İnternet bağlantısı (ilk yükleme için)

### Dosya Düzenleme
- HTML dosyalarını doğrudan düzenleyin
- Değişiklikleri test edin
- Git ile versiyon kontrolü yapın

## 📄 Lisans

Bu proje açık kaynak kodludur ve MIT lisansı altında yayınlanmıştır.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📞 İletişim

Sorularınız için issue açabilir veya [email] adresinden iletişime geçebilirsiniz.

---

⭐ **Bu proje faydalı olduysa yıldız vermeyi unutmayın!**

### Mobil Optimizasyonları
- Viewport meta tag ile doğru mobil görüntüleme
- Mobil cihazlarda büyütülmüş header ve ikonlar
- PWA yükleme prompt'u (Android/Chrome)
- Tam ekran modal'lar
- Dokunmaya uygun büyük butonlar

## Geliştirme

### Gereksinimler
- Google Apps Script hesabı
- Google Sheets erişimi
- Modern web tarayıcısı

### Dosya Yapısı
```
├── code.gs          # Google Apps Script backend kodu
├── Index.html       # Ana HTML şablonu
├── Style.html       # CSS stilleri
├── JavaScript.html  # Frontend JavaScript kodu
└── README.md        # Bu dosya
```

### Modüler JavaScript Yapısı

JavaScript kodu `JavaScript.Html` dosyasında ayrı `<script>` bölümlerine ayrılmıştır:

1. **CONFIG** - Yapılandırma ayarları ve sabitler
2. **UTILS** - Yardımcı fonksiyonlar (tarih formatlama, DOM işlemleri)
3. **CALENDAR** - Takvim yönetimi ve sheet işlemleri
4. **MODAL** - Modal gösterimi ve event detayları
5. **SEARCH** - Arama işlevselliği
6. **APP** - Ana uygulama başlatıcısı

## Güvenlik

- Sadece `@uludag.edu.tr` uzantılı hesaplar erişebilir
- HTTPS protokolü zorunludur
- CORS politikaları uygulanmıştır

## Destek

Herhangi bir sorun yaşarsanız, lütfen bilgi işlem birimine başvurun.

---

© 2025 Uludağ Üniversitesi Tıp Fakültesi

## Faydalar

- **Daha Kolay Bakım**: Kod bölümlere ayrıldığı için hatalar daha kolay bulunur
- **Genişletilebilirlik**: Yeni özellikler ilgili bölüme eklenebilir
- **Takım Çalışması**: Farklı geliştiriciler farklı bölümler üzerinde çalışabilir
- **Google Apps Script Uyumluluğu**: Doğrudan Apps Script ortamında çalışır

## Test

Uygulamayı test etmek için:
1. Apps Script web uygulamasını yayınlayın
2. Tarayıcıda açın
3. Takvim verilerinin yüklendiğini kontrol edin
4. Arama ve modal özelliklerini test edin