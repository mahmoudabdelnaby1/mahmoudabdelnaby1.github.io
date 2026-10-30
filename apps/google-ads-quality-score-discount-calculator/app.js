/**
 * APP-008: Google Ads Quality Score Impact & CPC Discount Forecaster
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-008';
  var outputsList = ["Effective CPC Discount or Penalty %", "Projected Fair-Rank CPC at Quality Score 7 (Benchmark)", "Potential Monthly Budget Saved by Improving QS to 8, 9, or 10", "Optimization Focus Matrix (Expected CTR, Ad Relevance, Landing Page)"];
  var defaultValues = {"quality_score": 6, "current_cpc": 1.85, "monthly_clicks": 3500};

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
    var qs = Math.min(10, Math.max(1, Math.round(inp.quality_score || 7)));
    var cpc = Math.max(0.01, inp.current_cpc || 1.0);
    var clicks = Math.max(0, inp.monthly_clicks || 0);

    // Google QS discount table relative to benchmark QS 7
    var discountTable = { 10: -0.50, 9: -0.444, 8: -0.375, 7: 0.0, 6: 0.167, 5: 0.40, 4: 0.75, 3: 1.333, 2: 2.50, 1: 4.00 };
    var factor = discountTable[qs] || 0;
    var baseCpc = cpc / (1 + factor);
    var potentialSavings = Math.max(0, (cpc - (baseCpc * 0.625)) * clicks); // If improved to QS 8

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'أثر رتبة الجودة على النقرة' : 'CPC Discount/Penalty %', val: (factor >= 0 ? '+' : '') + (factor * 100).toFixed(1) + '%' },
        { label: isAr ? 'السعر المعياري عند رتبة 7' : 'Fair-Rank CPC at QS 7', val: '$' + baseCpc.toFixed(2) },
        { label: isAr ? 'التوفير الشهري عند التحسين لرتبة 8' : 'Monthly Savings at QS 8', val: '$' + potentialSavings.toFixed(2) }
      ],
      breakdown: [
        { label: isAr ? 'نسبة الخصم أو الغرامة على النقرة' : 'Effective CPC Discount or Penalty %', val: (factor >= 0 ? '+' : '') + (factor * 100).toFixed(1) + '%' },
        { label: isAr ? 'سعر النقرة العادل عند رتبة 7' : 'Projected Fair-Rank CPC at Quality Score 7', val: '$' + baseCpc.toFixed(2) },
        { label: isAr ? 'التوفير الشهري المحتمل عند الوصول لرتبة 8+' : 'Potential Monthly Budget Saved by Improving QS', val: '$' + potentialSavings.toFixed(2) },
        { label: isAr ? 'محور التحسين ذو الأولوية' : 'Optimization Focus Matrix', val: (qs < 7 ? (isAr ? 'تحسين صلة الإعلان وتجربة صفحة الهبوط' : 'Ad Relevance & Landing Page Experience') : (isAr ? 'رفع نسبة النقر المتوقعة CTR' : 'Expected CTR Optimization')) }
      ],
      alert: {
        type: qs < 7 ? 'warning' : 'success',
        title: isAr ? ('رتبة الجودة الحالية: ' + qs + '/10') : ('Current Quality Score: ' + qs + '/10'),
        text: isAr ? (qs < 7 ? 'تدفع غرامة إضافية لجوجل بسبب انخفاض الجودة! تحسين الصفحة سيرفع أرباحك فوراً.' : 'رتبة جيدة تمنحك خصماً حقيقياً وتفوقاً على المنافسين في المزاد.') : (qs < 7 ? 'You are paying a penalty to Google due to low QS. Improve relevance to unlock discounts.' : 'Healthy score earning auction discounts.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة أثر رتبة الجودة Quality Score على خفض تكلفة النقرة في إعلانات جوجل' + ' (' + APP_ID + ') ===\n\n';
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
