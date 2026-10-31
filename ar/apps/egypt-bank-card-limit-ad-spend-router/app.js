/**
 * APP-092: Egypt Bank Card Limit Multi-Account Ad Spend Routing Planner
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-092';
  var outputsList = ["Total Available Combined Card Capacity (USD)", "Coverage Status (Fully Funded / Budget Deficit Alert)", "Optimal Daily Spend Pacing per Card", "Threshold Exhaustion Calendar Alert (Date each card maxes out)", "Recommended Secondary Funding Strategies (EGP billing where available, regional subsidiaries)"];
  var defaultValues = {"total_monthly_ad_budget_usd": 3500, "available_cards": "CIB Corporate: $1500, NBE Debit: $250, Banque Misr: $250, QNB: $1000"};

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
    var req = Math.max(1, inp.total_monthly_ad_budget_usd || 1000);
    var rawCards = inp.available_cards || 'Card: $500';

    var totalCap = 0;
    var matches = rawCards.match(/\$?\s*(\d+)/g) || [];
    matches.forEach(function(m) {
      var num = parseInt(m.replace(/[^0-9]/g, ''));
      if (!isNaN(num)) totalCap += num;
    });
    if (totalCap === 0) totalCap = 3000;

    var deficit = Math.max(0, req - totalCap);
    var isFullyFunded = (totalCap >= req);
    var dailyPacing = totalCap / 30;
    var daysUntilExhaustion = Math.min(30, Math.round((totalCap / (req / 30))));

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'إجمالي السعة الدولارية للبطاقات' : 'Total Combined FX Card Capacity', val: '$' + totalCap.toLocaleString() },
        { label: isAr ? 'حالة تغطية الميزانية المطلوبة' : 'Funding Coverage Status', val: isFullyFunded ? (isAr ? 'مغطاة بالكامل 100%' : 'Fully Funded') : (isAr ? 'عجز في السعة الدولارية' : 'Capacity Deficit') },
        { label: isAr ? 'قيمة العجز الشهري' : 'Monthly Deficit Amount', val: deficit > 0 ? ('-$' + deficit.toLocaleString()) : '$0' }
      ],
      breakdown: [
        { label: isAr ? 'الميزانية الإعلانية الشهرية المطلوبة' : 'Required Monthly Ad Spend', val: '$' + req.toLocaleString() },
        { label: isAr ? 'إجمالي الحدود الائتمانية المتاحة بالبطاقات' : 'Combined Available Card Limits', val: '$' + totalCap.toLocaleString() },
        { label: isAr ? 'معدل الإنفاق اليومي الآمن لتفادي استنزاف البطاقات' : 'Daily Pacing Safe Cap', val: '$' + dailyPacing.toFixed(1) + '/day' },
        { label: isAr ? 'عدد الأيام قبل نفاد حدود البطاقات' : 'Days Until Limits Exhausted', val: daysUntilExhaustion + ' ' + (isAr?'يوماً':'days') }
      ],
      alert: {
        type: isFullyFunded ? 'success' : 'warning',
        title: isAr ? (isFullyFunded ? 'البطاقات المتاحة تغطي الميزانية بالكامل' : 'تنبيه: عجز في حدود تدبير العملة بالدولار!') : 'Card Limit Routing Status',
        text: isAr ? (isFullyFunded ? 'توزيع الإنفاق بمعدل يومي متوازن يحميك من توقف الحسابات الإعلانية المفاجئ.' : 'البطاقات المتاحة ستنفد حدودها بعد ' + daysUntilExhaustion + ' يوماً. يجب تفعيل الفوترة بالجنيه المصري (EGP) حيث تتيح المنصة، أو إضافة بطاقات شركات إضافية.') : 'Manage multi-card limits to avoid mid-month ad account suspension.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مخطط توزيع ميزانيات الإعلانات على بطاقات بنكية متعددة وفق حدود تدبير العملة' + ' (' + APP_ID + ') ===\n\n';
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
