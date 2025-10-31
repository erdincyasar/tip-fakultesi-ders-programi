/**
 * ==========================================
 * TİP FAKÜLTESİ DÖNEM PROGRAMLARI - BACKEND
 * ==========================================
 *
 * Bu Google Apps Script projesi, Tıp Fakültesi dönem programlarını
 * Google Sheets'ten çekerek web uygulaması üzerinden sunar.
 *
 * Özellikler:
 * - Çoklu dönem desteği (Güz/Bahar)
 * - Gerçek zamanlı veri çekme
 * - Hata yönetimi ve loglama
 * - Güvenlik kontrolleri
 *
 * @author Tıp Fakültesi Bilgi İşlem
 * @version 2.0
 * @since 2025
 */

// ==========================================
// YAPILANDIRMA VE SABİTLER
// ==========================================

/**
 * Google Sheets yapılandırma bilgileri
 * Her dönem için ayrı spreadsheet ID'leri ve sayfa isimleri
 */
const SHEET_CONFIGS = {
  'donem1-g': {
    id: '',
    name: 'Dönem 1 Güz Programı',
    donem: 'guz',
    sheetName: 'Sayfa1'
  },
  'donem2-g': {
    id: '1FJpvnO9-f1ic7MGL-00ikLINpwv0twTKRuTrAjThETI',
    name: 'Dönem 2 Güz Programı',
    donem: 'guz',
    sheetName: 'Sayfa1'
  },
  'donem3-g': {
    id: '1QEmfAXpEXVX3AsR11UGO00dxku2sqH4H8In6WTHBxck',
    name: 'Dönem 3 Güz Programı',
    donem: 'guz',
    sheetName: 'Sayfa1'
  },
  'secmeli-g': {
    id: '',
    name: 'Seçmeli Dersler Güz',
    donem: 'guz',
    sheetName: 'Sayfa1'
  },
  'donem1-b': {
    id: '',
    name: 'Dönem 1 Bahar Programı',
    donem: 'bahar',
    sheetName: 'Sayfa1'
  },
  'donem2-b': {
    id: '',
    name: 'Dönem 2 Bahar Programı',
    donem: 'bahar',
    sheetName: 'Sayfa1'
  },
  'donem3-b': {
    id: '',
    name: 'Dönem 3 Bahar Programı',
    donem: 'bahar',
    sheetName: 'Sayfa1'
  },
  'secmeli-b': {
    id: '',
    name: 'Seçmeli Dersler Bahar',
    donem: 'bahar',
    sheetName: 'Sayfa1'
  }
};

/**
 * Varsayılan olarak kullanılacak sheet anahtarı
 * Uygulama ilk açıldığında bu dönem gösterilir
 */

// ==========================================
// YARDIMCI FONKSİYONLAR
// ==========================================

/**
 * Çalışma bağlamı bilgilerini alır
 * Kullanıcı kimlik doğrulama ve yetkilendirme için kullanılır
 *
 * @returns {Object} Çalışma bağlamı bilgileri
 * @property {string} activeEmail - Aktif kullanıcı e-postası
 * @property {string} effectiveEmail - Etkili kullanıcı e-postası
 */
function getExecutionContext() {
  let activeEmail = '';
  try {
    activeEmail = Session.getActiveUser().getEmail();
  } catch (e) {
    activeEmail = '';
  }

  let effectiveEmail = '';
  try {
    effectiveEmail = Session.getEffectiveUser().getEmail();
  } catch (e) {
    effectiveEmail = '';
  }

  return { activeEmail, effectiveEmail };
}

/**
 * Çalışma bağlamı bilgilerini loglar
 * Hata ayıklama ve güvenlik denetimi için kullanılır
 *
 * @param {string} prefix - Log mesajı öneki
 */
function logExecutionContext(prefix) {
  const ctx = getExecutionContext();
  console.log(`${prefix || 'CTX'} | activeUser=${ctx.activeEmail || '(boş)'} | effectiveUser=${ctx.effectiveEmail || '(boş)'}`);
}

/**
 * HTML dosyalarını include etmek için kullanılan yardımcı fonksiyon
 * Google Apps Script'te HTML şablonları arasında geçiş için gereklidir
 *
 * @param {string} filename - Dahil edilecek HTML dosyasının adı
 * @returns {string} HTML dosyasının içeriği
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Hata durumunda kullanıcı dostu HTML yanıt oluşturur
 *
 * @param {string} message - Gösterilecek hata mesajı
 * @returns {HtmlOutput} Hata sayfası HTML çıktısı
 */
function createErrorResponse(message) {
  return HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Sistem Hatası</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin-top: 50px;
            color: #d32f2f;
          }
          h3 { color: #d32f2f; }
        </style>
      </head>
      <body>
        <h3>⚠️ ${message}</h3>
        <p>Lütfen daha sonra tekrar deneyin.</p>
      </body>
    </html>
  `);
}

// ==========================================
// ANA WEB UYGULAMASI FONKSİYONLARI
// ==========================================

/**
 * Google Apps Script web uygulaması giriş noktası
 * Kullanıcı web uygulamasını açtığında bu fonksiyon çalışır
 *
 * @param {Object} e - URL parametreleri ve istek bilgileri
 * @returns {HtmlOutput} Ana sayfa HTML çıktısı
 */
function doGet(e) {
  try {
    // Çalışma bağlamını logla
    logExecutionContext('doGet');

    // URL parametrelerini al
    const params = (e && e.parameter) ? e.parameter : {};

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '3600'
    };

    // OPTIONS request (CORS preflight) - method kontrolü
    if (params.method === 'OPTIONS' || (e && e.method === 'OPTIONS')) {
      return ContentService
        .createTextOutput('')
        .setMimeType(ContentService.MimeType.TEXT)
        .setHeaders(corsHeaders);
    }

    // PWA Manifest isteği
    if (params.action === 'manifest') {
      return serveManifest();
    }

    // Service Worker isteği
    if (params.action === 'sw') {
      return serveServiceWorker();
    }

    // API endpoint'leri
    if (params.action === 'api') {
      const apiResponse = handleApiRequest(params);
      return ContentService
        .createTextOutput(JSON.stringify(apiResponse))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(corsHeaders);
    }

    // Özel işlemler için parametre kontrolü
    if (params.action === 'health') {
      // Sistem durumu kontrolü
      const res = healthCheck();
      return HtmlService.createHtmlOutput(`<pre>${JSON.stringify(res, null, 2)}</pre>`)
        .setTitle('Sistem Durumu Kontrolü')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    if (params.action === 'debug') {
      // Hata ayıklama bilgileri
      let res;
      try {
        res = debugGetSheetInfo();
      } catch (err) {
        res = { success: false, error: String(err) };
      }
      return HtmlService.createHtmlOutput(`<pre>${JSON.stringify(res, null, 2)}</pre>`)
        .setTitle('Hata Ayıklama Bilgileri')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    // Ana uygulamayı yükle (fallback)
    const template = HtmlService.createTemplateFromFile('Index');
    return template.evaluate()
        .setTitle('Tıp Fakültesi Dönem Programları')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('Access-Control-Allow-Origin', '*')
        .addMetaTag('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        .addMetaTag('Access-Control-Allow-Headers', 'Content-Type');

  } catch (error) {
    console.error('doGet fonksiyonu hatası:', error);
    return createErrorResponse('Sistem hatası oluştu. Lütfen daha sonra tekrar deneyin.');
  }
}

/**
 * API isteklerini yöneten fonksiyon
 * @param {Object} params - URL parametreleri
 * @returns {Object} API yanıtı
 */
function handleApiRequest(params) {
  try {
    const action = params.endpoint;

    switch (action) {
      case 'getCalendarData':
        const sheetKey = params.sheetKey;
        if (!sheetKey) {
          return { success: false, error: 'sheetKey parametresi gerekli' };
        }
        return getCalendarData(sheetKey);

      case 'getAvailableSheets':
        return {
          success: true,
          data: getAvailableSheets()
        };

      case 'health':
        return healthCheck();

      default:
        return { success: false, error: 'Geçersiz endpoint' };
    }
  } catch (error) {
    console.error('API hatası:', error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// VERİ ÇEKME FONKSİYONLARI
// ==========================================

/**
 * Belirtilen dönem için takvim verilerini Google Sheets'ten çeker
 * Bu fonksiyon frontend tarafından AJAX ile çağrılır
 *
 * @param {string} sheetKey - Sheet yapılandırma anahtarı (örn: 'donem3-g')
 * @returns {Object} İşlem sonucu ve veri
 * @property {boolean} success - İşlem başarılı mı?
 * @property {Array} data - Event verileri (başarılı ise)
 * @property {string} error - Hata mesajı (başarısız ise)
 * @property {Object} sheetInfo - Sheet bilgileri
 */
function getCalendarData(sheetKey) {
  try {
    console.log('=== TAKVİM VERİ ÇEKME İŞLEMİ BAŞLADI ===');
    logExecutionContext('getCalendarData');

    // Sheet yapılandırmasını kontrol et
    const config = SHEET_CONFIGS[sheetKey];
    if (!config) {
      console.error('Geçersiz sheet anahtarı:', sheetKey);
      return {
        success: false,
        error: 'Geçersiz dönem seçimi',
        availableSheets: Object.keys(SHEET_CONFIGS).map(key => ({
          key: key,
          name: SHEET_CONFIGS[key].name
        })),
        data: []
      };
    }

    const SPREADSHEET_ID = config.id;
    const SHEET_NAME = config.sheetName;

    console.log(`Hedef Sheet: ${sheetKey} | ID: ${SPREADSHEET_ID} | Sayfa: ${SHEET_NAME}`);

    // Google Sheets dosyasına erişim
    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      console.log('✅ Spreadsheet başarıyla açıldı');
    } catch (openError) {
      console.error('❌ Spreadsheet erişim hatası:', openError);

      const { activeEmail, effectiveEmail } = getExecutionContext();
      return {
        success: false,
        error: 'Google Sheets dosyasına erişilemiyor. Lütfen dosya izinlerini ve dağıtım ayarlarını kontrol edin.',
        details: {
          spreadsheetId: SPREADSHEET_ID,
          sheetKey: sheetKey,
          activeUser: activeEmail || null,
          effectiveUser: effectiveEmail || null,
          rawError: String(openError && openError.message ? openError.message : openError)
        },
        data: []
      };
    }

    // Sayfa kontrolü (büyük/küçük harf duyarsız arama ile)
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      // Tam eşleşme bulunamadı, benzer isim ara
      const allSheets = spreadsheet.getSheets();
      const matchingSheet = allSheets.find(sh =>
        (sh.getName() || '').toLowerCase() === String(SHEET_NAME).toLowerCase()
      );

      if (matchingSheet) {
        sheet = matchingSheet;
        console.log(`⚠️ Sayfa tam eşleşmedi, '${SHEET_NAME}' yerine '${sheet.getName()}' kullanılacak.`);
      } else {
        const availableSheetNames = allSheets.map(s => s.getName());
        console.error('❌ Sayfa bulunamadı:', SHEET_NAME, '| Mevcut sayfalar:', availableSheetNames);
        return {
          success: false,
          error: `İstenen sayfa bulunamadı: ${SHEET_NAME}`,
          availableSheets: availableSheetNames,
          data: []
        };
      }
    }
    console.log('✅ Sayfa bulundu:', sheet.getName());

    // Veri aralığını al ve değerleri oku
    const dataRange = sheet.getDataRange();
    const rawData = dataRange.getValues();
    console.log('📊 Toplam satır sayısı:', rawData.length);

    // Veri kontrolü
    if (rawData.length <= 1) {
      console.log('⚠️ Sayfa boş veya sadece başlık var');
      return {
        success: true,
        data: [],
        sheetInfo: {
          key: sheetKey,
          name: config.name,
          totalEvents: 0
        }
      };
    }

    // Sütun başlıklarını al
    const headers = rawData[0].map(header => String(header).trim());
    console.log('📋 Sütun başlıkları:', headers);

    // Event verilerini işle
    const events = [];
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (isRowEmpty(row)) continue; // Boş satırları atla

      try {
        const event = createEventFromRow(headers, row, i);
        if (event) events.push(event);
      } catch (rowError) {
        console.error(`❌ Satır ${i} işlenirken hata:`, rowError);
        // Hatalı satırları atla, diğerlerini işle
      }
    }

    console.log('✅ Oluşturulan ders sayısı:', events.length);

    return {
      success: true,
      data: events,
      sheetInfo: {
        key: sheetKey,
        name: config.name,
        totalEvents: events.length
      }
    };

  } catch (error) {
    console.error('❌ getCalendarData genel hatası:', error);
    return {
      success: false,
      error: `Veri çekme hatası: ${error.message}`,
      data: []
    };
  }
}

/**
 * Kullanılabilir tüm dönem/sheet bilgilerini döndürür
 *
 * @returns {Array} Sheet yapılandırma listesi
 */
function getAvailableSheets() {
  const sheets = [];
  for (const [key, config] of Object.entries(SHEET_CONFIGS)) {
    sheets.push({
      key: key,
      name: config.name,
      id: config.id
    });
  }
  return sheets;
}

// ==========================================
// VERİ İŞLEME YARDIMCI FONKSİYONLARI
// ==========================================

/**
 * Bir satırın boş olup olmadığını kontrol eder
 *
 * @param {Array} row - Kontrol edilecek satır
 * @returns {boolean} Satır boş mu?
 */
function isRowEmpty(row) {
  return !row || row.every(cell =>
    cell === '' || cell === null || cell === undefined || String(cell).trim() === ''
  );
}

/**
 * Google Sheets satırından FullCalendar event objesi oluşturur
 *
 * @param {Array} headers - Sütun başlıkları
 * @param {Array} row - Ham satır verisi
 * @param {number} rowIndex - Satır numarası (log için)
 * @returns {Object|null} FullCalendar event objesi veya null
 */
function createEventFromRow(headers, row, rowIndex) {
  // Satır verilerini objeye dönüştür
  const data = {};
  const rawData = {}; // Orijinal değerleri sakla

  headers.forEach((header, index) => {
    rawData[header] = row[index]; // Ham değer
    data[header] = row[index] !== undefined ? String(row[index]).trim() : '';
  });

  // Debug loglama
  console.log(`📝 Satır ${rowIndex} ham değerler:`, {
    startDate: rawData['Start Date'],
    startTime: rawData['Start Time'],
    endTime: rawData['End Time'],
    ders: data['Dersin ADI'],
    derslik: data['Derslik']
  });

  // Temel bilgileri al
  const dateRaw = rawData['Start Date'];
  const startTime = rawData['Start Time'];
  const endTime = rawData['End Time'];
  const title = data['Dersin ADI'] || 'Ders';
  const color = '#2a9df4'; // Varsayılan renk

  // Tarih kontrolü
  if (!dateRaw) {
    console.log(`⚠️ Satır ${rowIndex} atlandı: Tarih bilgisi yok`);
    return null;
  }

  // ISO formatına dönüştür
  const startISO = toISO(dateRaw, startTime);
  const endISO = toISO(dateRaw, endTime);

  if (!startISO || !endISO) {
    console.log(`⚠️ Satır ${rowIndex} atlandı: Geçersiz tarih/zaman formatı`);
    return null;
  }

  // FullCalendar event objesi oluştur
  return {
    title: title,
    start: startISO,
    end: endISO,
    color: color,
    extendedProps: {
      hoca: data['Hoca'] || '',
      birimi: data['Birimi'] || '',
      kurulu: data['Kurulu'] || '',
      derslik: data['Derslik'] || ''
    }
  };
}

/**
 * Google Sheets tarih ve saat verilerini ISO 8601 formatına dönüştürür
 * Google Sheets'in özel tarih formatını handle eder
 *
 * @param {*} dateValue - Tarih değeri (Date object veya string)
 * @param {*} timeValue - Saat değeri (Date object veya string)
 * @returns {string|null} ISO 8601 formatında tarih/saat veya null
 */
function toISO(dateValue, timeValue) {
  try {
    if (!dateValue) return null;

    let date;

    // 1. TARİH BİLGİSİNİ AYRIŞTIR (sadece gün/ay/yıl)
    if (dateValue instanceof Date) {
      // Date objesinden sadece tarih kısmını al, saati sıfırla
      date = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
    } else {
      // String tarih formatını parse et
      const dateStr = String(dateValue).trim();
      date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      // Saati sıfırla
      date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    // 2. SAAT BİLGİSİNİ AYRIŞTIR (timezone-safe)
    let hours = 0;
    let minutes = 0;

    if (timeValue instanceof Date) {
      // Google Sheets Date objesi - timezone bağımsız saat/dakika çıkar
      const timezone = Session.getScriptTimeZone();
      console.log(`📅 Script timezone: ${timezone}`);

      // Utilities.formatDate ile güvenli saat çıkarımı
      const timeStr = Utilities.formatDate(timeValue, timezone, 'HH:mm');
      const timeParts = timeStr.split(':');
      hours = parseInt(timeParts[0], 10) || 0;
      minutes = parseInt(timeParts[1], 10) || 0;

      console.log(`🕐 Sheets zamanı: ${timeValue} → ${timeStr} → ${hours}:${minutes}`);

    } else {
      // String saat formatı (örn: "08:30")
      const timeStr = String(timeValue || '').trim();
      if (timeStr && timeStr.includes(':')) {
        const timeParts = timeStr.split(':');
        hours = parseInt(timeParts[0], 10) || 0;
        minutes = parseInt(timeParts[1], 10) || 0;
      }
    }

    // 3. TARİH VE SAATİ BİRLEŞTİR
    date.setHours(hours, minutes, 0, 0);

    const isoString = date.toISOString();
    console.log(`✅ Final ISO: ${isoString} (${hours}:${minutes})`);
    return isoString;

  } catch (error) {
    console.error('❌ toISO dönüştürme hatası:', error);
    return null;
  }
}

// ==========================================
// HATA AYIKLAMA VE TEST FONKSİYONLARI
// ==========================================

/**
 * Sheet bilgileri ve hata ayıklama verilerini döndürür
 * Geliştirme sırasında sorun giderme için kullanılır
 *
 * @param {string} sheetKey - Kontrol edilecek sheet anahtarı
 * @returns {Object} Debug bilgileri
 */
function debugGetSheetInfo(sheetKey) {
  try {
    const config = SHEET_CONFIGS[sheetKey];
    if (!config) {
      return { success: false, error: 'Geçersiz sheet anahtarı' };
    }

    const spreadsheet = SpreadsheetApp.openById(config.id);
    const sheet = spreadsheet.getSheetByName(config.sheetName);
    const dataRange = sheet.getDataRange();
    const rawData = dataRange.getValues();
    const context = getExecutionContext();

    const allSheetNames = spreadsheet.getSheets().map(s => s.getName());

    return {
      success: true,
      sheetName: sheet.getName(),
      totalRows: rawData.length,
      headers: rawData[0],
      firstFewRows: rawData.slice(0, Math.min(5, rawData.length)),
      spreadsheetUrl: spreadsheet.getUrl(),
      context: context,
      availableSheets: allSheetNames,
      currentConfig: config
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      context: getExecutionContext()
    };
  }
}

/**
 * Sistem durumu kontrolü ve erişim testi yapar
 * Dosya izinleri, bağlantı durumu vb. kontrol eder
 *
 * @param {string} sheetKey - Test edilecek sheet anahtarı
 * @returns {Object} Sağlık kontrolü sonuçları
 */
function healthCheck(sheetKey) {
  const context = getExecutionContext();

  try {
    const config = SHEET_CONFIGS[sheetKey];
    if (!config) {
      return { success: false, error: 'Geçersiz sheet anahtarı' };
    }

    // Drive API ile dosya bilgilerini kontrol et
    let driveInfo = null;
    try {
      const file = DriveApp.getFileById(config.id);
      driveInfo = {
        name: file.getName(),
        url: (typeof file.getUrl === 'function') ? file.getUrl() : null,
        mimeType: (typeof file.getMimeType === 'function') ? file.getMimeType() : null,
        owner: (typeof file.getOwner === 'function' && file.getOwner()) ? file.getOwner().getEmail() : null,
        isTrashed: file.isTrashed(),
        lastUpdated: file.getLastUpdated(),
      };
    } catch (driveError) {
      driveInfo = { error: String(driveError) };
    }

    // Spreadsheet erişimi kontrol et
    const spreadsheet = SpreadsheetApp.openById(config.id);
    const sheet = spreadsheet.getSheetByName(config.sheetName) ||
                  spreadsheet.getSheets().find(s =>
                    (s.getName() || '').toLowerCase() === String(config.sheetName).toLowerCase()
                  );
    const availableSheets = spreadsheet.getSheets().map(s => s.getName());

    return {
      success: true,
      message: '✅ Sistem erişimi normal',
      context: context,
      driveInfo: driveInfo,
      spreadsheetUrl: spreadsheet.getUrl(),
      hasSheet: !!sheet,
      sheetName: sheet ? sheet.getName() : null,
      availableSheets: availableSheets,
      currentConfig: config
    };

  } catch (error) {
    return {
      success: false,
      message: '❌ Sistem erişimi başarısız',
      error: String(error),
      context: context
    };
  }
}

/**
 * Tarih/saat dönüştürme fonksiyonunu test eder
 * Geliştirme sırasında kullanılmak üzere çeşitli test senaryoları çalıştırır
 *
 * @returns {Array} Test sonuçları
 */
function testDateTimeParsing() {
  // Test senaryoları
  const testCases = [
    {
      date: new Date('2025-09-15'),
      time: new Date('1899-12-30T08:00:00'), // Google Sheets serial time
      description: 'Normal tarih + Sheets zaman formatı'
    },
    {
      date: '2025-09-15',
      time: '08:00',
      description: 'String tarih + string zaman'
    },
    {
      date: new Date('2025-12-17'),
      time: new Date('1899-12-30T11:00:00'),
      description: 'Aralık tarihi + Sheets zaman'
    }
  ];

  // Her test senaryosunu çalıştır
  const results = testCases.map((test, index) => {
    try {
      const result = toISO(test.date, test.time);
      return {
        test: index + 1,
        description: test.description,
        input: { date: test.date, time: test.time },
        output: result,
        success: !!result
      };
    } catch (error) {
      return {
        test: index + 1,
        description: test.description,
        input: { date: test.date, time: test.time },
        error: error.message,
        success: false
      };
    }
  });

  console.log('🧪 DateTime Dönüştürme Test Sonuçları:', results);
  return results;
}

// Varsayılan sheet
const DEFAULT_SHEET = 'donem3-g';

// Çalışma bağlamını günlüklemede kullanacağız
function getExecutionContext() {
  let activeEmail = '';
  try { activeEmail = Session.getActiveUser().getEmail(); } catch (e) { activeEmail = ''; }
  let effectiveEmail = '';
  try { effectiveEmail = Session.getEffectiveUser().getEmail(); } catch (e) { effectiveEmail = ''; }
  return { activeEmail, effectiveEmail };
}

function logExecutionContext(prefix) {
  const ctx = getExecutionContext();
  console.log(`${prefix || 'CTX'} | activeUser=${ctx.activeEmail || '(boş)'} | effectiveUser=${ctx.effectiveEmail || '(boş)'}`);
}

// İKİNCİ doGet FONKSİYONU KALDIRILDI - İlk doGet kullanılıyor
/*
function doGet(e) {
  try {
    logExecutionContext('doGet');
    const params = (e && e.parameter) ? e.parameter : {};
    
    // E-posta kontrolünü kaldırdık - artık herkese açık
    // if (!email || !/@(ogr\.)?uludag\.edu\.tr$/.test(email)) {
    //   return createErrorResponse('❌ Sadece Uludağ Üniversitesi hesaplarıyla giriş yapılabilir.');
    // }
    
    // İsteğe bağlı tanılama çıktıları
    if (params.action === 'health') {
      const res = healthCheck();
      return HtmlService.createHtmlOutput(`<pre>${JSON.stringify(res, null, 2)}</pre>`) 
        .setTitle('Health Check')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    if (params.action === 'debug') {
      let res;
      try { res = debugGetSheetInfo(); } catch (err) { res = { success: false, error: String(err) }; }
      return HtmlService.createHtmlOutput(`<pre>${JSON.stringify(res, null, 2)}</pre>`) 
        .setTitle('Debug Info')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    
    // createTemplateFromFile kullanarak
    const template = HtmlService.createTemplateFromFile('Index');
    return template.evaluate()
        .setTitle('Tıp Fakültesi Dönem Programları')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
  } catch (error) {
    console.error('doGet error:', error);
    return createErrorResponse('❌ Sistem hatası. Lütfen daha sonra tekrar deneyin.');
  }
}
*/

// HTML dosyalarını include etmek için gerekli fonksiyon
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


function createErrorResponse(message) {
  return HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
      <head><title>Hata</title></head>
      <body>
        <h3 style="color: red; text-align: center; margin-top: 50px;">${message}</h3>
      </body>
    </html>
  `);
}

// Güncellenmiş getCalendarData fonksiyonu
function getCalendarData(sheetKey) {
  try {
    console.log('=== getCalendarData Başladı ===');
    logExecutionContext('getCalendarData');
    
    const config = SHEET_CONFIGS[sheetKey];
    if (!config) {
      return { 
        success: false, 
        error: 'Geçersiz sheet anahtarı', 
        availableSheets: Object.keys(SHEET_CONFIGS).map(key => ({
          key: key,
          name: SHEET_CONFIGS[key].name
        })),
        data: [] 
      };
    }
    
    const SPREADSHEET_ID = config.id;
    const SHEET_NAME = config.sheetName;
    
    console.log(`Sheet Key: ${sheetKey}, ID: ${SPREADSHEET_ID}, Name: ${SHEET_NAME}`);
    
    // Spreadsheet'e erişim
    let ss;
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (openErr) {
      console.error('Spreadsheet openById hatası:', openErr);
      const { activeEmail, effectiveEmail } = getExecutionContext();
      return {
        success: false,
        error: 'Spreadsheet erişim hatası: Lütfen web uygulaması dağıtım ayarlarında "Execute as: Me" seçili olduğundan ve bu hesabın ilgili dosyaya erişimi olduğundan emin olun.',
        details: {
          spreadsheetId: SPREADSHEET_ID,
          sheetKey: sheetKey,
          activeUser: activeEmail || null,
          effectiveUser: effectiveEmail || null,
          rawError: String(openErr && openErr.message ? openErr.message : openErr)
        },
        data: []
      };
    }
    console.log('Spreadsheet açıldı');

    // Sheet kontrolü (büyük/küçük harf duyarsız yedek)
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      const sheets = ss.getSheets();
      const match = sheets.find(sh => (sh.getName() || '').toLowerCase() === String(SHEET_NAME).toLowerCase());
      if (match) {
        sheet = match;
        console.log(`Sheet tam eşleşmedi, '${SHEET_NAME}' yerine '${sheet.getName()}' kullanılacak.`);
      } else {
        const names = sheets.map(s => s.getName());
        console.error('Sheet bulunamadı:', SHEET_NAME, 'Mevcut sayfalar:', names);
        return { 
          success: false, 
          error: `Sheet bulunamadı: ${SHEET_NAME}`, 
          availableSheets: names, 
          data: [] 
        };
      }
    }
    console.log('Sheet bulundu:', sheet.getName());

    // Veriyi al
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    console.log('Toplam satır:', values.length);

    if (values.length <= 1) {
      console.log('Veri bulunamadı');
      return { 
        success: true, 
        data: [],
        sheetInfo: {
          key: sheetKey,
          name: config.name,
          totalEvents: 0
        }
      };
    }

    // Header'ları al
    const headers = values[0].map(h => String(h).trim());
    console.log('Headers:', headers);

    // Events oluştur
    const events = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (isRowEmpty(row)) continue;
      try {
        const event = createEventFromRow(headers, row, i);
        if (event) events.push(event);
      } catch (rowError) {
        console.error(`Satır ${i} işlenirken hata:`, rowError);
      }
    }

    console.log('Oluşturulan event sayısı:', events.length);
    return { 
      success: true, 
      data: events,
      sheetInfo: {
        key: sheetKey,
        name: config.name,
        totalEvents: events.length
      }
    };

  } catch (error) {
    console.error('getCalendarData hatası:', error);
    return { success: false, error: error.message, data: [] };
  }
}

// Kullanılabilir sheet'leri getir
function getAvailableSheets() {
  const sheets = [];
  for (const [key, config] of Object.entries(SHEET_CONFIGS)) {
    sheets.push({
      key: key,
      name: config.name,
      id: config.id
    });
  }
  return sheets;
}

function isRowEmpty(row) {
  return !row || row.every(cell =>
    cell === '' || cell === null || cell === undefined || String(cell).trim() === ''
  );
}

function createEventFromRow(headers, row, rowIndex) {
  const obj = {};
  const objRaw = {}; // Ham değerleri sakla
  
  headers.forEach((header, index) => {
    objRaw[header] = row[index]; // Ham değer
    obj[header] = row[index] !== undefined ? String(row[index]).trim() : '';
  });
  
  console.log(`Satır ${rowIndex} ham değerler:`, {
    startDate: objRaw['Start Date'],
    startTime: objRaw['Start Time'], 
    endTime: objRaw['End Time'],
    ders: obj['Dersin ADI'],
    derslik: obj['Derslik']
  });
  
  const dateRaw = objRaw['Start Date'];
  const startTime = objRaw['Start Time'];
  const endTime = objRaw['End Time'];
  const title = obj['Dersin ADI'] || 'Ders';
  const color = '#2a9df4';
  
  if (!dateRaw) {
    console.log(`Satır ${rowIndex} atlandı: Tarih yok`);
    return null;
  }
  
  const startISO = toISO(dateRaw, startTime);
  const endISO = toISO(dateRaw, endTime);
  
  if (!startISO || !endISO) {
    console.log(`Satır ${rowIndex} atlandı: Geçersiz tarih/zaman`);
    return null;
  }
  
  return {
    title: title,
    start: startISO,
    end: endISO,
    color: color,
    extendedProps: {
      hoca: obj['Hoca'] || '',
      birimi: obj['Birimi'] || '',
      kurulu: obj['Kurulu'] || '',
      derslik: obj['Derslik'] || ''
    }
  };
}

function toISO(dateValue, timeValue) {
  try {
    if (!dateValue) return null;
    
    let date;
    
    // 1. TARİHİ AYRIŞTIR - SADECE GÜN BİLGİSİ
    if (dateValue instanceof Date) {
      // Sadece gün, ay, yıl bilgisini al, saati sıfırla
      date = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
    } else {
      const dateStr = String(dateValue).trim();
      date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      // Saati sıfırla
      date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    
    // 2. SAATİ AYRIŞTIR - UTILITIES.FORMATDATE İLE TİMEZONE-SAFE
    let hours = 0;
    let minutes = 0;
    
    if (timeValue instanceof Date) {
      // Google Sheets Date objesinden timezone'a bağımsız saat:dakika al
      const timezone = Session.getScriptTimeZone();
      console.log(`Script timezone: ${timezone}`);
      
      const hhmm = Utilities.formatDate(timeValue, timezone, 'HH:mm');
      const parts = hhmm.split(':');
      hours = parseInt(parts[0], 10) || 0;
      minutes = parseInt(parts[1], 10) || 0;
      
      console.log(`Sheets time RAW: ${timeValue}`);
      console.log(`formatDate result: ${hhmm} -> ${hours}:${minutes}`);
      
    } else {
      // String saat formatı "HH:MM"
      const timeStr = String(timeValue || '').trim();
      if (timeStr && timeStr.includes(':')) {
        const parts = timeStr.split(':');
        hours = parseInt(parts[0], 10) || 0;
        minutes = parseInt(parts[1], 10) || 0;
      }
    }
    
    // 3. TARİH VE SAATİ BİRLEŞTİR
    date.setHours(hours, minutes, 0, 0);
    
    console.log(`Final: ${date.toISOString()} (${hours}:${minutes})`);
    return date.toISOString();
    
  } catch (error) {
    console.error('toISO hatası:', error);
    return null;
  }
}

// Debug fonksiyonu - güncellenmiş hali
function debugGetSheetInfo(sheetKey) {
  try {
    const config = SHEET_CONFIGS[sheetKey];
    if (!config) {
      return { success: false, error: 'Geçersiz sheet anahtarı' };
    }
    
    const ss = SpreadsheetApp.openById(config.id);
    const sheet = ss.getSheetByName(config.sheetName);
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const ctx = getExecutionContext();
    
    const allSheetNames = ss.getSheets().map(s => s.getName());
    
    return {
      success: true,
      sheetName: sheet.getName(),
      totalRows: values.length,
      headers: values[0],
      firstFewRows: values.slice(0, Math.min(5, values.length)),
      url: ss.getUrl(),
      context: ctx,
      availableSheets: allSheetNames,
      currentConfig: config
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Sağlık kontrolü ve erişim testi - güncellenmiş hali
function healthCheck(sheetKey) {
  const ctx = getExecutionContext();
  try {
    const config = SHEET_CONFIGS[sheetKey];
    if (!config) {
      return { success: false, error: 'Geçersiz sheet anahtarı' };
    }
    
    // Drive üzerinden de test et (dosya var/yetki var mı)
    let driveInfo = null;
    try {
      const file = DriveApp.getFileById(config.id);
      driveInfo = {
        name: file.getName(),
        url: (typeof file.getUrl === 'function') ? file.getUrl() : null,
        mimeType: (typeof file.getMimeType === 'function') ? file.getMimeType() : null,
        owner: (typeof file.getOwner === 'function' && file.getOwner()) ? file.getOwner().getEmail() : null,
        isTrashed: file.isTrashed(),
        lastUpdated: file.getLastUpdated(),
      };
    } catch (e) {
      driveInfo = { error: String(e) };
    }

    const ss = SpreadsheetApp.openById(config.id);
    const sheet = ss.getSheetByName(config.sheetName) || ss.getSheets().find(s => (s.getName() || '').toLowerCase() === String(config.sheetName).toLowerCase());
    const availableSheets = ss.getSheets().map(s => s.getName());

    return {
      success: true,
      message: 'Erişim OK',
      context: ctx,
      driveInfo,
      spreadsheetUrl: ss.getUrl(),
      hasSheet: !!sheet,
      sheetName: sheet ? sheet.getName() : null,
      availableSheets,
      currentConfig: config
    };
  } catch (e) {
    return {
      success: false,
      message: 'Erişim başarısız',
      error: String(e),
      context: ctx
    };
  }
}

function testDateTimeParsing() {
  // Test verileri
  const testCases = [
    {
      date: new Date('2025-09-15'),
      time: new Date('1899-12-30T08:00:00'), // Sheets serial time
      description: 'Normal tarih + Sheets zaman'
    },
    {
      date: '2025-09-15',
      time: '08:00',
      description: 'String tarih + string zaman'
    },
    {
      date: new Date('2025-12-17'),
      time: new Date('1899-12-30T11:00:00'),
      description: 'Aralık tarihi + Sheets zaman'
    }
  ];
  
  const results = testCases.map((test, index) => {
    try {
      const result = toISO(test.date, test.time);
      return {
        test: index + 1,
        description: test.description,
        input: { date: test.date, time: test.time },
        output: result,
        success: !!result
      };
    } catch (error) {
      return {
        test: index + 1,
        description: test.description,
        input: { date: test.date, time: test.time },
        error: error.message,
        success: false
      };
    }
  });
  
  console.log('DateTime Parsing Test Results:', results);
  return results;
}

// ==========================================
// PWA (PROGRESSIVE WEB APP) FONKSİYONLARI
// ==========================================

/**
 * PWA manifest.json dosyasını servis eder
 * @returns {ContentService.TextOutput} JSON manifest
 */
function serveManifest() {
  const manifest = {
    "name": "Tıp Fakültesi Dönem Programları",
    "short_name": "Dönem Programı",
    "description": "Uludağ Üniversitesi Tıp Fakültesi dönem eğitim programları",
    "start_url": "https://script.google.com/macros/s/" + ScriptApp.getScriptId() + "/exec",
    "display": "fullscreen",
    "background_color": "#667eea",
    "theme_color": "#2c5aa0",
    "orientation": "portrait",
    "scope": "/",
    "categories": ["education", "productivity", "lifestyle"],
    "lang": "tr",
    "dir": "ltr",
    "prefer_related_applications": false,
    "icons": [
      {
        "src": "https://img.icons8.com/ios-filled/512/calendar.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "https://img.icons8.com/ios-filled/512/calendar.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "https://img.icons8.com/ios-filled/512/calendar.png",
        "sizes": "72x72",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "https://img.icons8.com/ios-filled/512/calendar.png",
        "sizes": "96x96",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "https://img.icons8.com/ios-filled/512/calendar.png",
        "sizes": "128x128",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "https://img.icons8.com/ios-filled/512/calendar.png",
        "sizes": "144x144",
        "type": "image/png",
        "purpose": "any"
      }
    ],
    "categories": ["education", "productivity"],
    "lang": "tr"
  };

  return ContentService.createTextOutput(JSON.stringify(manifest))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*'
    });
}

/**
 * Service Worker dosyasını servis eder
 * @returns {ContentService.TextOutput} JavaScript service worker
 */
function serveServiceWorker() {
  const swContent = `
    const CACHE_NAME = 'tip-fakulte-program-v1';
    const urlsToCache = [
      '/',
      'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
      'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css',
      'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.css',
      'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
      'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js'
    ];

    self.addEventListener('install', function(event) {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then(function(cache) {
            return cache.addAll(urlsToCache);
          })
      );
    });

    self.addEventListener('fetch', function(event) {
      event.respondWith(
        caches.match(event.request)
          .then(function(response) {
            if (response) {
              return response;
            }
            return fetch(event.request);
          })
      );
    });
  `;

  return ContentService.createTextOutput(swContent)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// ==========================================
// DEĞİŞİKLİK TAKİBİ VE BİLDİRİM SİSTEMİ
// ==========================================

/**
 * Sheet değişikliklerini takip eder ve loglar
 * Bu fonksiyon onEdit trigger ile otomatik çalışır
 *
 * @param {Object} e - Edit event bilgileri
 * @property {Range} range - Değiştirilen hücre aralığı
 * @property {string} value - Yeni değer
 * @property {string} oldValue - Eski değer
 * @property {Sheet} source - Değişiklik yapılan sheet
 */
function onEdit(e) {
  try {
    // Sadece belirli sheet'lerde değişiklikleri takip et
    const sheet = e.source.getActiveSheet();
    const sheetName = sheet.getName();

    // Takip edilmeyecek sheet'ler (örneğin log sheet'i)
    const excludedSheets = ['History', 'Log'];
    if (excludedSheets.includes(sheetName)) {
      return; // Bu sheet'lerde değişiklikleri takip etme
    }

    // Değişiklik bilgilerini topla
    const changeInfo = {
      timestamp: new Date().toISOString(),
      user: Session.getActiveUser().getEmail(),
      spreadsheetId: e.source.getId(),
      sheetName: sheetName,
      range: e.range.getA1Notation(),
      oldValue: e.oldValue || '',
      newValue: e.value || '',
      row: e.range.getRow(),
      column: e.range.getColumn()
    };

    // Değişiklikleri logla (merkezi veya yerel)
    logChange(changeInfo, e.source);

    console.log('📝 Değişiklik kaydedildi:', changeInfo);

  } catch (error) {
    console.error('❌ onEdit hatası:', error);
  }
}

/**
 * Değişiklik bilgilerini log sheet'ine kaydeder
 * Her spreadsheet'te kendi log'unu tutar
 *
 * @param {Object} changeInfo - Değişiklik bilgileri
 * @param {Spreadsheet} spreadsheet - Log'un kaydedileceği spreadsheet (varsayılan: aktif)
 */
function logChange(changeInfo, spreadsheet = null) {
  try {
    // Spreadsheet belirtilmemişse aktif olanı kullan
    if (!spreadsheet) {
      spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    }

    let logSheet = spreadsheet.getSheetByName('History');

    // Log sheet'i yoksa oluştur
    if (!logSheet) {
      logSheet = spreadsheet.insertSheet('History');
      // Başlıkları ekle
      logSheet.appendRow([
        'Zaman',
        'Kullanıcı',
        'Sheet Adı',
        'Hücre Aralığı',
        'Eski Değer',
        'Yeni Değer',
        'Satır',
        'Sütun'
      ]);
    }

    // Değişikliği log sheet'ine ekle
    logSheet.appendRow([
      changeInfo.timestamp,
      changeInfo.user,
      changeInfo.sheetName,
      changeInfo.range,
      changeInfo.oldValue,
      changeInfo.newValue,
      changeInfo.row,
      changeInfo.column
    ]);

  } catch (error) {
    console.error('❌ Değişiklik loglama hatası:', error);
  }
}

/**
 * Son değişiklikleri getirir (Web Push için)
 * Belirtilen spreadsheet'ten veya tümünden değişiklikleri çeker
 *
 * @param {string} spreadsheetId - Spreadsheet ID (opsiyonel, tümünden çekmek için null)
 * @param {string} sheetName - Filtrelemek için sheet adı (opsiyonel)
 * @param {number} limit - Getirilecek maksimum değişiklik sayısı
 * @returns {Array} Son değişiklikler
 */
function getRecentChanges(spreadsheetId = null, sheetName = null, limit = 10) {
  try {
    let allChanges = [];

    if (spreadsheetId) {
      // Belirli bir spreadsheet'ten çek
      const changes = getChangesFromSpreadsheet(spreadsheetId, sheetName);
      allChanges = changes;
    } else {
      // Tüm spreadsheet'lerden çek
      for (const [key, config] of Object.entries(SHEET_CONFIGS)) {
        if (config.id) { // Sadece ID'si olanlardan çek
          try {
            const changes = getChangesFromSpreadsheet(config.id, sheetName);
            allChanges = allChanges.concat(changes.map(change => ({
              ...change,
              spreadsheetKey: key,
              spreadsheetName: config.name
            })));
          } catch (error) {
            console.error(`❌ ${key} spreadsheet'ten değişiklik çekme hatası:`, error);
          }
        }
      }
    }

    // Zamana göre sırala (en yeni önce) ve limit uygula
    return allChanges
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

  } catch (error) {
    console.error('❌ Son değişiklikleri getirme hatası:', error);
    return [];
  }
}

/**
 * Belirli bir spreadsheet'ten değişiklikleri çeker
 *
 * @param {string} spreadsheetId - Spreadsheet ID
 * @param {string} sheetName - Filtrelemek için sheet adı (opsiyonel)
 * @returns {Array} Değişiklikler
 */
function getChangesFromSpreadsheet(spreadsheetId, sheetName = null) {
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const logSheet = spreadsheet.getSheetByName('History');

    if (!logSheet) {
      return [];
    }

    const data = logSheet.getDataRange().getValues();

    // Başlık satırını atla
    const changes = data.slice(1).map(row => ({
      timestamp: row[0],
      user: row[1],
      sheetName: row[2],
      range: row[3],
      oldValue: row[4],
      newValue: row[5],
      row: row[6],
      column: row[7]
    }));

    // Sheet adına göre filtrele (eğer belirtildiyse)
    let filteredChanges = changes;
    if (sheetName) {
      filteredChanges = changes.filter(change => change.sheetName === sheetName);
    }

    return filteredChanges;

  } catch (error) {
    console.error(`❌ ${spreadsheetId} spreadsheet'ten değişiklik çekme hatası:`, error);
    return [];
  }
}

/**
 * Kullanıcıların takip ettiği sheet'leri yönetir
 * localStorage alternatifi olarak Apps Script'te Properties kullanır
 *
 * @param {string} userEmail - Kullanıcı e-postası
 * @param {Array} followedSheets - Takip edilen sheet adları
 */
function setUserFollowedSheets(userEmail, followedSheets) {
  try {
    const userProps = PropertiesService.getUserProperties();
    userProps.setProperty(`followedSheets_${userEmail}`, JSON.stringify(followedSheets));
  } catch (error) {
    console.error('❌ Kullanıcı takip ayarları kaydetme hatası:', error);
  }
}

/**
 * Kullanıcının takip ettiği sheet'leri getirir
 *
 * @param {string} userEmail - Kullanıcı e-postası
 * @returns {Array} Takip edilen sheet adları
 */
function getUserFollowedSheets(userEmail) {
  try {
    const userProps = PropertiesService.getUserProperties();
    const followedSheets = userProps.getProperty(`followedSheets_${userEmail}`);
    return followedSheets ? JSON.parse(followedSheets) : [];
  } catch (error) {
    console.error('❌ Kullanıcı takip ayarları getirme hatası:', error);
    return [];
  }
}

// ==========================================
// E-POSTA BİLDİRİM SİSTEMİ (ALTERNATİF ÇÖZÜM)
// ==========================================

/**
 * E-posta bildirimleri gönder (alternatif çözüm)
 *
 * @param {string} userEmail - Bildirim gönderilecek e-posta
 * @param {Array} changes - Değişiklik listesi
 */
function sendEmailNotification(userEmail, changes) {
  try {
    if (!changes || changes.length === 0) return;

    const changeCount = changes.length;
    const firstChange = changes[0];

    const subject = `📝 ${changeCount} değişiklik yapıldı - ${firstChange.sheetName}`;

    let body = `
    <h2>Tıp Fakültesi Programında Değişiklikler</h2>

    <p><strong>${changeCount} değişiklik</strong> tespit edildi:</p>

    <ul>
    `;

    changes.slice(0, 10).forEach(change => { // İlk 10 değişikliği göster
      body += `
      <li>
        <strong>${change.sheetName}</strong> - ${change.range}<br>
        <small>Öncesi: ${change.oldValue || '(boş)'} → Sonrası: ${change.newValue || '(boş)'}</small><br>
        <small>Zaman: ${new Date(change.timestamp).toLocaleString('tr-TR')}</small>
      </li>
      `;
    });

    if (changes.length > 10) {
      body += `<li>... ve ${changes.length - 10} değişiklik daha</li>`;
    }

    body += `
    </ul>

    <p>
      <a href="${ScriptApp.getService().getUrl()}" style="background:#2c5aa0;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
        Uygulamayı Aç
      </a>
    </p>

    <hr>
    <small>Bu bildirim otomatik olarak gönderilmiştir. Tıp Fakültesi Eğitim Programı Sistemi</small>
    `;

    MailApp.sendEmail({
      to: userEmail,
      subject: subject,
      htmlBody: body
    });

    console.log(`E-posta bildirimi gönderildi: ${userEmail}`);

  } catch (error) {
    console.error('E-posta bildirim hatası:', error);
  }
}

/**
 * Kullanıcının e-posta bildirim tercihini kaydet
 *
 * @param {string} userEmail - Kullanıcı e-postası
 * @param {boolean} enabled - E-posta bildirimleri açık mı?
 */
function setUserEmailNotifications(userEmail, enabled) {
  try {
    const userProps = PropertiesService.getUserProperties();
    userProps.setProperty(`emailNotifications_${userEmail}`, enabled.toString());
  } catch (error) {
    console.error('E-posta bildirim ayarı kaydetme hatası:', error);
  }
}

/**
 * Kullanıcının e-posta bildirim tercihini al
 *
 * @param {string} userEmail - Kullanıcı e-postası
 * @returns {boolean} E-posta bildirimleri açık mı?
 */
function getUserEmailNotifications(userEmail) {
  try {
    const userProps = PropertiesService.getUserProperties();
    const setting = userProps.getProperty(`emailNotifications_${userEmail}`);
    return setting === 'true';
  } catch (error) {
    console.error('E-posta bildirim ayarı getirme hatası:', error);
    return false;
  }
}