/**
 * APP-043: MENA Social Media Character & Hook Length Truncation Tester
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-043';
  var outputsList = ["Visible Above-the-Fold Hook Text", "Hidden Below-the-Fold Text (After 'اقرأ المزيد')", "Hook Character & Line Count Analysis", "Interactive Visual Post Feed Preview (Mobile Frame with RTL)", "Hook Punchiness Score & Recommendation"];
  var defaultValues = {"post_caption": "السر الأكبر اللي يخفيه عنك خبراء الإعلانات في الخليج لخفض تكلفة النقرة CPC للنصف بدون زيادة الميزانية! تابع القراءة لمعرفة التفاصيل كاملة...", "platform": "instagram"};

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
    var caption = inp.post_caption || '';
    var plat = inp.platform || 'instagram';

    var limits = { 'instagram': 125, 'linkedin': 140, 'tiktok': 90, 'facebook': 250 };
    var limit = limits[plat] || 125;

    var visiblePart = caption.substring(0, limit);
    var hiddenPart = caption.substring(limit);
    var isTruncated = caption.length > limit;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'طول النص الظاهر' : 'Visible Chars', val: Math.min(caption.length, limit) + ' / ' + limit },
        { label: isAr ? 'إجمالي طول الكابشن' : 'Total Caption Length', val: caption.length + ' chars' },
        { label: isAr ? 'حالة القص (Truncation)' : 'Cut-off Status', val: isTruncated ? (isAr ? 'يتم قصه بـ "...المزيد"' : 'Truncated ("...more")') : (isAr ? 'ظاهر بالكامل' : 'Fully Visible') }
      ],
      breakdown: [
        { label: isAr ? 'النص الذي يراه العميل قبل النقر (Hook)' : 'Visible Hook Before Click', val: visiblePart + (isTruncated ? '... [المزيد]' : '') },
        { label: isAr ? 'النص المخفي خلف زر "...المزيد"' : 'Hidden Content Below the Fold', val: hiddenPart ? (hiddenPart.substring(0, 50) + '...') : (isAr ? 'لا يوجد نص مخفي' : 'None') },
        { label: isAr ? 'المنصة المختارة' : 'Social Platform Benchmark', val: plat.toUpperCase() + ' (~' + limit + ' chars)' }
      ],
      alert: {
        type: isTruncated ? 'warning' : 'success',
        title: isAr ? (isTruncated ? 'احرص على أن تكون الفكرة الصادمة في أول 125 حرفاً!' : 'الكابشن قصير ويظهر بالكامل') : 'Truncation Hook Verdict',
        text: isAr ? 'العميل يقرر التوقف أو التمرير خلال ثانية واحدة بناءً على الكلمات الأولى الظاهرة فقط. اجعل الفائدة واضحة قبل نقطة القص.' : 'First characters determine whether the user clicks "...more" or scrolls away.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مدقق طول الخطاف التسويقي ونقاط قطع النصوص 'اقرأ المزيد' في السوشيال ميديا' + ' (' + APP_ID + ') ===\n\n';
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
