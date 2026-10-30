/**
 * APP-002: Saudi & UAE Ad Spend Net/Gross VAT Budget Planner
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-002';
  var outputsList = ["Net Auction Spend Available", "VAT Obligation Amount", "Total Invoiced Platform Billing", "Daily Maximum Target Spend Limit"];
  var defaultValues = {"target_gross_or_net": "gross", "budget_amount": 10000, "jurisdiction": "ksa", "has_tax_registration": "no"};

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
    var budget = Math.max(0, inp.budget_amount || 0);
    var isKsa = (inp.jurisdiction === 'ksa');
    var vatRate = isKsa ? 0.15 : 0.05;
    var curr = isKsa ? 'SAR' : 'AED';
    var reverseCharge = (inp.has_tax_registration === 'yes');
    var isGross = (inp.target_gross_or_net === 'gross');

    var netSpend = 0;
    var vatAmount = 0;
    var totalBilled = 0;

    if (reverseCharge) {
      netSpend = budget;
      vatAmount = 0; // Handled internally by company accountant
      totalBilled = budget;
    } else {
      if (isGross) {
        netSpend = budget / (1 + vatRate);
        vatAmount = budget - netSpend;
        totalBilled = budget;
      } else {
        netSpend = budget;
        vatAmount = budget * vatRate;
        totalBilled = budget + vatAmount;
      }
    }
    var dailyLimit = netSpend / 30;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'الصافي المتاح لمزاد الإعلانات' : 'Net Auction Spend Available', val: netSpend.toFixed(2) + ' ' + curr },
        { label: isAr ? 'قيمة ضريبة القيمة المضافة' : 'VAT Obligation Amount', val: vatAmount.toFixed(2) + ' ' + curr },
        { label: isAr ? 'الحد اليومي الصافي المقترح' : 'Daily Spend Target (30d)', val: dailyLimit.toFixed(2) + ' ' + curr + '/d' }
      ],
      breakdown: [
        { label: isAr ? 'صافي الميزانية المخصصة للحملات' : 'Net Auction Spend Available', val: netSpend.toFixed(2) + ' ' + curr },
        { label: isAr ? 'نسبة الضريبة المقررة' : 'Applicable VAT Rate', val: (vatRate * 100).toFixed(0) + '%' },
        { label: isAr ? 'مبلغ الضريبة المستحق' : 'VAT Obligation Amount', val: vatAmount.toFixed(2) + ' ' + curr },
        { label: isAr ? 'إجمالي الفاتورة المسددة للمنصة' : 'Total Invoiced Platform Billing', val: totalBilled.toFixed(2) + ' ' + curr },
        { label: isAr ? 'أقصى إنفاق يومي موصى به' : 'Daily Maximum Target Spend Limit', val: dailyLimit.toFixed(2) + ' ' + curr }
      ],
      alert: reverseCharge ? {
        type: 'success',
        title: isAr ? 'آلية التكليف العكسي مفعلة (Reverse Charge)' : 'Reverse Charge Active',
        text: isAr ? 'لن تقوم منصات ميتا/جوجل/تيك توك بخصم الضريبة منك مباشرة. يتم الإقرار عنها في إقرارك الضريبي الدوري.' : 'Platform will not charge VAT on invoice; declare through regular VAT return.'
      } : {
        type: 'info',
        title: isAr ? 'استقطاع ضريبي مباشر' : 'Direct VAT Invoicing',
        text: isAr ? ('تقوم المنصة بإضافة ضريبة ' + (vatRate*100) + '% تلقائياً على كل فاتورة شحن أو بطاقة ائتمان.') : ('Platform appends ' + (vatRate*100) + '% VAT to credit card charge.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مخطط ميزانية الإعلانات الصافية بعد ضريبة القيمة المضافة للسعودية والإمارات' + ' (' + APP_ID + ') ===\n\n';
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
