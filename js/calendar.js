// Version: 4
// Updated: 2025-10-31T13:28:37Z

// ==========================================
// CALENDAR - Takvim Yönetimi
// ==========================================

// Mevcut availableSheets'i döneme göre getir
function getAvailableSheets() {
  return CONFIG.sheetConfig[currentSemester] || [];
}

// Sheet butonlarını oluştur
function renderSheetButtons() {
  const availableSheets = getAvailableSheets();

  // Dönem butonlarını güncelle (aktif olanı işaretle)
  document.querySelectorAll('.btn-semester').forEach(btn => {
    const semester = btn.getAttribute('data-semester');
    if (semester === currentSemester) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Desktop tabs
  const tabsContainer = getElement('sheetTabs');
  // Mobile dropdown
  const dropdownContainer = getElement('sheetDropdown');

  if (!tabsContainer || !dropdownContainer) {
    console.error('Sheet selector containers not found!');
    return;
  }

  // Clear containers
  tabsContainer.innerHTML = '';
  dropdownContainer.innerHTML = '';

  // Create tabs and dropdown options
  availableSheets.forEach((sheet, index) => {
    const isActive = currentSheetKey === sheet.key;

    // Desktop Tab
    const tabItem = createElement('li', 'nav-item');
    tabItem.innerHTML = `
      <button class="nav-link ${isActive ? 'active' : ''}"
              data-sheet="${sheet.key}"
              type="button">
        <i class="bi ${sheet.icon} me-1"></i>
        ${sheet.name}
      </button>
    `;
    tabItem.onclick = () => switchSheet(sheet.key);
    tabsContainer.appendChild(tabItem);

    // Mobile Dropdown Option
    const option = createElement('option');
    option.value = sheet.key;
    option.textContent = sheet.name;
    option.selected = isActive;
    dropdownContainer.appendChild(option);
  });
}

// Dönem değiştirme
function switchSemester(semester) {
  const semesterChanged = currentSemester !== semester;
  currentSemester = semester;

  // Dönem seçildi, placeholder'ı gizle
  const placeholder = getElement('calendarPlaceholder');
  if (placeholder) placeholder.remove();

  if (semesterChanged) {
    // Yeni dönemin ilk sheet'ini seç
    const availableSheets = getAvailableSheets();
    currentSheetKey = availableSheets[0]?.key || 'donem1-g';
    renderSheetButtons();
  }

  loadCalendarData();
}

// Sheet değiştirme
function switchSheet(sheetKey) {
  if (currentSheetKey !== sheetKey) {
    currentSheetKey = sheetKey;

    // Sheet seçildi, placeholder'ı gizle
    const placeholder = getElement('calendarPlaceholder');
    if (placeholder) placeholder.remove();

    renderSheetButtons();
    loadCalendarData();
  }
}

// Takvim verilerini yükle
function loadCalendarData() {
  showStatus('loading', 'Takvim güncelleniyor...');

  callApi('getCalendarData', { sheetKey: currentSheetKey })
    .then(handleCalendarData)
    .catch(handleError);
}

function handleCalendarData(response) {
  hideStatus('loading');

  if (response.success && response.data.length > 0) {
    // Tüm event'leri sakla (arama için)
    allEvents = response.data;

    // Placeholder'ı kaldır ve takvimi göster
    const placeholder = getElement('calendarPlaceholder');
    if (placeholder) placeholder.remove();

    calendar.removeAllEventSources();
    calendar.addEventSource(response.data);
    eventCount = response.data.length;

    // Sayfa başlığını güncelle (varsa)
    const pageTitleEl = getElement('pageTitle');
    if (pageTitleEl && response.sheetInfo) {
      pageTitleEl.textContent = response.sheetInfo.name;
    }

    showStatus('success', `${eventCount} ders yüklendi • ${new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}`);

    setTimeout(() => hideStatus('success'), CONFIG.timers.statusHideDelay);
  } else {
    showStatus('error', response.error || 'Takvim verisi bulunamadı');
  }
}

// Takvim başlat
function initializeCalendar() {
  const calendarEl = getElement('calendar');

  // Mobil için slotMinHeight ayarı (Bootstrap sm breakpoint)
  const calendarConfig = {
    ...CONFIG.calendar,
    slotMinHeight: isMobile() ? 70 : 35,
    eventContent: function(arg) {
      return createEventContent(arg);
    },
    eventClick: function(info) {
      console.log('Event clicked:', info.event);
      showEventDetails(info.event);
    },
    events: function(fetchInfo, successCallback, failureCallback) {
      // Events will be loaded via our loadCalendarData function
    }
  };

  calendar = new FullCalendar.Calendar(calendarEl, calendarConfig);
  calendar.render();

  // Placeholder mesajını ekle
  addCalendarPlaceholder();
}

// Event içeriği oluştur
function createEventContent(arg) {
  // Sadece timeGridWeek ve timeGridDay view'ler için özel içerik
  const isTimeGridView = arg.view.type === 'timeGridWeek' || arg.view.type === 'timeGridDay';

  if (isTimeGridView) {
    // Özel event içeriği - SOL: Saatler, SAĞ: İçerik
    const startTime = formatTime(arg.event.start);
    const endTime = formatTime(arg.event.end);
    const instructor = arg.event.extendedProps.hoca || '';
    const title = arg.event.title;

    // Mobil için font büyüklükleri
    const timeFontSize = isMobile() ? '0.95rem' : '0.75rem';
    const instructorFontSize = isMobile() ? '1rem' : '0.8rem';
    const titleFontSize = isMobile() ? '1.1rem' : '0.85rem';

    return {
      html: `
        <div class="fc-event-main">
          <div class="event-time-container">
            <div class="event-start-time" style="font-size: ${timeFontSize}">${startTime}</div>
            <div class="event-end-time" style="font-size: ${timeFontSize}">${endTime}</div>
          </div>
          <div class="event-content">
            <div class="event-instructor" style="font-size: ${instructorFontSize}">${instructor}</div>
            <div class="event-title" style="font-size: ${titleFontSize}">${title}</div>
          </div>
        </div>
      `
    };
  } else {
    // List view için sadece ders adı ve hoca
    const titleFontSize = isMobile() ? '1.1rem' : '0.9rem';
    const instructorFontSize = isMobile() ? '1rem' : '0.8rem';

    return {
      html: `
        <div class="fc-event-main" style="color: #2c3e50 !important;">
          <strong style="font-size: ${titleFontSize}">${arg.event.title}</strong>
          ${arg.event.extendedProps.hoca ? `
            <div style="font-size: ${instructorFontSize}; opacity: 0.8; margin-top: 2px;">
              ${arg.event.extendedProps.hoca}
            </div>
          ` : ''}
        </div>
      `
    };
  }
}

// Export calendar functions
window.getAvailableSheets = getAvailableSheets;
window.renderSheetButtons = renderSheetButtons;
window.switchSemester = switchSemester;
window.switchSheet = switchSheet;
window.loadCalendarData = loadCalendarData;
window.handleCalendarData = handleCalendarData;
window.initializeCalendar = initializeCalendar;
window.createEventContent = createEventContent;