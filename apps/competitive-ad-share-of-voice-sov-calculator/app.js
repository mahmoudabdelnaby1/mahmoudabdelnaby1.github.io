/**
 * APP-099: Competitive Ad Spend Share of Voice (SOV) & Market Share Predictor
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-099';
  var outputsList = ["Calculated Share of Voice % (SOV)", "Excess Share of Voice % (ESOV = SOV - SOM)", "Projected Annual Market Share Growth (+% / -%)", "Growth Strategy Classification (Aggressive Share Gainer / Equilibrium / Market Share Loser)", "Recommended Budget Adjustment to Gain +1% Market Share"];
  var defaultValues = {"brand_ad_spend": 40000, "total_category_ad_spend": 250000, "current_market_share_pct": 12};

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
    var brand = Math.max(0, inp.brand_ad_spend || 10000);
    var cat = Math.max(brand, inp.total_category_ad_spend || 100000);
    var ms = Math.min(100, Math.max(0, inp.current_market_share_pct || 10));

    var sov = (brand / cat) * 100;
    var esov = sov - ms; // Excess Share of Voice
    var projectedMarketShareGrowth = esov * 0.05; // Nielsen rule: 10% eSOV generates ~0.5% market share gain annually

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'حصة الظهور الإعلاني (SOV)' : 'Share of Voice (SOV %)', val: sov.toFixed(1) + '%' },
        { label: isAr ? 'فائض حصة الظهور (eSOV)' : 'Excess Share of Voice (eSOV)', val: (esov >= 0 ? '+' : '') + esov.toFixed(1) + '%' },
        { label: isAr ? 'نمو الحصة السوقية المتوقع سنوياً' : 'Projected Annual Market Share Lift', val: (projectedMarketShareGrowth >= 0 ? '+' : '') + projectedMarketShareGrowth.toFixed(2) + '%' }
      ],
      breakdown: [
        { label: isAr ? 'الإنفاق الإعلاني لعلامتك التجارية' : 'Brand Ad Spend', val: '$' + brand.toLocaleString() },
        { label: isAr ? 'إجمالي الإنفاق الإعلاني للمنافسين بالقطاع' : 'Total Category Ad Spend', val: '$' + cat.toLocaleString() },
        { label: isAr ? 'الحصة السوقية الحالية من المبيعات' : 'Current Market Share %', val: ms + '%' },
        { label: isAr ? 'فائض حصة الصوت الإعلانية (eSOV)' : 'Excess Share of Voice (eSOV)', val: (esov >= 0 ? '+' : '') + esov.toFixed(1) + '%' }
      ],
      alert: {
        type: esov > 0 ? 'success' : 'warning',
        title: isAr ? (esov > 0 ? 'فائض ظهور إيجابي يضمن التوسع واقتناص حصة المنافسين' : 'حصة صوت سلبية تؤدي لتراجع المبيعات لصالح المنافسين') : 'Share of Voice Verdict',
        text: isAr ? (esov > 0 ? 'عندما تتجاوز حصة إعلاناتك حصتك السوقية (eSOV > 0)، تنمو حصتك السوقية باطراد وفق قانون نيلسن وبينيت-فيلد.' : 'المنافسون ينفقون بنسبة أعلى من حصتك، مما يهدد بتآكل مبيعاتك تدريجياً.') : 'eSOV is the primary empirical driver of long-term market share trajectory.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة حصة الصوت الإعلاني SOV ومقارنتها بالحصة السوقية للمنافسين' + ' (' + APP_ID + ') ===\n\n';
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
