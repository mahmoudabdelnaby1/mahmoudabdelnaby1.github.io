/**
 * APP-009: Break-Even ROAS & Maximum Target CPA Threshold Matrix
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-009';
  var outputsList = ["Net Profit Contribution per Delivered Unit", "True Break-Even ROAS (e.g. 2.35x)", "Maximum Permissible Target CPA", "Target ROAS for 20% Net Profit Margin", "Target ROAS for 30% Net Profit Margin"];
  var defaultValues = {"retail_price": 250, "product_cogs": 80, "shipping_packaging_cost": 35, "gateway_fee_pct": 3.0, "expected_return_rate_pct": 12};

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
    var price = Math.max(1, inp.retail_price || 100);
    var cogs = Math.max(0, inp.product_cogs || 0);
    var ship = Math.max(0, inp.shipping_packaging_cost || 0);
    var feePct = Math.max(0, inp.gateway_fee_pct || 0);
    var rtoPct = Math.min(99, Math.max(0, inp.expected_return_rate_pct || 0));

    var grossMargin = price - cogs - ship - (price * (feePct / 100));
    var rtoFactor = (1 - (rtoPct / 100));
    var adjustedContribution = grossMargin * rtoFactor;
    var beRoas = adjustedContribution > 0 ? (price / adjustedContribution) : 999;
    var maxCpa = Math.max(0, adjustedContribution);
    var targetRoas20 = adjustedContribution > 0 ? (price / (adjustedContribution - (price * 0.20))) : 999;
    var targetRoas30 = adjustedContribution > 0 ? (price / (adjustedContribution - (price * 0.30))) : 999;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'الـ ROAS لنقطة التعادل' : 'True Break-Even ROAS', val: beRoas.toFixed(2) + 'x' },
        { label: isAr ? 'أقصى تكلفة اكتساب مسموحة (CPA)' : 'Max Permissible Target CPA', val: maxCpa.toFixed(2) },
        { label: isAr ? 'المساهمة الربحية للقطعة المستلمة' : 'Net Contribution per Unit', val: adjustedContribution.toFixed(2) }
      ],
      breakdown: [
        { label: isAr ? 'صافي الربح قبل الإعلانات (لكل طلب مسلّم)' : 'Net Profit Contribution per Delivered Unit', val: adjustedContribution.toFixed(2) },
        { label: isAr ? 'نقطة التعادل الصافية (Break-Even ROAS)' : 'True Break-Even ROAS', val: beRoas.toFixed(2) + 'x' },
        { label: isAr ? 'الحد الأقصى لـ CPA لتفادي الخسارة' : 'Maximum Permissible Target CPA', val: maxCpa.toFixed(2) },
        { label: isAr ? 'الـ ROAS المستهدف لربح صافي 20%' : 'Target ROAS for 20% Net Profit Margin', val: (targetRoas20 > 0 && targetRoas20 < 100 ? targetRoas20.toFixed(2) + 'x' : 'N/A') },
        { label: isAr ? 'الـ ROAS المستهدف لربح صافي 30%' : 'Target ROAS for 30% Net Profit Margin', val: (targetRoas30 > 0 && targetRoas30 < 100 ? targetRoas30.toFixed(2) + 'x' : 'N/A') }
      ],
      alert: {
        type: beRoas < 2.5 ? 'success' : (beRoas < 4.0 ? 'warning' : 'danger'),
        title: isAr ? ('نقطة التعادل: ' + beRoas.toFixed(2) + 'x') : ('Break-Even ROAS: ' + beRoas.toFixed(2) + 'x'),
        text: isAr ? (beRoas > 3.5 ? 'هامش ربح ضيق جداً! تحتاج ROAS مرتفع لتفادي الخسارة، قلل التكلفة أو ارفع السعر.' : 'هيكل تسعيري صحي يسمح بالتوسع والمنافسة في الإعلانات المدفوعة.') : (beRoas > 3.5 ? 'Tight unit margins requiring high ROAS to survive. Increase price or reduce COGS.' : 'Healthy pricing structure allowing aggressive ad acquisition.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مصفوفة نقطة التعادل للـ ROAS والحد الأقصى لتكلفة الاكتساب CPA للمتاجر' + ' (' + APP_ID + ') ===\n\n';
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
