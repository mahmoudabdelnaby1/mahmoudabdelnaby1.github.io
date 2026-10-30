/**
 * APP-074: Customer Churn Rate & Retention Cohort Analyzer
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-074';
  var outputsList = ["Monthly Churn Rate %", "Monthly Customer Retention Rate %", "Average Customer Lifespan (Months)", "Projected Annual Revenue Lost to Churn", "Profit Impact of Reducing Churn by 2% and 5%"];
  var defaultValues = {"starting_cohort_size": 1000, "monthly_churn_rate_pct": 6.5, "months_tracked": 12, "monthly_revenue_per_user": 45};

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
    var size = Math.max(1, inp.starting_cohort_size || 500);
    var churn = Math.min(99, Math.max(0.1, inp.monthly_churn_rate_pct || 5)) / 100;
    var months = Math.min(36, Math.max(1, inp.months_tracked || 12));
    var arpu = Math.max(1, inp.monthly_revenue_per_user || 30);

    var currentUsers = size;
    var totalCumulativeRev = 0;
    for (var m = 1; m <= months; m++) {
      totalCumulativeRev += (currentUsers * arpu);
      currentUsers = currentUsers * (1 - churn);
    }
    var finalRetained = Math.round(currentUsers);
    var halfLifeMonths = Math.round(Math.log(0.5) / Math.log(1 - churn));

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'الإيرادات التراكمية للفوج' : 'Cohort Lifetime Revenue', val: '$' + Math.round(totalCumulativeRev).toLocaleString() },
        { label: isAr ? 'العملاء المستمرون بعد ' + months + ' شهر' : 'Retained Users at M' + months, val: finalRetained.toLocaleString() + ' users' },
        { label: isAr ? 'عمر النصف للعملاء (Half-Life)' : 'Retention Half-Life', val: halfLifeMonths + ' months' }
      ],
      breakdown: [
        { label: isAr ? 'حجم الفوج الأولي عند الانطلاق' : 'Starting Cohort Size', val: size.toLocaleString() },
        { label: isAr ? 'نسبة التسرب الشهرية (Monthly Churn)' : 'Monthly Churn Rate', val: (churn*100).toFixed(1) + '%' },
        { label: isAr ? 'نسبة الاحتفاظ في نهاية الفترة' : 'Terminal Retention Rate', val: ((finalRetained/size)*100).toFixed(1) + '%' },
        { label: isAr ? 'متوسط الإيراد التراكمي لكل عميل أصلي' : 'Average Cumulative Value per User', val: '$' + (totalCumulativeRev / size).toFixed(2) }
      ],
      alert: {
        type: churn <= 0.05 ? 'success' : (churn <= 0.08 ? 'warning' : 'danger'),
        title: isAr ? ('تقييم استقرار الفوج: معدل تسرب ' + (churn*100).toFixed(1) + '%') : ('Cohort Health Verdict: ' + (churn*100).toFixed(1) + '% Churn'),
        text: isAr ? (churn > 0.07 ? 'نسبة التسرب مرتفعة وتستنزف العملاء بسرعة، مما يرفع تكلفة الاستحواذ ويحد من النمو.' : 'منحنى احتفاظ صحي يضمن قيمة تراكمية مرتفعة واستقراراً تدفقياً للمتجر.') : 'Cohort retention trajectory determines long-term enterprise value.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'محلل معدل تسرب العملاء والاحتفاظ بهم لمشروعات الاشتراكات والتجارة المتكررة' + ' (' + APP_ID + ') ===\n\n';
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
