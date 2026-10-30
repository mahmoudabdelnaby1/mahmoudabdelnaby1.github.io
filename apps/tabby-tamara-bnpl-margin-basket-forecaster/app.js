/**
 * APP-014: Tabby & Tamara BNPL Net Margin & Basket Size Forecaster
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-014';
  var outputsList = ["Net Profit per Order (Standard vs BNPL)", "Incremental Profit Dollar/SAR Gain per BNPL Order", "Minimum AOV Increase Required to Justify BNPL Fees", "BNPL Viability Verdict (Recommended / Marginal / Profit Drain)"];
  var defaultValues = {"standard_aov": 320, "standard_conversion_rate_pct": 2.1, "gross_margin_pct": 48, "bnpl_take_rate_pct": 6.5, "expected_aov_lift_pct": 35, "expected_conversion_lift_pct": 20};

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
    var stdAov = Math.max(1, inp.standard_aov || 200);
    var margin = Math.min(100, Math.max(1, inp.gross_margin_pct || 40));
    var bnplRate = Math.min(20, Math.max(0, inp.bnpl_take_rate_pct || 6.5));
    var aovLift = Math.max(0, inp.expected_aov_lift_pct || 30);

    var newAov = stdAov * (1 + (aovLift / 100));
    var stdProfit = stdAov * (margin / 100);
    var bnplFee = (newAov * (bnplRate / 100)) + 1.5;
    var bnplProfit = (newAov * (margin / 100)) - bnplFee;
    var incrementalProfit = bnplProfit - stdProfit;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'سلة التقسيط المتوقعة (AOV Lift)' : 'Projected BNPL Basket AOV', val: newAov.toFixed(2) + ' SAR/AED' },
        { label: isAr ? 'الربح الصافي الإضافي لكل طلب' : 'Incremental Profit per Order', val: (incrementalProfit >= 0 ? '+' : '') + incrementalProfit.toFixed(2) + ' SAR/AED' },
        { label: isAr ? 'عمولة التقسيط المخصومة' : 'Total BNPL Fee per Order', val: bnplFee.toFixed(2) + ' SAR/AED' }
      ],
      breakdown: [
        { label: isAr ? 'متوسط السلة بدون تقسيط' : 'Standard Cash/Card AOV', val: stdAov.toFixed(2) },
        { label: isAr ? 'متوسط السلة مع تابي/تمارا (+ ' + aovLift + '%)' : 'Lifted BNPL Basket Size', val: newAov.toFixed(2) },
        { label: isAr ? 'عمولة تابي/تمارا (' + bnplRate + '% + 1.5)' : 'Total BNPL Merchant Deduction', val: bnplFee.toFixed(2) },
        { label: isAr ? 'صافي ربح الطلب مع التقسيط' : 'Net Profit per BNPL Order', val: bnplProfit.toFixed(2) },
        { label: isAr ? 'الجدوى الاقتصادية لاعتماد التقسيط' : 'Economic Feasibility Verdict', val: (incrementalProfit > 0 ? (isAr ? 'مربحة للغاية وترفع الأرباح' : 'Highly Accretive to Profit') : (isAr ? 'غير مربحة وتستنزف الهامش' : 'Margin Dilutive')) }
      ],
      alert: {
        type: incrementalProfit > 0 ? 'success' : 'danger',
        title: isAr ? (incrementalProfit > 0 ? 'قرار معتمد: تابي/تمارا تزيد الأرباح' : 'تحذير: عمولة التقسيط تبتلع هامش الربح') : (incrementalProfit > 0 ? 'BNPL Accretive Verdict' : 'Margin Erosion Warning'),
        text: isAr ? (incrementalProfit > 0 ? 'الزيادة في حجم السلة (+ ' + aovLift + '%) تعوض عمولة تابي وتمارا وتولد ربحاً صافياً إضافياً قدره ' + incrementalProfit.toFixed(2) + ' لكل طلب.' : 'هامش ربح المنتج ضعيف جداً ولا يتحمل عمولة الـ ' + bnplRate + '%. ارفع السعر أولاً.') : (incrementalProfit > 0 ? 'AOV expansion cleanly offsets BNPL fees.' : 'Margin is too thin for 6%+ take rate.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة صافي هامش الربح بعد خصم رسوم تابي وتمارا مقابل زيادة سلة الشراء' + ' (' + APP_ID + ') ===\n\n';
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
