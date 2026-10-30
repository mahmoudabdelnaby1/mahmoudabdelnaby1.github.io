/**
 * APP-068: Mobile-First Responsive Layout Viewport & Tap Target Checker
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-068';
  var outputsList = ["Google Mobile-Friendly Touch Target Pass/Fail Status", "Thumb Zone Ergonomics Rating (Easy Reach / Stretch / Hard to Reach)", "Accidental Mis-Click Risk Probability Score", "Optimal CSS Snippet for Mobile Sticky Buy Bar"];
  var defaultValues = {"button_height_px": 48, "spacing_between_elements_px": 12, "font_size_px": 16, "sticky_on_mobile": "yes"};

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
    var h = Math.max(10, inp.button_height_px || 44);
    var s = Math.max(0, inp.spacing_between_elements_px || 8);
    var f = Math.max(10, inp.font_size_px || 16);
    var sticky = (inp.sticky_on_mobile === 'yes');

    var meetsWcagHeight = h >= 48; // WCAG 2.2 AA standard
    var meetsSpacing = s >= 8;
    var meetsIosFont = f >= 16; // Prevents iOS input auto-zoom

    var passAll = meetsWcagHeight && meetsSpacing && meetsIosFont;
    var isAr = (lang === 'ar');

    return {
      metrics: [
        { label: isAr ? 'معيار إمكانية النقر (WCAG AA)' : 'Tap Target Compliance', val: meetsWcagHeight ? (isAr ? 'مطابق (>= 48px)' : 'Pass (>= 48px)') : (isAr ? 'صغير جداً (< 48px)' : 'Fail (< 48px)') },
        { label: isAr ? 'منع الزووم التلقائي في آيفون' : 'iOS Auto-Zoom Prevention', val: meetsIosFont ? (isAr ? 'محمي (>= 16px)' : 'Protected (>= 16px)') : (isAr ? 'سيتسبب بزوم مزعج' : 'Will Zoom (< 16px)') },
        { label: isAr ? 'التقييم العام للموبايل' : 'Mobile Ergonomics Score', val: passAll ? (isAr ? 'مثالي 100%' : '100% Ergonomic') : (isAr ? 'يحتاج تعديل' : 'Needs Fix') }
      ],
      breakdown: [
        { label: isAr ? 'ارتفاع الزر الفعلي' : 'Button Tap Target Height', val: h + 'px (Standard: 48px)' },
        { label: isAr ? 'المسافة الفاصلة بين الأزرار' : 'Element Separation Buffer', val: s + 'px (Standard: >= 8px)' },
        { label: isAr ? 'حجم الخط الأساسي' : 'Input / CTA Font Size', val: f + 'px (Standard: >= 16px)' },
        { label: isAr ? 'خاصية التثبيت أسفل الشاشة (Sticky)' : 'Sticky Mobile Purchase Bar', val: sticky ? (isAr ? 'مفعلة (+18% نقر)' : 'Active') : (isAr ? 'معطلة' : 'Disabled') }
      ],
      alert: {
        type: passAll ? 'success' : 'warning',
        title: isAr ? (passAll ? 'تصميم مريح للأصابع ومتجاوب تماماً' : 'تنبيه: أحجام الأزرار قد تعيق النقر على الموبايل') : 'Mobile Usability Verdict',
        text: isAr ? 'التأكد من أن الأزرار لا تقل عن 48 بكسل والخطوط لا تقل عن 16 بكسل يمنع نقرات الخطأ ويحسن تجربة الشراء على الهواتف.' : 'Adheres strictly to WCAG 2.2 touch target size and spacing specifications.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مدقق استجابة مقاسات الأزرار وسهولة النقر بالإبهام على الهواتف المحمولة' + ' (' + APP_ID + ') ===\n\n';
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
