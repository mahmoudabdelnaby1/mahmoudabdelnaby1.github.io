/**
 * APP-098: Annual Digital Marketing Budget Allocation by Quarter & Season
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-098';
  var outputsList = ["Quarterly Budget Breakdown (Q1 %, Q2 %, Q3 %, Q4 %)", "Month-by-Month Recommended Allocation Schedule", "Seasonal Peak Surges (Ramadan Surge, Summer Slump Adjustment, White November Surge)", "Interactive Quarterly Rebalancing Chart"];
  var defaultValues = {"total_annual_budget": 180000, "business_vertical": "ecommerce_mena"};

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
    var total = Math.max(1000, inp.total_annual_budget || 100000);
    var vert = inp.business_vertical || 'ecommerce_mena';

    var q1 = 0, q2 = 0, q3 = 0, q4 = 0;
    if (vert === 'ecommerce_mena') {
      q1 = total * 0.15; // Slow start post-new year
      q2 = total * 0.35; // Ramadan & Eid mega peak
      q3 = total * 0.15; // Summer travel lull
      q4 = total * 0.35; // White Friday / National Day mega peak
    } else {
      q1 = total * 0.30;
      q2 = total * 0.25;
      q3 = total * 0.15;
      q4 = total * 0.30;
    }

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'ميزانية الربع الثاني (موسم رمضان والعيد)' : 'Q2 Budget (Ramadan Peak)', val: '$' + Math.round(q2).toLocaleString() },
        { label: isAr ? 'ميزانية الربع الرابع (الجمعة البيضاء)' : 'Q4 Budget (White Friday)', val: '$' + Math.round(q4).toLocaleString() },
        { label: isAr ? 'ميزانية أرباع الصيف والهدوء (Q1 & Q3)' : 'Off-Peak Quarters (Q1 & Q3)', val: '$' + Math.round(q1 + q3).toLocaleString() }
      ],
      breakdown: [
        { label: isAr ? 'الربع الأول (Q1): إعادة التهيئة والتأسيس' : 'Q1 Allocation (15%)', val: '$' + Math.round(q1).toLocaleString() },
        { label: isAr ? 'الربع الثاني (Q2): ذروة رمضان وموسم الأعياد' : 'Q2 Allocation (35%)', val: '$' + Math.round(q2).toLocaleString() },
        { label: isAr ? 'الربع الثالث (Q3): عطلات الصيف والترويج الخفيف' : 'Q3 Allocation (15%)', val: '$' + Math.round(q3).toLocaleString() },
        { label: isAr ? 'الربع الرابع (Q4): الجمعة البيضاء ونهاية العام' : 'Q4 Allocation (35%)', val: '$' + Math.round(q4).toLocaleString() }
      ],
      alert: {
        type: 'info',
        title: isAr ? 'توزيع مالي يواكب السلوك الشرائي الإقليمي' : 'MENA Seasonal Seasonality Distribution',
        text: isAr ? 'تركيز 70% من الميزانية السنوية في الربعين الثاني والرابع يعظم المبيعات تزامناً مع أضخم مواسم التسوق في الخليج ومصر.' : 'Allocates 70% of total spend into the two dominant regional buying windows.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مخطط توزيع الميزانية التسويقية السنوية حسب المواسم وأرباع السنة' + ' (' + APP_ID + ') ===\n\n';
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
