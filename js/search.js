// Version: 6
// Updated: 2025-10-31T20:08:01Z

// ==========================================
// SEARCH - Arama İşlevselliği
// ==========================================

// Arama görünümünü göster
function showSearch() {
  const overlay = getElement('searchOverlay');
  const input = getElement('searchInput');

  if (overlay) {
    overlay.classList.remove('d-none');
    // Focus'u biraz geciktir (animasyon için)
    setTimeout(() => {
      if (input) input.focus();
    }, 300);
  }
}

// Arama görünümünü gizle
function hideSearch() {
  const overlay = getElement('searchOverlay');
  const input = getElement('searchInput');

  if (overlay) overlay.classList.add('d-none');
  if (input) input.value = '';

  exitSearchView();
}

// Arama gerçekleştir
function performSearch() {
  const searchTerm = getElement('searchInput').value.trim().toLowerCase();

  if (!searchTerm) {
    alert('Lütfen arama terimi giriniz');
    return;
  }

  // Overlay'i kapat
  const overlay = getElement('searchOverlay');
  if (overlay) overlay.classList.add('d-none');

  showSearchResults(searchTerm);
}

// Arama sonuçlarını göster
function showSearchResults(searchTerm) {
  const filteredEvents = allEvents.filter(event => {
    const title = event.title.toLowerCase();
    const instructor = (event.extendedProps.hoca || '').toLowerCase();

    return title.includes(searchTerm) || instructor.includes(searchTerm);
  });

  displaySearchResults(filteredEvents, searchTerm);
}

// Arama sonuçlarını görüntüle
function displaySearchResults(events, searchTerm) {
  // Calendar'ı gizle
  getElement('calendar').classList.add('d-none');

  // Arama sonuçları container'ını oluştur veya göster
  let resultsContainer = getElement('searchResultsContainer');
  if (!resultsContainer) {
    resultsContainer = createElement('div', 'search-results-container');
    resultsContainer.id = 'searchResultsContainer';
    document.querySelector('.calendar-container').appendChild(resultsContainer);
  }

  resultsContainer.innerHTML = '';

  // Header
  const headerDiv = createElement('div', 'search-view-header');
  headerDiv.innerHTML = `
    <div class="d-flex justify-content-between align-items-center">
      <div>
        <h4 class="mb-1"><i class="bi bi-search me-2"></i>Arama Sonuçları</h4>
        <p class="mb-0 opacity-75">"${searchTerm}" için ${events.length} sonuç bulundu</p>
      </div>
      <button class="btn btn-light btn-sm" onclick="exitSearchView()">
        <i class="bi bi-arrow-left me-1"></i>Takvime Dön
      </button>
    </div>
  `;
  resultsContainer.appendChild(headerDiv);

  // Sonuçlar
  const resultsDiv = createElement('div', 'search-results-content p-3');

  if (events.length === 0) {
    resultsDiv.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-search display-1 text-muted mb-3"></i>
        <h5 class="text-muted">Sonuç bulunamadı</h5>
        <p class="text-muted">"${searchTerm}" için hiç sonuç bulunamadı</p>
      </div>
    `;
  } else {
    events.forEach(event => {
      const eventCard = createSearchEventCard(event);
      resultsDiv.appendChild(eventCard);
    });
  }

  resultsContainer.appendChild(resultsDiv);
  searchViewActive = true;
}

// Arama event kartı oluştur
function createSearchEventCard(event) {
  const startTime = formatTime(new Date(event.start));
  const endTime = formatTime(new Date(event.end));
  const eventDate = formatDate(new Date(event.start));

  const card = createElement('div', 'search-event-card');
  card.innerHTML = `
    <div class="search-event-header">
      <h6 class="mb-1">${event.title}</h6>
      <div class="search-event-time">${startTime} - ${endTime}</div>
    </div>
    <div class="search-event-body">
      <div class="search-event-date">${eventDate}</div>

      <div class="search-event-detail">
        <div class="search-detail-icon">👤</div>
        <div class="search-detail-content">
          <div class="search-detail-label">Eğitmen</div>
          <div class="search-detail-value">${event.extendedProps.hoca || 'Belirtilmemiş'}</div>
        </div>
      </div>

      <div class="search-event-detail">
        <div class="search-detail-icon">📑</div>
        <div class="search-detail-content">
          <div class="search-detail-label">Kurul</div>
          <div class="search-detail-value">${event.extendedProps.kurulu || 'Belirtilmemiş'}</div>
        </div>
      </div>

      <div class="search-event-detail">
        <div class="search-detail-icon">🏢</div>
        <div class="search-detail-content">
          <div class="search-detail-label">Birim</div>
          <div class="search-detail-value">${event.extendedProps.birimi || 'Belirtilmemiş'}</div>
        </div>
      </div>

      <div class="search-event-detail">
        <div class="search-detail-icon">📅</div>
        <div class="search-detail-content">
          <div class="search-detail-label">Derslik</div>
          <div class="search-detail-value">${event.extendedProps.derslik || 'Belirtilmemiş'}</div>
        </div>
      </div>

      <div class="mt-3">
        <button class="btn btn-primary btn-sm" onclick="addSingleEventToCalendarFromSearch(this)">
          <i class="bi bi-calendar-plus me-1"></i>Takvime Ekle
        </button>
        <button class="btn btn-outline-secondary btn-sm ms-2" onclick="viewEventInCalendar('${event.id}')">
          <i class="bi bi-calendar-event me-1"></i>Takvimde Göster
        </button>
      </div>
    </div>
  `;

  // Event data'sını sakla
  const button = card.querySelector('button');
  button.eventData = event;

  return card;
}

// Arama görünümünden çık
function exitSearchView() {
  searchViewActive = false;
  const resultsContainer = getElement('searchResultsContainer');
  if (resultsContainer) resultsContainer.remove();
  getElement('calendar').classList.remove('d-none');
  getElement('searchInput').value = '';
  hideSearch();
}

// Arama sonuçlarından tek event'i takvime ekle
function addSingleEventToCalendarFromSearch(button) {
  const event = button.eventData;
  if (event && confirm(`"${event.title}" dersini Google Takviminize eklemek istiyor musunuz?`)) {
    showStatus('success', `"${event.title}" takvime eklendi`);
    // Burada Google Calendar API'sini çağırabilirsiniz
  }
}

// Event'i takvimde göster
function viewEventInCalendar(eventId) {
  exitSearchView();

  // Takvimde ilgili event'e git
  const event = calendar.getEventById(eventId);
  if (event) {
    calendar.gotoDate(event.start);
    calendar.changeView('timeGridWeek');
    event.setProp('backgroundColor', '#ffeb3b');
    event.setProp('textColor', '#000');

    // 3 saniye sonra orijinal renklere dön
    setTimeout(() => {
      event.setProp('backgroundColor', event.extendedProps.color || '#2a9df4');
      event.setProp('textColor', '#fff');
    }, 3000);
  }
}

// Export search functions
window.showSearch = showSearch;
window.hideSearch = hideSearch;
window.performSearch = performSearch;
window.showSearchResults = showSearchResults;
window.displaySearchResults = displaySearchResults;
window.createSearchEventCard = createSearchEventCard;
window.exitSearchView = exitSearchView;
window.addSingleEventToCalendarFromSearch = addSingleEventToCalendarFromSearch;
window.viewEventInCalendar = viewEventInCalendar;