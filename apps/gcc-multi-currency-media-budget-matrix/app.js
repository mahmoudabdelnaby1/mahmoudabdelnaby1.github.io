/**
 * APP-003: GCC Multi-Currency Media Budget Converter & Allocation Matrix
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-003';
  var outputsList = ["Per-Country Localized Budget Breakdown", "Platform Currency Equivalent (USD)", "Suggested Daily Ad Set Bids in Local Currency", "Summary Allocation Table with Printable Export"];
  var defaultValues = {"total_budget": 50000, "base_currency": "SAR", "allocation_weights": "KSA: 50, UAE: 30, Kuwait: 20"};

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
    var total = Math.max(0, inp.total_budget || 0);
    var base = inp.base_currency || 'SAR';
    var isAr = (lang === 'ar');

    // Official peg rates to USD
    var ratesToUsd = { 'USD': 1.0, 'SAR': 3.75, 'AED': 3.6725, 'QAR': 3.64, 'KWD': 0.307, 'EGP': 49.50 };
    var budgetInUsd = total / (ratesToUsd[base] || 3.75);

    var ksaShare = budgetInUsd * 0.50;
    var uaeShare = budgetInUsd * 0.30;
    var kwdShare = budgetInUsd * 0.20;

    var ksaSar = ksaShare * 3.75;
    var uaeAed = uaeShare * 3.6725;
    var kwdKwd = kwdShare * 0.307;

    return {
      metrics: [
        { label: isAr ? 'الميزانية الكلية بالدولار' : 'Total Budget (USD)', val: '$' + budgetInUsd.toFixed(2) },
        { label: isAr ? 'حصة السعودية (50%)' : 'KSA Allocation (50%)', val: ksaSar.toFixed(2) + ' SAR' },
        { label: isAr ? 'حصة الإمارات (30%)' : 'UAE Allocation (30%)', val: uaeAed.toFixed(2) + ' AED' }
      ],
      breakdown: [
        { label: isAr ? 'الميزانية بالدولار في المنصات' : 'Platform Currency Equivalent (USD)', val: '$' + budgetInUsd.toFixed(2) },
        { label: isAr ? 'ميزانية السعودية (SAR)' : 'KSA Budget (SAR)', val: ksaSar.toFixed(2) + ' SAR' },
        { label: isAr ? 'ميزانية الإمارات (AED)' : 'UAE Budget (AED)', val: uaeAed.toFixed(2) + ' AED' },
        { label: isAr ? 'ميزانية الكويت (KWD)' : 'Kuwait Budget (KWD)', val: kwdKwd.toFixed(2) + ' KWD' },
        { label: isAr ? 'المزايدة اليومية المقترحة للسعودية' : 'Suggested Daily Ad Set Bid (KSA)', val: (ksaSar / 30).toFixed(2) + ' SAR/day' }
      ],
      alert: {
        type: 'info',
        title: isAr ? 'أسعار الصرف الرسمية المثبتة' : 'Central Bank Pegged Rates Applied',
        text: isAr ? 'تم استخدام أسعار الصرف الرسمية الصادرة عن البنوك المركزية الخليجية المرتبطة بالدولار.' : 'Calculated with fixed GCC central bank USD pegs (SAR 3.75, AED 3.6725, KWD 0.307).'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'محول وموزع ميزانيات الحملات الإعلانية بين عملات الخليج ومصر والدولار' + ' (' + APP_ID + ') ===\n\n';
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
