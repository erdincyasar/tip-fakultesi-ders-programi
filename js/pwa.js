// Version: 6
// Updated: 2025-10-31T20:08:01Z

// ==========================================
// PWA - Progressive Web App Özellikleri
// ==========================================

// Service Worker Registration & PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    // Standalone web app için sw.js dosyasını kullan
    navigator.serviceWorker.register('https://www.uludag.edu.tr/dosyalar/tip/asama1/jssw.js')
      .then(function(registration) {
        console.log('SW registered: ', registration);

        // PWA güncellemelerini kontrol et
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Yeni versiyon mevcut
                showUpdateBanner();
              }
            });
          }
        });
      })
      .catch(function(registrationError) {
        console.log('SW registration failed: ', registrationError);
      });
  });
} else {
  console.log('Service Worker not supported');
}

// PWA güncelleme banner'ı
function showUpdateBanner() {
  const banner = document.createElement('div');
  banner.id = 'updateBanner';
  banner.className = 'position-fixed top-0 start-0 end-0 bg-info text-white p-3';
  banner.style.zIndex = '10000';
  banner.innerHTML = `
    <div class="d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center">
        <i class="bi bi-arrow-up-circle fs-3 me-3"></i>
        <div>
          <div class="fw-bold">Güncelleme Mevcut</div>
          <div class="small opacity-75">Yeni özellikler için uygulamayı yenileyin</div>
        </div>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-light btn-sm" onclick="updatePWA()">
          <i class="bi bi-arrow-clockwise me-1"></i>Yenile
        </button>
        <button class="btn btn-outline-light btn-sm" onclick="dismissUpdateBanner()">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);
}

// PWA güncelle
function updatePWA() {
  window.location.reload();
}

// Update banner'ını kapat
function dismissUpdateBanner() {
  const banner = document.getElementById('updateBanner');
  if (banner) {
    banner.remove();
  }
}

// PWA yükleme durumunu kontrol et
function checkPWAStatus() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = window.navigator.standalone === true;

  if (isStandalone || isIOSStandalone) {
    console.log('Running in PWA mode');
    document.body.classList.add('pwa-mode');

    // PWA modunda ek özellikler
    setTimeout(() => {
      requestFullscreenMode();
    }, 1000);
  } else {
    console.log('Running in browser mode');
  }
}

// Sayfa yüklendiğinde PWA durumunu kontrol et
document.addEventListener('DOMContentLoaded', function() {
  checkPWAStatus();
});

// ==========================================
// PWA FULLSCREEN MODE - Mobil Tam Ekran
// ==========================================

// Fullscreen kontrolü
function initializeFullscreenMode() {
  // Sadece mobil cihazlarda çalıştır
  if (!isMobile()) return;

  // PWA modunda mıyız kontrol et
  const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true ||
               document.referrer.includes('android-app://');

  if (isPWA) {
    // PWA modunda - otomatik fullscreen
    setTimeout(() => {
      requestFullscreenMode();
    }, 1000);
  } else {
    // Normal tarayıcı - fullscreen banner'ı göster
    showFullscreenBanner();
  }
}

// Fullscreen modu iste
async function requestFullscreenMode() {
  try {
    const elem = document.documentElement;

    if (elem.requestFullscreen) {
      await elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { // Safari
      await elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE11
      await elem.msRequestFullscreen();
    }

    console.log('Fullscreen mode activated');
    showStatus('success', 'Tam ekran modu aktif! 📱');

    // Fullscreen'den çıkıldığında tekrar iste
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

  } catch (error) {
    console.log('Fullscreen not supported or denied:', error);
    // Fullscreen desteklenmiyorsa CSS ile simüle et
    enablePseudoFullscreen();
  }
}

// Fullscreen değişikliklerini handle et
function handleFullscreenChange() {
  const isFullscreen = document.fullscreenElement ||
                      document.webkitFullscreenElement ||
                      document.msFullscreenElement;

  if (!isFullscreen && isMobile()) {
    // Fullscreen'den çıkıldı, tekrar iste
    setTimeout(() => {
      requestFullscreenMode();
    }, 2000);
  }
}

// CSS ile pseudo fullscreen modu
function enablePseudoFullscreen() {
  document.body.classList.add('pseudo-fullscreen');

  // Mobil tarayıcı UI'larını gizle
  const style = document.createElement('style');
  style.textContent = `
    .pseudo-fullscreen {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      overflow: hidden !important;
      background: #000 !important;
    }
    .pseudo-fullscreen * {
      -webkit-touch-callout: none !important;
      -webkit-user-select: none !important;
      -khtml-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
    }
  `;
  document.head.appendChild(style);

  showStatus('success', 'Mobil uyumlu mod aktif! 📱');
}

// Fullscreen banner'ı göster
function showFullscreenBanner() {
  // Eğer daha önce kapatıldıysa gösterme
  if (localStorage.getItem('fullscreenBannerDismissed')) {
    return;
  }

  const banner = document.createElement('div');
  banner.id = 'fullscreenBanner';
  banner.className = 'position-fixed bottom-0 start-0 end-0 bg-dark text-white p-3';
  banner.style.zIndex = '9999';
  banner.innerHTML = `
    <div class="d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center">
        <i class="bi bi-fullscreen fs-3 me-3"></i>
        <div>
          <div class="fw-bold">Tam Ekran Modu</div>
          <div class="small opacity-75">Daha iyi deneyim için tam ekran kullanın</div>
        </div>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-light btn-sm" onclick="requestFullscreenMode()">
          <i class="bi bi-fullscreen me-1"></i>Aktif Et
        </button>
        <button class="btn btn-outline-light btn-sm" onclick="dismissFullscreenBanner()">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  // 10 saniye sonra otomatik gizle
  setTimeout(() => {
    if (banner && !banner.classList.contains('d-none')) {
      banner.style.transform = 'translateY(100%)';
      setTimeout(() => banner.remove(), 300);
    }
  }, 10000);
}

// Fullscreen banner'ını kapat
function dismissFullscreenBanner() {
  const banner = document.getElementById('fullscreenBanner');
  if (banner) {
    banner.style.transform = 'translateY(100%)';
    setTimeout(() => banner.remove(), 300);
    localStorage.setItem('fullscreenBannerDismissed', 'true');
  }
}

// PWA install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;

  // Show install banner
  showInstallBanner();
});

// Install banner'ı göster
function showInstallBanner() {
  if (localStorage.getItem('installBannerDismissed')) {
    return;
  }

  const banner = document.createElement('div');
  banner.id = 'installBanner';
  banner.className = 'position-fixed bottom-0 start-0 end-0 bg-primary text-white p-3';
  banner.style.zIndex = '9998';
  banner.innerHTML = `
    <div class="d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center">
        <i class="bi bi-download fs-3 me-3"></i>
        <div>
          <div class="fw-bold">Uygulama Olarak Yükle</div>
          <div class="small opacity-75">Ana ekrana ekleyerek hızlı erişim sağlayın</div>
        </div>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-light btn-sm" onclick="installPWA()">
          <i class="bi bi-plus-circle me-1"></i>Yükle
        </button>
        <button class="btn btn-outline-light btn-sm" onclick="dismissInstallBanner()">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);
}

// PWA yükle
async function installPWA() {
  if (!deferredPrompt) {
    showStatus('error', 'Yükleme şu anda mümkün değil');
    return;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === 'accepted') {
    showStatus('success', 'Uygulama yükleniyor... 📱');
    dismissInstallBanner();
  }

  deferredPrompt = null;
}

// Install banner'ını kapat
function dismissInstallBanner() {
  const banner = document.getElementById('installBanner');
  if (banner) {
    banner.remove();
    localStorage.setItem('installBannerDismissed', 'true');
  }
}

// Mobil cihazlarda otomatik "Ana Ekrana Ekle" banner'ı
function showMobileInstallBanner() {
  // Eğer daha önce kapatıldıysa gösterme
  if (localStorage.getItem('mobileInstallBannerDismissed')) {
    return;
  }

  // Sadece mobil cihazlarda göster
  if (!isMobile()) {
    return;
  }

  const banner = document.createElement('div');
  banner.id = 'mobileInstallBanner';
  banner.className = 'position-fixed bottom-0 start-0 end-0 bg-primary text-white p-3';
  banner.style.zIndex = '9999';
  banner.innerHTML = `
    <div class="d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center">
        <i class="bi bi-phone fs-3 me-3"></i>
        <div>
          <div class="fw-bold">Tam Ekran Uygulama Modu! 📱</div>
          <div class="small opacity-75">Ana ekrana ekleyin ve tam ekran deneyimi yaşayın</div>
        </div>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-light btn-sm" onclick="showInstallInstructions()">
          <i class="bi bi-info-circle me-1"></i>Nasıl?
        </button>
        <button class="btn btn-outline-light btn-sm" onclick="dismissMobileBanner()">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  // 8 saniye sonra otomatik gizle
  setTimeout(() => {
    if (banner && !banner.classList.contains('d-none')) {
      banner.style.transform = 'translateY(100%)';
      setTimeout(() => banner.remove(), 300);
    }
  }, 8000);
}

function showInstallInstructions() {
  const instructions = `🎯 TAM EKRAN UYGULAMA İÇİN:

1. 📱 Ana ekrana ekleyin:
   • Chrome/Safari: "Ana Ekrana Ekle" veya "Share > Ana Ekrana Ekle"
   • Uygulamayı açın

2. 🔄 Tam Ekran modu aktif olur:
   • Otomatik olarak fullscreen açılır
   • Tarayıcı çubukları gizlenir
   • Native app gibi çalışır

3. ⚡ Ek özellikler:
   • Hızlı başlatma
   • Offline çalışabilme
   • Push bildirim desteği

📋 TARAYICI ADIMLARI:

CHROME (Android):
• 3 nokta menü > "Ana Ekrana Ekle"
• "Ekle" butonuna basın

SAFARI (iOS):
• Share butonu > "Ana Ekrana Ekle"
• "Ekle" butonuna basın

🔧 SORUN GİDERME:
• Eğer fullscreen çalışmazsa, uygulamayı yeniden açın
• Tarayıcı ayarlarından "Pop-up" bloklarını kapatın
• Sayfa yenileyin ve tekrar deneyin

✨ Sonuç: Tam ekran, native app deneyimi!`;
  alert(instructions);
}

function dismissMobileBanner() {
  const banner = document.getElementById('mobileInstallBanner');
  if (banner) {
    banner.style.transform = 'translateY(100%)';
    setTimeout(() => banner.remove(), 300);
    localStorage.setItem('mobileInstallBannerDismissed', 'true');
  }
}

// Export PWA functions
window.showUpdateBanner = showUpdateBanner;
window.updatePWA = updatePWA;
window.dismissUpdateBanner = dismissUpdateBanner;
window.checkPWAStatus = checkPWAStatus;
window.initializeFullscreenMode = initializeFullscreenMode;
window.requestFullscreenMode = requestFullscreenMode;
window.handleFullscreenChange = handleFullscreenChange;
window.enablePseudoFullscreen = enablePseudoFullscreen;
window.showFullscreenBanner = showFullscreenBanner;
window.dismissFullscreenBanner = dismissFullscreenBanner;
window.showInstallBanner = showInstallBanner;
window.installPWA = installPWA;
window.dismissInstallBanner = dismissInstallBanner;
window.showMobileInstallBanner = showMobileInstallBanner;
window.showInstallInstructions = showInstallInstructions;
window.dismissMobileBanner = dismissMobileBanner;