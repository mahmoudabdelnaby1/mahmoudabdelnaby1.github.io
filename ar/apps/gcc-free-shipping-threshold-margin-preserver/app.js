/**
 * APP-012: GCC Free Shipping Threshold & Margin Preserver
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-012';
  var outputsList = ["Recommended Free Shipping Threshold (SAR/AED/EGP)", "Required Basket Size Uplift (+% to reach threshold)", "Net Profit per Order at the Threshold", "Threshold Comparison Matrix (Conservative / Balanced / Aggressive)"];
  var defaultValues = {"current_aov": 180, "gross_margin_pct": 45, "actual_shipping_cost_paid_to_courier": 25, "proposed_free_shipping_threshold": 250};

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
    var aov = Math.max(1, inp.current_aov || 100);
    var margin = Math.min(100, Math.max(1, inp.gross_margin_pct || 40));
    var shipCost = Math.max(0, inp.actual_shipping_cost_paid_to_courier || 20);
    var threshold = Math.max(aov, inp.proposed_free_shipping_threshold || 200);

    var optimalThreshold = Math.round(aov * 1.30);
    var grossPerOrder = threshold * (margin / 100);
    var netContribution = grossPerOrder - shipCost;
    var minBasketToAbsorb = Math.round(shipCost / (margin / 100));

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'الحد الأدنى لحماية الربح' : 'Min Basket to Absorb Shipping', val: minBasketToAbsorb.toFixed(0) + ' SAR/AED' },
        { label: isAr ? 'العتبة المثلى الموصى بها' : 'Optimal Threshold (+30%)', val: optimalThreshold.toFixed(0) + ' SAR/AED' },
        { label: isAr ? 'المساهمة الربحية عند الحد المقترح' : 'Net Contribution at Threshold', val: netContribution.toFixed(2) + ' SAR/AED' }
      ],
      breakdown: [
        { label: isAr ? 'متوسط السلة الحالي' : 'Current Average Order Value (AOV)', val: aov.toFixed(2) },
        { label: isAr ? 'الحد الأدنى الإلزامي لتغطية تكلفة الشحن' : 'Break-Even Free Shipping Floor', val: minBasketToAbsorb.toFixed(2) },
        { label: isAr ? 'عتبة الشحن المجاني المقترحة' : 'Proposed Threshold', val: threshold.toFixed(2) },
        { label: isAr ? 'هامش الربح بعد امتصاص تكلفة الشحن' : 'Net Gross Margin After Absorbing Shipping', val: ((netContribution / threshold) * 100).toFixed(1) + '%' }
      ],
      alert: {
        type: threshold < minBasketToAbsorb ? 'danger' : 'success',
        title: isAr ? (threshold < minBasketToAbsorb ? 'تحذير: عتبة الشحن تسبب خسائر' : 'عتبة شحن ممتازة ومحمية') : (threshold < minBasketToAbsorb ? 'Deficit Threshold Alert' : 'Safe Margin Preserving Threshold'),
        text: isAr ? (threshold < minBasketToAbsorb ? 'العتبة المقترحة أقل من الحد الأدنى لتغطية الشحن! ارفع الحد إلى ' + minBasketToAbsorb + ' على الأقل.' : 'العتبة تحفز العملاء على إضافة منتجات إضافية وتغطي تكلفة التوصيل بالكامل.') : (threshold < minBasketToAbsorb ? 'Proposed threshold is below break-even floor. Increase threshold.' : 'Threshold safely covers shipping cost while lifting AOV.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة الحد الأدنى للشحن المجاني لحماية هوامش أرباح المتاجر الخليجية' + ' (' + APP_ID + ') ===\n\n';
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
