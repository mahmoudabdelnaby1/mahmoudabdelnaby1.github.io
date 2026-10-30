/**
 * APP-073: Marketing Channel Budget Reallocation & Marginal ROI Planner
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-073';
  var outputsList = ["Optimal Recommended Budget Allocation per Channel", "Projected Total Blended Revenue Increase", "Marginal Saturation Warning per Channel", "Interactive Budget Shift Sensitivity Slider"];
  var defaultValues = {"channel_a_spend": 18000, "channel_a_cpa": 45, "channel_b_spend": 6000, "channel_b_cpa": 22, "reallocation_amount": 4000};

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
    var aSpend = Math.max(0, inp.channel_a_spend || 10000);
    var aCpa = Math.max(1, inp.channel_a_cpa || 40);
    var bSpend = Math.max(0, inp.channel_b_spend || 5000);
    var bCpa = Math.max(1, inp.channel_b_cpa || 20);
    var shift = Math.max(0, inp.reallocation_amount || 2000);

    var curConvsA = aSpend / aCpa;
    var curConvsB = bSpend / bCpa;
    var totalCurrent = curConvsA + curConvsB;

    // After moving shift from A to B
    var newConvsA = Math.max(0, (aSpend - shift) / aCpa);
    var newConvsB = (bSpend + shift) / (bCpa * 1.08); // Slight marginal inflation of 8% on scale
    var totalNew = newConvsA + newConvsB;
    var gainedConvs = totalNew - totalCurrent;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'الطلبات الإضافية المكتسبة' : 'Incremental Orders Gained', val: '+' + Math.round(gainedConvs) + ' orders' },
        { label: isAr ? 'تحسن كفاءة الإنفاق الكلي' : 'Efficiency Gain %', val: '+' + (((totalNew - totalCurrent) / totalCurrent) * 100).toFixed(1) + '%' },
        { label: isAr ? 'المبلغ الموصى بنقله' : 'Reallocated Ad Spend', val: '$' + shift.toLocaleString() }
      ],
      breakdown: [
        { label: isAr ? 'إجمالي التحويلات الحالية قبل التعديل' : 'Baseline Combined Conversions', val: Math.round(totalCurrent) + ' orders' },
        { label: isAr ? 'إجمالي التحويلات المتوقعة بعد النقل' : 'Projected Conversions After Shift', val: Math.round(totalNew) + ' orders' },
        { label: isAr ? 'القناة المشبعة مرتفعة التكلفة (Channel A)' : 'Saturated Channel A CPA', val: '$' + aCpa.toFixed(2) },
        { label: isAr ? 'القناة الواعدة منخفضة التكلفة (Channel B)' : 'Scalable Channel B CPA', val: '$' + bCpa.toFixed(2) }
      ],
      alert: {
        type: gainedConvs > 0 ? 'success' : 'info',
        title: isAr ? 'فرصة ممتازة لمضاعفة المبيعات بنفس الميزانية' : 'Marginal ROI Arbitrage Advantage',
        text: isAr ? ('نقل ' + shift.toLocaleString() + ' دولار من القناة المشبعة للقناة الأرخص يمنحك ' + Math.round(gainedConvs) + ' طلب إضافي بدون زيادة ميزانيتك الإعلانية الإجمالية!') : ('Reallocating budget to lower marginal CPA yields immediate free volume.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مخطط إعادة توزيع الميزانيات بين القنوات التسويقية بناءً على العائد الحدي' + ' (' + APP_ID + ') ===\n\n';
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
