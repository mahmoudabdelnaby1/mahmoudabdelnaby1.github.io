/**
 * APP-080: Return on Marketing Investment (ROMI) & Net Profit Modeler
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-080';
  var outputsList = ["Gross Profit Generated from Marketing", "Total Fully-Loaded Marketing Expenses", "Net Profit Added to Business Bottom-Line", "True ROMI Percentage % (e.g. +145% Return)", "Comparison: Platform Reported ROAS vs True Enterprise ROMI"];
  var defaultValues = {"marketing_investment": 30000, "gross_revenue_generated": 140000, "product_cogs_pct": 38, "operating_overhead_pct": 15, "tax_vat_rate_pct": 15};

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
    var mkt = Math.max(1, inp.marketing_investment || 10000);
    var rev = Math.max(1, inp.gross_revenue_generated || 50000);
    var cogsPct = Math.min(90, Math.max(0, inp.product_cogs_pct || 40)) / 100;
    var opexPct = Math.min(50, Math.max(0, inp.operating_overhead_pct || 15)) / 100;

    var cogs = rev * cogsPct;
    var opex = rev * opexPct;
    var netProfitBeforeMkt = rev - cogs - opex;
    var finalNetProfit = netProfitBeforeMkt - mkt;
    var romi = (finalNetProfit / mkt) * 100;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'العائد الحقيقي على الاستثمار التسويقي (ROMI)' : 'True ROMI %', val: (romi >= 0 ? '+' : '') + romi.toFixed(1) + '%' },
        { label: isAr ? 'صافي الربح الفعلي بعد كل التكاليف' : 'Final True Net Profit', val: '$' + finalNetProfit.toLocaleString() },
        { label: isAr ? 'الربح الصافي لكل دولار تسويقي' : 'Net Cash per $ Spent', val: '$' + (finalNetProfit / mkt).toFixed(2) }
      ],
      breakdown: [
        { label: isAr ? 'إجمالي المبيعات المحققة' : 'Gross Generated Revenue', val: '$' + rev.toLocaleString() },
        { label: isAr ? 'تكلفة البضاعة المباعة (COGS)' : 'Product Costs (COGS)', val: '$' + cogs.toLocaleString() },
        { label: isAr ? 'المصاريف التشغيلية والإدارية' : 'Operating Overheads', val: '$' + opex.toLocaleString() },
        { label: isAr ? 'الميزانية التسويقية المنفقة' : 'Total Marketing Outlay', val: '$' + mkt.toLocaleString() },
        { label: isAr ? 'صافي الربح الحقيقي المتبقي في الشركة' : 'Final Bottom-Line Net Profit', val: '$' + finalNetProfit.toLocaleString() }
      ],
      alert: {
        type: romi > 0 ? 'success' : 'danger',
        title: isAr ? ('مؤشر ROMI: ' + romi.toFixed(1) + '%') : ('True ROMI: ' + romi.toFixed(1) + '%'),
        text: isAr ? (romi > 0 ? 'التسويق يولد ربحاً صافياً حقيقياً بعد احتساب البضاعة والمصاريف والضرائب.' : 'التسويق يحقق مبيعات شكلية ولكن بعد خصم البضاعة والمصاريف تتكبد الشركة خسائر.') : 'True ROMI accounts for full COGS and operations.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة العائد الحقيقي على الاستثمار التسويقي ROMI بعد خصم نفقات الفريق والأدوات' + ' (' + APP_ID + ') ===\n\n';
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
