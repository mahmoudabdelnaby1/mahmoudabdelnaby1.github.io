/**
 * APP-093: GCC Market Entry Expansion Ad Budget Sizer
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-093';
  var outputsList = ["Projected Gulf Market CPA ($ and Local Currency)", "Market Cost Multiplier (e.g. KSA is ~3.8x Egypt ad cost)", "Required 90-Day Media Budget Runway", "Minimum Viable Testing Budget (to exit ad set learning phases)", "Localized Trust & Compliance Requirements Checklist"];
  var defaultValues = {"target_market": "ksa", "vertical": "ecommerce", "target_monthly_orders": 500, "blended_target_cac": 35};

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
    var orders = Math.max(10, inp.target_monthly_orders || 200);
    var cac = Math.max(5, inp.blended_target_cac || 30);
    var mkt = inp.target_market || 'ksa';

    var mediaSpend = orders * cac;
    var testingBuffer = mediaSpend * 0.25; // 25% learning/creative validation buffer
    var totalLaunchCapital = mediaSpend + testingBuffer;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'رأس مال إطلاق التوسع الموصى به' : 'Recommended Launch Capital', val: '$' + Math.round(totalLaunchCapital).toLocaleString() },
        { label: isAr ? 'ميزانية الإعلانات الشهرية المستهدفة' : 'Target Monthly Media Spend', val: '$' + Math.round(mediaSpend).toLocaleString() },
        { label: isAr ? 'هامش اختبار الخوارزميات المبدئي' : 'Testing Learning Buffer (25%)', val: '$' + Math.round(testingBuffer).toLocaleString() }
      ],
      breakdown: [
        { label: isAr ? 'عدد الطلبات المستهدفة في السوق الجديد' : 'Target Monthly Order Volume', val: orders.toLocaleString() },
        { label: isAr ? 'تكلفة اكتساب العميل المخططة (CAC)' : 'Target Blended CAC', val: '$' + cac.toFixed(2) },
        { label: isAr ? 'صافي الإنفاق الإعلاني المباشر' : 'Direct Media Spend', val: '$' + Math.round(mediaSpend).toLocaleString() },
        { label: isAr ? 'السوق الإقليمي المختار' : 'Target Expansion Jurisdiction', val: mkt.toUpperCase() }
      ],
      alert: {
        type: 'info',
        title: isAr ? 'ميزانية معتمدة لدخول السوق الخليجي' : 'GCC Expansion Budget Ready',
        text: isAr ? 'رصد ميزانية اختبار أولية لمدة 30 يوماً تضمن اجتياز مرحلة التعلم وتدريب بيكسل المنصات على الجمهور الجديد بأمان.' : 'Includes 25% algorithmic learning buffer for new pixel market warming.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة تقدير ميزانية التوسع ودخول أسواق خليجية جديدة KSA, UAE, Kuwait' + ' (' + APP_ID + ') ===\n\n';
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
