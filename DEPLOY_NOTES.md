# Google Apps Script'e Deploy Talimatları

## Yapılan Son Değişiklikler

### 1. SlotHeight Düzeltmesi
- **Web/Desktop**: 35px (eski haline döndü)
- **Mobil**: 70px (büyük kalıyor)

### 2. Header Butonları Düzeltmesi
- Butonlara `header-btn` class'ı eklendi
- Mobilde sabit boyut: 90px x 90px
- `flex-shrink: 0` ile büyümesi engellendi
- İkonlar merkezlendi (margin-right kaldırıldı)

### 3. Arama Kutusu Düzeltmesi
- Arama kutusu artık overlay olarak açılıyor
- Butonların yerini almıyor
- Mobilde tam genişlik
- Position: fixed ile üstte kalıyor

## Google Apps Script'e Yükleme

### Dosyalar ve Sıraları:

1. **code.gs** (Backend kodu)
   - Mevcut dosya değişmedi
   - Yeniden yüklemeye gerek yok

2. **Index.html** (Ana sayfa)
   - ✅ Güncellenmiş 
   - Header butonlarına `header-btn` class'ı eklendi
   - Arama container'ı yeniden yapılandırıldı

3. **JavaScript.Html** (JavaScript kodu)
   - ✅ Güncellenmiş
   - SlotHeight: mobil 70px, desktop 35px
   - Event fontları büyütüldü (mobil)

4. **Style.html** (CSS)
   - ✅ Güncellenmiş
   - Desktop slot height: 35px
   - Mobil slot height: 70px
   - Header butonları sabit boyut
   - Arama overlay stilleri eklendi

## Deploy Adımları

1. Google Apps Script projesini aç
2. Aşağıdaki dosyaları sırayla güncelle:
   - `Index.html` - Tüm içeriği değiştir
   - `JavaScript.Html` - Tüm içeriği değiştir
   - `Style.html` - Tüm içeriği değiştir
3. **Önemli**: "Deploy" > "New deployment" yaparak YENİ bir versiyon oluştur
4. Veya mevcut deployment'ı güncelle: "Deploy" > "Manage deployments" > "Edit" > "Version: New version"

## Test Checklist

- [ ] Desktop'ta slot height 35px
- [ ] Mobilde slot height 70px
- [ ] Mobilde event fontları büyük (1.2rem, 1.3rem, 1.4rem)
- [ ] Header butonları mobilde sabit boyutta kalıyor
- [ ] Arama butonuna basınca overlay açılıyor
- [ ] Butonlar büyümüyor/küçülmüyor
- [ ] Modal mobilde tam ekran
- [ ] Dönem/program seçince placeholder kayboluyor

## Sorun Giderme

### "Değişiklikler görünmüyor"
- Tarayıcı cache'ini temizle (Ctrl+Shift+Delete)
- Incognito/Private modda test et
- Apps Script'te yeni deployment yap (eski version çalışıyor olabilir)

### "Butonlar hala garip"
- Mobil cihazda F12 > Console'da hata var mı kontrol et
- `header-btn` class'ının eklendiğinden emin ol
- CSS'te `!important` kullanıldığından emin ol

### "Modal açılmıyor"
- Console'da JavaScript hatası var mı kontrol et
- `event-modal` class'ının modal div'ine eklendiğinden emin ol
- Bootstrap JS yüklenmiş mi kontrol et
