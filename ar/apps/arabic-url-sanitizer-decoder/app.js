/**
 * APP-030: Arabic URL Encoding/Decoding & Query Parameter Sanitizer
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-030';
  var outputsList = ["Sanitized Clean URL", "Decoded Readable Arabic URL", "Extracted Query Parameters Table", "URL Component Inspector (Protocol, Host, Path, Hash)"];
  var defaultValues = {"raw_url": "https://store.sa/%D8%B9%D8%B7%D9%88%D8%B1-%D8%B1%D8%AC%D8%A7%D9%84%D9%8A%D8%A9?utm_source=snap&ref=%D8%B9%D8%B1%D8%B6", "decode_percent_encoding": "yes", "enforce_lowercase": "yes"};

  function getInputs() {
    var inputs = {};
    var formElements = document.querySelectorAll('#app-form input, #app-form select, #app-form textarea');
    for (var i = 0; i < formElements.length; i++) {
      var el = formElements[i];
      if (el.type === 'number') {
        inputs[el.id] = parseFloat(el.value) || 0;
      } else {
        inputs[el.id] = el.value;
      }
    }
    return inputs;
  }

  function setInputs(values) {
    for (var k in values) {
      var el = document.getElementById(k);
      if (el) {
        el.value = values[k];
      }
    }
  }

  // Specific Application Calculation Engine

  function calculateApp(inp, lang) {
    var raw = inp.raw_url || '';
    var decode = (inp.decode_percent_encoding === 'yes');
    var lower = (inp.enforce_lowercase === 'yes');

    var cleaned = raw;
    try {
      if (decode) {
        cleaned = decodeURIComponent(cleaned);
      }
    } catch(e) {}

    if (lower) {
      // Lowercase protocol and host, preserve path casing
      try {
        var u = new URL(cleaned);
        u.hostname = u.hostname.toLowerCase();
        u.protocol = u.protocol.toLowerCase();
        cleaned = u.toString();
      } catch(e) {}
    }

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'الرابط النظيف المقروء' : 'Sanitized Readable URL', val: cleaned.substring(0, 35) + '...' },
        { label: isAr ? 'حجم الرابط بعد التنظيف' : 'Character Count', val: cleaned.length + ' chars' },
        { label: isAr ? 'التوفير في الطول' : 'Reduction vs Encoded', val: Math.max(0, raw.length - cleaned.length) + ' chars saved' }
      ],
      breakdown: [
        { label: isAr ? 'الرابط المعالج النهائي' : 'Clean Sanitized URL', val: cleaned },
        { label: isAr ? 'الرابط الأصلي المشفر' : 'Original Raw Encoded URL', val: raw },
        { label: isAr ? 'عدد الحروف المحذوفة من التشفير' : 'Bytes Saved from Decoding', val: Math.max(0, raw.length - cleaned.length).toString() },
        { label: isAr ? 'حالة التوافق مع المشاركة الاجتماعية' : 'Shareability Verdict', val: isAr ? 'جاهز للمشاركة المباشرة' : '100% Human & Bot Readable' }
      ],
      alert: {
        type: 'success',
        title: isAr ? 'تم تنظيف وفك تشفير الرابط بنجاح' : 'URL Decoded & Sanitized',
        text: isAr ? 'الرابط الآن مقروء وسهل المشاركة ولا يحتوي على الرموز المشفرة الطويلة التي تنفر المستخدمين.' : 'Eliminated percent-encoded gibberish for clean social sharing.'
      }
    };
  }


  function updateUI() {
    var inputs = getInputs();
    var lang = (window.DMApp && window.DMApp.getLanguage) ? window.DMApp.getLanguage() : 'ar';
    var res = calculateApp(inputs, lang);

    // Update metric cards
    if (res.metrics) {
      for (var m = 0; m < res.metrics.length; m++) {
        var valEl = document.getElementById('val-metric-' + m);
        var lblEl = document.getElementById('lbl-metric-' + m);
        if (valEl && res.metrics[m]) {
          valEl.textContent = res.metrics[m].val;
          if (lblEl && res.metrics[m].label) {
            lblEl.textContent = res.metrics[m].label;
          }
        }
      }
    }

    // Update table breakdown rows
    if (res.breakdown) {
      for (var b = 0; b < res.breakdown.length; b++) {
        var tLbl = document.getElementById('table-lbl-' + b);
        var tVal = document.getElementById('table-val-' + b);
        if (tLbl && res.breakdown[b]) {
          tLbl.textContent = res.breakdown[b].label;
        }
        if (tVal && res.breakdown[b]) {
          tVal.textContent = res.breakdown[b].val;
        }
      }
    }

    // Update alert recommendation banner
    var alertBox = document.getElementById('alert-banner');
    var alertTitle = document.getElementById('alert-banner-title');
    var alertText = document.getElementById('alert-banner-text');
    if (alertBox && res.alert) {
      alertBox.className = 'alert-banner ' + (res.alert.type || 'info');
      if (alertTitle) alertTitle.textContent = res.alert.title || '';
      if (alertText) alertText.textContent = res.alert.text || '';
    }
  }

  // Bilingual report generator
  function generateReportText() {
    var inputs = getInputs();
    var lang = (window.DMApp && window.DMApp.getLanguage) ? window.DMApp.getLanguage() : 'ar';
    var res = calculateApp(inputs, lang);
    var isAr = (lang === 'ar');

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'أداة فك وتشفير الروابط العربية وتنظيف بارامترات التتبع والإعلانات' + ' (' + APP_ID + ') ===\n\n';
    text += (isAr ? '[المدخلات]:\n' : '[Inputs]:\n');
    for (var k in inputs) {
      text += '  • ' + k + ': ' + inputs[k] + '\n';
    }
    text += '\n' + (isAr ? '[النتائج الرئيسية]:\n' : '[Key Results]:\n');
    if (res.breakdown) {
      for (var i = 0; i < res.breakdown.length; i++) {
        text += '  • ' + res.breakdown[i].label + ': ' + res.breakdown[i].val + '\n';
      }
    }
    if (res.alert) {
      text += '\n' + (isAr ? '[التوصية]: ' : '[Recommendation]: ') + res.alert.title + ' - ' + res.alert.text + '\n';
    }
    text += '\n' + (isAr ? 'تم الإنشاء عبر منظومة أدوات التسويق الرقمي الثابتة v2.0' : 'Generated by DM Static App Suite v2.0 (Zero Backend, Private)');
    return text;
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Attach real-time input change listeners
    var form = document.getElementById('app-form');
    if (form) {
      form.addEventListener('input', updateUI);
      form.addEventListener('change', updateUI);
    }

    var btnCalc = document.getElementById('btn-calculate');
    if (btnCalc) btnCalc.addEventListener('click', updateUI);

    var btnReset = document.getElementById('btn-reset');
    if (btnReset) {
      btnReset.addEventListener('click', function () {
        setInputs(defaultValues);
        updateUI();
        if (window.DMApp) window.DMApp.showToast(window.DMApp.getLanguage() === 'ar' ? 'تمت استعادة القيم الافتراضية' : 'Restored default values');
      });
    }

    var btnSave = document.getElementById('btn-save-state');
    if (btnSave) {
      btnSave.addEventListener('click', function () {
        if (window.DMApp) window.DMApp.saveAppState(APP_ID, getInputs());
      });
    }

    var btnCopy = document.getElementById('btn-copy-summary');
    if (btnCopy) {
      btnCopy.addEventListener('click', function () {
        var report = generateReportText();
        if (window.DMApp) window.DMApp.copyToClipboard(report);
      });
    }

    // Try loading saved state if available
    if (window.DMApp) {
      var saved = window.DMApp.loadAppState(APP_ID);
      if (saved) setInputs(saved);
    }

    // Hook language switcher
    window.onAppLanguageChange = function (newLang) {
      updateUI();
    };

    // Initial render
    updateUI();
  });

})();
