// Version: 4
// Updated: 2025-10-31T13:28:37Z

// ==========================================
// APP - Ana Uygulama Başlatıcısı
// ==========================================

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', function() {
  initializeModal();
  initializeCalendar();
  renderSheetButtons();
  updateDateTime();

  // Her saniye tarih ve saati güncelle
  setInterval(updateDateTime, CONFIG.timers.dateTimeUpdate);

  // Otomatik güncelleme devre dışı (manuel güncelle butonu var)
  // setInterval(loadCalendarData, CONFIG.timers.autoRefresh);

  // Event listener'ları ekle
  setupEventListeners();

  // Mobil cihazlarda otomatik fullscreen modu
  initializeFullscreenMode();

  // Mobil cihazlarda uygulama banner'ını göster
  setTimeout(showMobileInstallBanner, 2000);
});

// Event listener'ları ayarla
function setupEventListeners() {
  // Sheet dropdown (mobil)
  const sheetDropdown = getElement('sheetDropdown');
  if (sheetDropdown) {
    sheetDropdown.addEventListener('change', function(e) {
      switchSheet(e.target.value);
    });
  }

  // ESC tuşu ile arama overlay'ini kapat
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const overlay = getElement('searchOverlay');
      if (overlay && !overlay.classList.contains('d-none')) {
        hideSearch();
      }
    }
  });
}

// Export app functions
window.setupEventListeners = setupEventListeners;