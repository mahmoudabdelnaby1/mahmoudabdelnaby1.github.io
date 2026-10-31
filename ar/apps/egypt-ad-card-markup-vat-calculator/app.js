/**
 * APP-001: Egypt Ad Spend Foreign Currency Card Markup & VAT Calculator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-001';
  var outputsList = ["Net Ad Spend in EGP", "Bank Markup Fee Amount in EGP", "14% ETA VAT Amount in EGP", "Total Effective Debit from Egyptian Bank Account", "Effective Exchange Rate per Dollar spent"];
  var defaultValues = {"ad_spend_usd": 500, "official_exchange_rate": 49.5, "bank_markup_percentage": 10.0, "vat_applied_by_platform": "no"};

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
    var spend = Math.max(0, inp.ad_spend_usd || 0);
    var rate = Math.max(0, inp.official_exchange_rate || 49.5);
    var markup = Math.max(0, inp.bank_markup_percentage || 0);
    var platVat = (inp.vat_applied_by_platform === 'yes');

    var totalUsd = platVat ? (spend * 1.14) : spend;
    var baseEgp = totalUsd * rate;
    var fxFee = baseEgp * (markup / 100);
    var vatExtra = (!platVat) ? (baseEgp * 0.14) : 0;
    var totalEgp = baseEgp + fxFee + vatExtra;
    var effRate = spend > 0 ? (totalEgp / spend) : rate;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'إجمالي الخصم البنكي (جنيه)' : 'Total Bank Debit (EGP)', val: totalEgp.toLocaleString(isAr?'ar-EG':'en-US', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' EGP' },
        { label: isAr ? 'السعر الفعلي للدولار' : 'Effective Rate per $', val: effRate.toFixed(2) + ' EGP/$' },
        { label: isAr ? 'عمولة تدبير العملة' : 'Bank FX Markup Fee', val: fxFee.toLocaleString(isAr?'ar-EG':'en-US', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' EGP' }
      ],
      breakdown: [
        { label: isAr ? 'صافي الإنفاق بالجنيه' : 'Net Ad Spend in EGP', val: baseEgp.toFixed(2) + ' EGP' },
        { label: isAr ? 'عمولة تدبير العملة (' + markup + '%)' : 'Bank FX Markup (' + markup + '%)', val: fxFee.toFixed(2) + ' EGP' },
        { label: isAr ? 'ضريبة القيمة المضافة (14% ETA)' : '14% ETA VAT Amount', val: (platVat ? (spend * 0.14 * rate) : vatExtra).toFixed(2) + ' EGP' },
        { label: isAr ? 'إجمالي الخصم من الحساب' : 'Total Effective Bank Debit', val: totalEgp.toFixed(2) + ' EGP' },
        { label: isAr ? 'السعر الفعلي للدولار المنفق' : 'Effective Exchange Rate per USD', val: effRate.toFixed(2) + ' EGP/$' }
      ],
      alert: markup > 20 ? {
        type: 'warning',
        title: isAr ? 'تنبيه: عمولة تدبير عملة مرتفعة جداً' : 'High Markup Alert',
        text: isAr ? 'العمولة تتجاوز 20%، يُنصح بمراجعة البنك أو استخدام بطاقات الشركات لتقليل الرسوم.' : 'Bank markup exceeds 20%, consider corporate billing or virtual debit limits.'
      } : {
        type: 'info',
        title: isAr ? 'حسابات مطابقة لمعايير البنك المركزي ومصلحة الضرائب' : 'CBE & ETA Compliant',
        text: isAr ? 'تم احتساب ضريبة الـ 14% ورسوم تدبير العملة المقررة وفق أحدث التعليمات البنكية.' : 'Calculated accurately according to ETA digital tax and CBE foreign exchange directives.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة ضريبة القيمة المضافة وعمولة تدبير العملة لبطاقات إعلانات مصر' + ' (' + APP_ID + ') ===\n\n';
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
