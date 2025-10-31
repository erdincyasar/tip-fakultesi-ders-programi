// ==========================================
// UTILS - Yardımcı Fonksiyonlar
// ==========================================

// Bootstrap breakpoint yardımcı fonksiyonu
function isMobile() {
  return window.innerWidth < 576; // Bootstrap sm breakpoint
}

function isTablet() {
  return window.innerWidth >= 576 && window.innerWidth < 768; // sm to md
}

function isDesktop() {
  return window.innerWidth >= 768; // md ve üzeri
}

// Tarih ve saat formatlama
function formatTime(date, options = { hour: '2-digit', minute: '2-digit' }) {
  return date ? date.toLocaleTimeString('tr-TR', options) : 'Belirtilmemiş';
}

function formatDate(date, options = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}) {
  return date ? date.toLocaleDateString('tr-TR', options) : 'Belirtilmemiş';
}

function updateDateTime() {
  const now = new Date();
  const dateElement = document.getElementById('currentDate');
  const timeElement = document.getElementById('currentTime');

  if (dateElement) {
    dateElement.textContent = now.toLocaleDateString('tr-TR');
  }
  if (timeElement) {
    timeElement.textContent = now.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Durum mesajları
function showStatus(type, message) {
  hideAllStatus();
  const element = document.getElementById(type + 'Status');
  if (element) {
    element.querySelector('.status-message').textContent = message;
    element.classList.remove('d-none');
  }
}

function hideStatus(type) {
  const element = document.getElementById(type + 'Status');
  if (element) element.classList.add('d-none');
}

function hideAllStatus() {
  ['loading', 'success', 'error'].forEach(type => hideStatus(type));
}

function handleError(error) {
  hideStatus('loading');
  showStatus('error', error.message);
}

// DOM yardımcıları
function getElement(id) {
  return document.getElementById(id);
}

function createElement(tag, className = '', innerHTML = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (innerHTML) element.innerHTML = innerHTML;
  return element;
}

// Placeholder mesajını ekle
function addCalendarPlaceholder() {
  const calendarContainer = document.querySelector('.calendar-container');
  if (!calendarContainer) return;

  const placeholder = createElement('div', 'position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white');
  placeholder.id = 'calendarPlaceholder';
  placeholder.style.zIndex = '10';
  placeholder.innerHTML = `
    <div class="text-center text-muted">
      <i class="bi bi-calendar-week display-1 mb-3"></i>
      <h4>Lütfen Dönem Seçin</h4>
      <p class="mb-0">Üst kısımdaki dönem ve program seçicilerinden istediğiniz dönemi seçerek takvimi görüntüleyebilirsiniz.</p>
    </div>
  `;

  calendarContainer.appendChild(placeholder);
}

// Export utility functions
window.isMobile = isMobile;
window.isTablet = isTablet;
window.isDesktop = isDesktop;
window.formatTime = formatTime;
window.formatDate = formatDate;
window.updateDateTime = updateDateTime;
window.showStatus = showStatus;
window.hideStatus = hideStatus;
window.hideAllStatus = hideAllStatus;
window.handleError = handleError;
window.getElement = getElement;
window.createElement = createElement;
window.addCalendarPlaceholder = addCalendarPlaceholder;