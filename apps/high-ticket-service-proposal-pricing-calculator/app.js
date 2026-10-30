/**
 * APP-084: High-Ticket Service Proposal Pricing & Margin Calculator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-084';
  var outputsList = ["Recommended Proposal Selling Price", "Total Estimated Internal Delivery Cost", "Net Profit Contribution Dollar/SAR Amount", "Effective Hourly Billing Rate", "Three-Option Proposal Tier Matrix (Anchor / Recommended / Minimum)"];
  var defaultValues = {"scope_hours_required": 120, "senior_consultant_hourly_rate": 85, "expected_software_licensing_costs": 1500, "target_profit_margin_pct": 45};

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
    var hours = Math.max(1, inp.scope_hours_required || 50);
    var rate = Math.max(1, inp.senior_consultant_hourly_rate || 50);
    var tools = Math.max(0, inp.expected_software_licensing_costs || 0);
    var margin = Math.min(90, Math.max(5, inp.target_profit_margin_pct || 40)) / 100;

    var directLaborCost = hours * rate;
    var totalCost = directLaborCost + tools;
    var proposalQuote = totalCost / (1 - margin);
    var netProfit = proposalQuote - totalCost;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'قيمة العرض المالي المقترح' : 'Recommended Proposal Price', val: '$' + Math.round(proposalQuote).toLocaleString() },
        { label: isAr ? 'صافي الربح المتوقع من المشروع' : 'Net Project Profit', val: '$' + Math.round(netProfit).toLocaleString() },
        { label: isAr ? 'الهامش الصافي المحقق' : 'Net Margin %', val: (margin*100).toFixed(0) + '%' }
      ],
      breakdown: [
        { label: isAr ? 'تكلفة ساعات عمل الفريق المباشرة' : 'Direct Labor Cost', val: '$' + directLaborCost.toLocaleString() },
        { label: isAr ? 'تكاليف البرمجيات والأدوات المخصصة' : 'Software & Tool Expenses', val: '$' + tools.toLocaleString() },
        { label: isAr ? 'إجمالي تكلفة تسليم المشروع' : 'Total Cost of Delivery', val: '$' + totalCost.toLocaleString() },
        { label: isAr ? 'السعر العادل المقترح للعميل' : 'Final High-Ticket Proposal Quote', val: '$' + Math.round(proposalQuote).toLocaleString() }
      ],
      alert: {
        type: 'success',
        title: isAr ? 'تسعير متوازن يحمي هامش الربح' : 'Protected Margin High-Ticket Quote',
        text: isAr ? 'التسعير القائم على التكلفة المضاف إليها هامش ربح محمي (Cost-plus with 45% margin) يمنع خسائر تضخم نطاق العمل (Scope Creep).' : 'Protects against scope creep while guaranteeing healthy consulting margins.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة تسعير عروض الخدمات المرتفعة القيمة وهامش الربح وساعات العمل' + ' (' + APP_ID + ') ===\n\n';
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
