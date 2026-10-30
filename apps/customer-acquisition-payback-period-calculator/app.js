/**
 * APP-077: Customer Acquisition Payback Period Calculator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-077';
  var outputsList = ["CAC Payback Period (Months to Break Even on Ad Cost)", "Capital Efficiency Rating (Elite <6 mos / Healthy 6-12 mos / Danger >18 mos)", "Total Working Capital Required per 1,000 Customers Acquired", "Sensitivity Chart: Payback Time vs Churn Reduction"];
  var defaultValues = {"blended_cac": 120, "monthly_gross_margin_per_customer": 25, "churn_rate_monthly_pct": 4.5};

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
    var cac = Math.max(1, inp.blended_cac || 100);
    var margin = Math.max(1, inp.monthly_gross_margin_per_customer || 20);
    var churn = Math.min(90, Math.max(0.1, inp.churn_rate_monthly_pct || 5)) / 100;

    var paybackMonths = cac / margin;
    var maxSafeLifespan = 1 / churn;
    var isSafe = paybackMonths <= (maxSafeLifespan * 0.5) && paybackMonths <= 12;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'فترة استرداد تكلفة الاستحواذ' : 'CAC Payback Period', val: paybackMonths.toFixed(1) + ' ' + (isAr?'أشهر':'months') },
        { label: isAr ? 'سلامة التدفق النقدي' : 'Cash Flow Health Status', val: isSafe ? (isAr ? 'آمن وسريع' : 'Safe (< 12 mo)') : (isAr ? 'خطر استنزاف السيولة' : 'Cash Burn Risk') },
        { label: isAr ? 'متوسط دورة حياة العميل' : 'Customer Lifespan', val: Math.round(maxSafeLifespan) + ' ' + (isAr?'أشهر':'months') }
      ],
      breakdown: [
        { label: isAr ? 'تكلفة الاستحواذ على العميل (CAC)' : 'Blended CAC', val: '$' + cac.toFixed(2) },
        { label: isAr ? 'المساهمة الربحية الشهرية للعميل' : 'Monthly Gross Margin Contribution', val: '$' + margin.toFixed(2) },
        { label: isAr ? 'عدد الشهور المطلوبة لاسترداد الإعلانات' : 'Payback Velocity', val: paybackMonths.toFixed(1) + ' months' },
        { label: isAr ? 'المعيار المالي الموصى به' : 'Venture Benchmark Standard', val: '< 12 Months Payback Window' }
      ],
      alert: {
        type: isSafe ? 'success' : 'danger',
        title: isAr ? ('فترة الاسترداد: ' + paybackMonths.toFixed(1) + ' شهر') : ('Payback: ' + paybackMonths.toFixed(1) + ' Months'),
        text: isAr ? (isSafe ? 'فترة استرداد سريعة تسمح بإعادة تدوير أرباح الإعلانات شهرياً للتوسع دون الحاجة لتمويل خارجي.' : 'استرداد تكلفة الإعلان يستغرق وقتاً طويلاً جداً مما يهدد السيولة النقدية للشركة.') : 'Short payback cycles allow compounding marketing reinvestment.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة فترة استرداد تكلفة اكتساب العميل في الأعمال المتكررة' + ' (' + APP_ID + ') ===\n\n';
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
