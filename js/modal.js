// ==========================================
// MODAL - Modal Yönetimi
// ==========================================

// Modal'ı başlat
function initializeModal() {
  console.log('DOM loaded, initializing modal...');

  // Bootstrap modal instance
  const modalElement = getElement('eventModal');
  if (modalElement) {
    eventModal = new bootstrap.Modal(modalElement);
    console.log('Modal initialized successfully');
  } else {
    console.error('Modal element not found!');
  }
}

// Event detaylarını göster
function showEventDetails(event) {
  console.log('Event details:', event);

  // Event verilerini kontrol et
  const startTime = formatTime(event.start);
  const endTime = formatTime(event.end);
  const eventDate = formatDate(event.start);

  console.log('Event times:', { startTime, endTime, eventDate });

  // Modal içeriğini doldur
  getElement('modalTitle').textContent = event.title || 'Ders';
  getElement('modalTime').textContent = `${startTime} - ${endTime}`;
  getElement('modalDate').textContent = eventDate;
  getElement('modalHoca').textContent = event.extendedProps?.hoca || 'Belirtilmemiş';
  getElement('modalBirim').textContent = event.extendedProps?.birimi || 'Belirtilmemiş';
  getElement('modalKurul').textContent = event.extendedProps?.kurulu || 'Belirtilmemiş';
  getElement('modalDerslik').textContent = event.extendedProps?.derslik || 'Belirtilmemiş';

  currentEvent = event;

  // Modal'ı göster
  try {
    eventModal.show();
    console.log('Modal shown successfully');
  } catch (error) {
    console.error('Modal show error:', error);
  }
}

// Test için modal
function testModal() {
  const testEvent = {
    title: 'Test Dersi',
    start: new Date(),
    end: new Date(Date.now() + 2 * 60 * 60 * 1000),
    extendedProps: {
      hoca: 'Test Hoca',
      birimi: 'Test Birim',
      kurulu: 'Test Kurul',
      derslik: 'Test Derslik'
    }
  };

  showEventDetails(testEvent);
}

// Tek event'i takvime ekle
function addSingleEventToCalendar() {
  if (!currentEvent) return;

  if (confirm('Bu dersi Google Takviminize eklemek istiyor musunuz?')) {
    showStatus('success', `"${currentEvent.title}" takvime eklendi`);
    eventModal.hide();
  }
}

// Tüm event'leri takvime ekle
function addToCalendar() {
  if (!confirm(`${eventCount} dersi Google Takviminize eklemek istiyor musunuz?`)) return;

  showStatus('loading', 'Takvime ekleniyor...');

  google.script.run
    .withSuccessHandler(function(response) {
      if (response.success) {
        showStatus('success', `${response.data.length} ders işlendi`);
      } else {
        showStatus('error', response.error);
      }
    })
    .withFailureHandler(handleError)
    .getCalendarData(currentSheetKey);
}

// Debug bilgilerini göster
function showDebugInfo() {
  google.script.run
    .withSuccessHandler(function(result) {
      if (result.success) {
        const debugInfo = [
          `Sayfa: ${result.sheetName}`,
          `Toplam Satır: ${result.totalRows}`,
          `Etkinlikler: ${eventCount}`,
          `Sheet: ${result.url}`,
          '',
          'Son Güncelleme:',
          ...result.firstFewRows.slice(0, 2).map((row, i) =>
            `Satır ${i}: ${row.map(cell => cell || '(boş)').join(' | ')}`
          )
        ].join('\n');

        alert(debugInfo);
      } else {
        alert('Hata: ' + result.error);
      }
    })
    .withFailureHandler(handleError)
    .debugGetSheetInfo(currentSheetKey);
}

// Export modal functions
window.initializeModal = initializeModal;
window.showEventDetails = showEventDetails;
window.testModal = testModal;
window.addSingleEventToCalendar = addSingleEventToCalendar;
window.addToCalendar = addToCalendar;
window.showDebugInfo = showDebugInfo;