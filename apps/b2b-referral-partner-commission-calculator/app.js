/**
 * APP-089: B2B Referral & Partner Commission Incentive Calculator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-089';
  var outputsList = ["Partner Payout Amount per Deal", "Company Retained First-Year Profit", "Effective Customer Acquisition Cost (CAC) via Partner vs Direct Ads", "Partner Motivation Rating (Competitive / Moderate / Unattractive)"];
  var defaultValues = {"referred_deal_value": 40000, "commission_model": "percentage", "gross_margin_pct": 55, "closing_probability_pct": 35};

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
    var deal = Math.max(100, inp.referred_deal_value || 10000);
    var model = inp.commission_model || 'percentage';
    var margin = Math.min(100, Math.max(1, inp.gross_margin_pct || 50)) / 100;
    var prob = Math.min(100, Math.max(1, inp.closing_probability_pct || 30)) / 100;

    var commPayout = 0;
    if (model === 'percentage') {
      commPayout = deal * 0.15;
    } else if (model === 'recurring') {
      commPayout = deal * 0.10;
    } else {
      commPayout = 2000;
    }

    var grossProfit = deal * margin;
    var netCompanyProfit = grossProfit - commPayout;
    var expectedValue = (netCompanyProfit * prob);

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'عمولة الشريك المسددة' : 'Partner Commission Payout', val: '$' + commPayout.toLocaleString() },
        { label: isAr ? 'صافي ربح الشركة بعد العمولة' : 'Company Retained Net Profit', val: '$' + netCompanyProfit.toLocaleString() },
        { label: isAr ? 'القيمة المتوقعة للاحتمالية (EV)' : 'Expected Pipeline Value (EV)', val: '$' + Math.round(expectedValue).toLocaleString() }
      ],
      breakdown: [
        { label: isAr ? 'قيمة العقد المحال من الشريك' : 'Total Deal Value', val: '$' + deal.toLocaleString() },
        { label: isAr ? 'نموذج العمولة المعتمد' : 'Partner Incentive Structure', val: model },
        { label: isAr ? 'قيمة العمولة المستحقة للشريك عند الإغلاق' : 'Commission Paid on Closing', val: '$' + commPayout.toLocaleString() },
        { label: isAr ? 'صافي هامش الشركة المحمي' : 'Company Preserved Margin', val: ((netCompanyProfit / deal) * 100).toFixed(1) + '%' }
      ],
      alert: {
        type: 'success',
        title: isAr ? 'برنامج شراكة إحالة رابح للطرفين' : 'Win-Win B2B Referral Structure',
        text: isAr ? 'دفع عمولة للشريك فقط عند إتمام الصفقة يحقق نمواً استثنائياً بدون أي مخاطرة مالية مسبقة.' : 'Zero upfront risk performance-based channel expansion.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة حوافز وعمولات الإحالة والشراكات الإستراتيجية للأعمال B2B' + ' (' + APP_ID + ') ===\n\n';
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
