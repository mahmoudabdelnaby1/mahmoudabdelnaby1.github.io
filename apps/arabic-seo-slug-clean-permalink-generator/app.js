/**
 * APP-021: Arabic SEO Slug & Clean Permalinks Converter
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-021';
  var outputsList = ["Clean Normalized SEO Slug", "Full Canonical URL Preview", "Percent-Encoded Length Comparison", "Character & Byte Count Verification"];
  var defaultValues = {"arabic_title": "أفضل 10 استراتيجيات لزيادة مبيعات المتاجر الإلكترونية في السعودية 2026", "mode": "arabic", "remove_arabic_stop_words": "yes"};

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
    var rawTitle = inp.arabic_title || '';
    var mode = inp.mode || 'arabic';
    var rmStop = (inp.remove_arabic_stop_words === 'yes');

    // 1. Strip Tashkeel
    var clean = rawTitle.replace(/[\u064B-\u065F\u0670]/g, '');
    // Normalize Alef, Yaa, Taa Marbuta
    clean = clean.replace(/[إأآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
    // Remove non-alphanumeric except spaces
    clean = clean.replace(/[^\w\s\u0600-\u06FF-]/g, ' ');

    var words = clean.trim().split(/\s+/);
    var stopWords = ['في', 'من', 'الي', 'علي', 'عن', 'مع', 'هذا', 'هذه', 'ان', 'او', 'ثم', 'حتي', 'كل', 'ذلك', 'كان'];

    if (rmStop) {
      words = words.filter(function(w) { return stopWords.indexOf(w) === -1 && w.length > 0; });
    }

    var slug = '';
    if (mode === 'arabic') {
      slug = words.join('-').toLowerCase();
    } else {
      // Basic transliteration
      var map = { 'ا':'a', 'ب':'b', 'ت':'t', 'ث':'th', 'ج':'j', 'ح':'h', 'خ':'kh', 'د':'d', 'ذ':'th', 'ر':'r', 'ز':'z', 'س':'s', 'ش':'sh', 'ص':'s', 'ض':'d', 'ط':'t', 'ظ':'z', 'ع':'3', 'غ':'gh', 'ف':'f', 'ق':'q', 'ك':'k', 'ل':'l', 'م':'m', 'ن':'n', 'ه':'h', 'و':'w', 'ي':'y' };
      slug = words.map(function(w) {
        return w.split('').map(function(ch) { return map[ch] || ch; }).join('');
      }).join('-').toLowerCase();
    }
    slug = slug.replace(/--+/g, '-').replace(/^-|-$/g, '');

    var encoded = encodeURIComponent(slug);
    var isAr = (lang === 'ar');

    return {
      metrics: [
        { label: isAr ? 'الرابط الدائم المولد (Slug)' : 'Generated Clean Slug', val: slug || 'none' },
        { label: isAr ? 'طول الرابط (حرف)' : 'Character Length', val: slug.length + ' chars' },
        { label: isAr ? 'طول الرابط المشفر %' : 'Percent-Encoded Bytes', val: encoded.length + ' bytes' }
      ],
      breakdown: [
        { label: isAr ? 'السلاج النظيف المعياري' : 'Clean Normalized SEO Slug', val: slug },
        { label: isAr ? 'معاينة الرابط الكامل' : 'Full Canonical URL Preview', val: 'https://example.com/blog/' + slug },
        { label: isAr ? 'المقارنة مع الرابط المشفر' : 'Percent-Encoded Length', val: encoded.substring(0, 45) + '... (' + encoded.length + ' bytes)' },
        { label: isAr ? 'عدد الكلمات الفعالة بعد الفلترة' : 'Filtered Keyword Count', val: words.length + ' ' + (isAr?'كلمات':'words') }
      ],
      alert: {
        type: slug.length <= 65 ? 'success' : 'warning',
        title: isAr ? 'توافق تام مع معايير جوجل' : 'Google SEO Friendly',
        text: isAr ? (slug.length <= 65 ? 'رابط مثالي وخالٍ من الرموز المشفرة (%D9) وسهل القراءة للمستخدم ومحركات البحث.' : 'الرابط طويل نسبياً (أكثر من 65 حرفاً). يُفضل تقصيره لتركيز الكلمات المفتاحية.') : 'Clean URL without ugly percent encodings.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'محول الروابط الدائمة للغة العربية ومولد سلاج SEO بدون رموز مشفرة' + ' (' + APP_ID + ') ===\n\n';
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
