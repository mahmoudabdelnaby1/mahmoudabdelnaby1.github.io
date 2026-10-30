/**
 * APP-010: Ramadan Ad Auction Bid Surge & CPM Inflation Compensator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-010';
  var outputsList = ["Week-by-Week Projected CPM (Pre-Ramadan, Week 1-2, Week 3-4, Eid Al-Fitr)", "Optimal Budget Allocation Percentage per Phase", "Estimated Impression Volume Accounting for Inflation", "Dayparting Bid Adjustments (Post-Iftar & Suhoor peak window guidance)"];
  var defaultValues = {"baseline_cpm": 4.5, "total_campaign_budget": 25000, "target_market": "ksa", "primary_channel": "meta"};

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
    var baseCpm = Math.max(0.1, inp.baseline_cpm || 4.5);
    var budget = Math.max(100, inp.total_campaign_budget || 10000);

    var cpmW1 = baseCpm * 1.15;
    var cpmW2 = baseCpm * 1.45;
    var cpmW3_4 = baseCpm * 1.90;
    var cpmEid = baseCpm * 1.30;

    var totalImpressions = (budget * 0.15 / cpmW1 * 1000) + (budget * 0.25 / cpmW2 * 1000) + (budget * 0.45 / cpmW3_4 * 1000) + (budget * 0.15 / cpmEid * 1000);

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'ذروة الـ CPM (العشر الأواخر)' : 'Peak CPM (Last 10 Days)', val: '$' + cpmW3_4.toFixed(2) },
        { label: isAr ? 'إجمالي الظهور المتوقع' : 'Estimated Impressions', val: Math.round(totalImpressions).toLocaleString() },
        { label: isAr ? 'ميزانية ذروة الهدايا (45%)' : 'Late Ramadan Budget (45%)', val: '$' + (budget * 0.45).toFixed(0) }
      ],
      breakdown: [
        { label: isAr ? 'الـ CPM المتوقع: ما قبل رمضان (15%)' : 'Projected CPM: Pre-Ramadan (15%)', val: '$' + cpmW1.toFixed(2) + ' (Budget: $' + (budget*0.15).toFixed(0) + ')' },
        { label: isAr ? 'الـ CPM المتوقع: الأسبوع 1-2 (25%)' : 'Projected CPM: Weeks 1-2 (25%)', val: '$' + cpmW2.toFixed(2) + ' (Budget: $' + (budget*0.25).toFixed(0) + ')' },
        { label: isAr ? 'الـ CPM المتوقع: ذروة هدايا العيد (45%)' : 'Projected CPM: Late Gifting Peak (45%)', val: '$' + cpmW3_4.toFixed(2) + ' (Budget: $' + (budget*0.45).toFixed(0) + ')' },
        { label: isAr ? 'الـ CPM المتوقع: أيام عيد الفطر (15%)' : 'Projected CPM: Eid Al-Fitr (15%)', val: '$' + cpmEid.toFixed(2) + ' (Budget: $' + (budget*0.15).toFixed(0) + ')' },
        { label: isAr ? 'ساعات المزايدة الذهبية (Dayparting)' : 'Prime Dayparting Window', val: (isAr ? 'من 9 مساءً إلى 3:30 صباحاً (بين الإفطار والسحور)' : '9:00 PM to 3:30 AM (Post-Iftar to Suhoor)') }
      ],
      alert: {
        type: 'warning',
        title: isAr ? 'تضخم الأسعار في موسم رمضان' : 'Seasonal Auction Surge',
        text: isAr ? 'يرتفع الـ CPM بنسبة تصل إلى +90% في العشر الأواخر من رمضان. اضبط عروض الأسعار وركز ميزانيتك في ساعات ما بعد الإفطار والسحور.' : 'CPM surges by up to +90% in late Ramadan. Heavily concentrate delivery between 9pm and 3am.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة تضخم أسعار إعلانات CPM في موسم رمضان وتعديل ميزانيات الحملات' + ' (' + APP_ID + ') ===\n\n';
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
