// Version: 6
// Updated: 2025-10-31T20:08:01Z

// ==========================================
// CONFIG - Yapılandırma
// ==========================================
const CONFIG = {
  // API yapılandırması
  api: {
    baseUrl: 'https://script.google.com/macros/s/AKfycbwjDdKvq5QhdXoEAuxDUSV3lQ5NEjRE8ApWWW7L9KwBrpq_YxolQT04U51HlhuOR7hfJA/exec',
    endpoints: {
      getCalendarData: 'getCalendarData',
      getAvailableSheets: 'getAvailableSheets',
      health: 'health'
    }
  },

  // Sheet yapılandırması
  sheetConfig: {
    'guz': [
      { key: 'donem1-g', name: 'Dönem 1 Güz', icon: 'bi-1-circle' },
      { key: 'donem2-g', name: 'Dönem 2 Güz', icon: 'bi-2-circle' },
      { key: 'donem3-g', name: 'Dönem 3 Güz', icon: 'bi-3-circle' },
      { key: 'secmeli-g', name: 'Seçmeli Dersler', icon: 'bi-star' }
    ],
    'bahar': [
      { key: 'donem1-b', name: 'Dönem 1 Bahar', icon: 'bi-1-circle' },
      { key: 'donem2-b', name: 'Dönem 2 Bahar', icon: 'bi-2-circle' },
      { key: 'donem3-b', name: 'Dönem 3 Bahar', icon: 'bi-3-circle' },
      { key: 'secmeli-b', name: 'Seçmeli Dersler', icon: 'bi-star' }
    ]
  },

  // Takvim ayarları
  calendar: {
    initialView: 'timeGridWeek',
    locale: 'tr',
    allDaySlot: false,
    nowIndicator: true,
    slotMinTime: "08:00:00",
    slotMaxTime: "17:00:00",
    slotDuration: '00:30:00',
    height: 'auto',
    dayMaxEventRows: true,
    dayMaxEvents: true,
    contentHeight: 'auto',
    expandRows: true,
    slotMinHeight: 35,
    weekends: false,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay,listWeek'
    }
  },

  // Zamanlayıcı ayarları
  timers: {
    dateTimeUpdate: 1000, // 1 saniye
    autoRefresh: 10 * 60 * 1000, // 10 dakika
    statusHideDelay: 5000 // 5 saniye
  }
};

// Mevcut dönemi otomatik belirle (mevcut aya göre)
function getCurrentSemester() {
  const currentMonth = new Date().getMonth() + 1; // 1-12
  // Şubat-Temmuz (2-7): Bahar, Ağustos-Ocak (8-1): Güz
  return (currentMonth >= 2 && currentMonth <= 7) ? 'bahar' : 'guz';
}

// Global değişkenler
let calendar;
let eventCount = 0;
let currentEvent = null;
let eventModal;
let allEvents = [];
let searchViewActive = false;
let currentSemester = getCurrentSemester();
let currentSheetKey = null; // Başlangıçta hiçbir sheet seçili değil

// Export CONFIG and global variables
window.CONFIG = CONFIG;
window.getCurrentSemester = getCurrentSemester;
window.calendar = calendar;
window.eventCount = eventCount;
window.currentEvent = currentEvent;
window.eventModal = eventModal;
window.allEvents = allEvents;
window.searchViewActive = searchViewActive;
window.currentSemester = currentSemester;
window.currentSheetKey = currentSheetKey;