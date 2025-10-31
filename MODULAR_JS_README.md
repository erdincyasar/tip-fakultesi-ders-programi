# JavaScript Modüler Yapı

Bu proje artık tam modüler bir JavaScript yapısına dönüştürüldü.

## 📁 Dosya Yapısı

```
js/
├── config.js      # Yapılandırma ve global değişkenler
├── utils.js       # Yardımcı fonksiyonlar
├── calendar.js    # Takvim yönetimi
├── modal.js       # Modal işlemleri
├── search.js      # Arama işlevselliği
├── pwa.js         # PWA özellikleri (Service Worker, Fullscreen)
└── app.js         # Ana uygulama başlatıcısı
```

## 🔧 Özellikler

- **Modüler Yapı**: Her özellik ayrı dosyada
- **Global Namespace**: Tüm fonksiyonlar `window` objesine export edildi
- **Bağımsızlık**: Her modül kendi sorumluluğunda
- **Kolay Bakım**: Kod değişiklikleri daha kolay

## 🚀 Kullanım

HTML dosyasında script referansları şu sırayla yükleniyor:

1. `config.js` - İlk olarak yapılandırma
2. `utils.js` - Yardımcı fonksiyonlar
3. `calendar.js` - Takvim işlevselliği
4. `modal.js` - Modal yönetimi
5. `search.js` - Arama özellikleri
6. `pwa.js` - PWA özellikleri
7. `app.js` - Uygulama başlatıcısı

## 📝 Notlar

- Tüm fonksiyonlar geriye uyumlu olarak `window` objesine export edildi
- Google Apps Script entegrasyonu korundu
- PWA özellikleri ayrı modülde toplandı
- Kod daha okunabilir ve yönetilebilir hale geldi