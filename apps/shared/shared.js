/**
 * DM STATIC APP SUITE - SHARED CLIENT UTILITIES (SHARED.JS)
 * Zero Backend, Zero External Dependencies, 100% Client-Side
 */

(function () {
  'use strict';

  // Global State
  var currentLang = 'ar'; // Default Arabic for MENA suite

  // Check saved preference or URL param
  try {
    var savedLang = localStorage.getItem('dm_app_lang');
    if (savedLang === 'en' || savedLang === 'ar') {
      currentLang = savedLang;
    }
  } catch (e) {
    // LocalStorage disabled or sandboxed
  }

  // Set initial document attributes
  function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

    // Update all elements with data-en and data-ar
    var i18nElements = document.querySelectorAll('[data-en][data-ar]');
    for (var i = 0; i < i18nElements.length; i++) {
      var el = i18nElements[i];
      var text = el.getAttribute('data-' + lang);
      if (text !== null) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          if (el.getAttribute('placeholder')) {
            el.placeholder = text;
          }
        } else {
          el.textContent = text;
        }
      }
    }

    // Update language toggle button text
    var toggleBtn = document.getElementById('lang-toggle-btn');
    if (toggleBtn) {
      toggleBtn.textContent = (lang === 'ar') ? 'English' : 'عربي';
      toggleBtn.setAttribute('aria-label', (lang === 'ar') ? 'Switch to English' : 'التحويل للعربية');
    }

    // Notify active app logic if listener exists
    if (typeof window.onAppLanguageChange === 'function') {
      window.onAppLanguageChange(lang);
    }

    try {
      localStorage.setItem('dm_app_lang', lang);
    } catch (e) {}
  }

  // Toast Notification
  function showToast(message) {
    var toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 2800);
  }

  // Copy to Clipboard
  function copyToClipboard(text, successMsg) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast(successMsg || (currentLang === 'ar' ? 'تم النسخ للحافظة بنجاح' : 'Copied to clipboard successfully'));
      }).catch(function () {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast(successMsg || (currentLang === 'ar' ? 'تم النسخ للحافظة بنجاح' : 'Copied to clipboard successfully'));
    } catch (err) {
      showToast(currentLang === 'ar' ? 'فشل النسخ التلقائي' : 'Failed to copy');
    }
    document.body.removeChild(textarea);
  }

  // Formatting Utilities
  function formatNumber(val, decimals) {
    if (val === null || val === undefined || isNaN(val)) return '0';
    var d = (decimals !== undefined) ? decimals : 2;
    return Number(val).toLocaleString(currentLang === 'ar' ? 'ar-EG' : 'en-US', {
      minimumFractionDigits: d,
      maximumFractionDigits: d
    });
  }

  function formatCurrency(val, currencyCode) {
    if (val === null || val === undefined || isNaN(val)) return '0';
    var formattedNum = formatNumber(val, 2);
    var symbols = {
      'EGP': { ar: 'ج.م', en: 'EGP' },
      'SAR': { ar: 'ر.س', en: 'SAR' },
      'AED': { ar: 'د.إ', en: 'AED' },
      'KWD': { ar: 'د.ك', en: 'KWD' },
      'QAR': { ar: 'ر.ق', en: 'QAR' },
      'USD': { ar: '$', en: '$' }
    };
    var curr = symbols[currencyCode] || { ar: currencyCode, en: currencyCode };
    var sym = (currentLang === 'ar') ? curr.ar : curr.en;
    return formattedNum + ' ' + sym;
  }

  function formatPercent(val, decimals) {
    if (val === null || val === undefined || isNaN(val)) return '0%';
    var d = (decimals !== undefined) ? decimals : 1;
    return formatNumber(val, d) + '%';
  }

  // Safe Local Storage Wrapper (Strictly Device-Only)
  function saveAppState(appId, data) {
    try {
      localStorage.setItem('dm_state_' + appId, JSON.stringify(data));
      showToast(currentLang === 'ar' ? 'تم الحفظ في المتصفح محلياً (لا يتم رفعه لأي خادم)' : 'Saved to browser local storage (never uploaded)');
    } catch (e) {
      showToast(currentLang === 'ar' ? 'تعذر الحفظ في المتصفح' : 'Could not access local storage');
    }
  }

  function loadAppState(appId) {
    try {
      var item = localStorage.getItem('dm_state_' + appId);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  }

  function clearAppState(appId) {
    try {
      localStorage.removeItem('dm_state_' + appId);
      showToast(currentLang === 'ar' ? 'تم مسح البيانات المحفوظة من المتصفح' : 'Cleared saved browser data');
    } catch (e) {}
  }

  // Initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function () {
    applyLanguage(currentLang);

    var toggleBtn = document.getElementById('lang-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function (e) {
        e.preventDefault();
        applyLanguage(currentLang === 'ar' ? 'en' : 'ar');
      });
    }
  });

  // Export public API
  window.DMApp = {
    getLanguage: function () { return currentLang; },
    setLanguage: applyLanguage,
    showToast: showToast,
    copyToClipboard: copyToClipboard,
    formatNumber: formatNumber,
    formatCurrency: formatCurrency,
    formatPercent: formatPercent,
    saveAppState: saveAppState,
    loadAppState: loadAppState,
    clearAppState: clearAppState
  };

})();
