/**
 * APP-015: E-Commerce Customer Lifetime Value (LTV) to CAC Ratio Calculator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-015';
  var outputsList = ["Customer Lifetime Value (1-Year & 3-Year LTV)", "LTV:CAC Ratio (e.g. 4.1:1)", "Maximum Allowable CAC for 3:1 Target", "Health Benchmark Status (Under-investing / Ideal / Unsustainable Burn)"];
  var defaultValues = {"aov": 240, "purchase_frequency": 2.4, "gross_margin_pct": 52, "cac": 95, "annual_retention_rate_pct": 42};

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
    var aov = Math.max(1, inp.aov || 100);
    var freq = Math.max(0.1, inp.purchase_frequency || 1);
    var margin = Math.min(100, Math.max(1, inp.gross_margin_pct || 50));
    var cac = Math.max(1, inp.cac || 50);
    var ret = Math.min(99, Math.max(1, inp.annual_retention_rate_pct || 30));

    var annualVal = aov * freq * (margin / 100);
    var lifespan = 1 / (1 - (ret / 100));
    var ltv = annualVal * lifespan;
    var ltvCac = ltv / cac;
    var maxAllowableCac = ltv / 3.0;

    var isAr = (lang === 'ar');
    var status = ltvCac >= 3.0 ? (isAr ? 'نمو صحي ومثالي (Ideal 3:1+)' : 'Ideal & Scalable (3:1+)') : (ltvCac >= 1.5 ? (isAr ? 'حذر وقريب من الخطر (Caution 1.5 - 3)' : 'Caution (1.5 - 3)') : (isAr ? 'استنزاف خطير لرأس المال (< 1.5)' : 'Unsustainable Burn (< 1.5)'));
    var alertType = ltvCac >= 3.0 ? 'success' : (ltvCac >= 1.5 ? 'warning' : 'danger');

    return {
      metrics: [
        { label: isAr ? 'نسبة LTV : CAC' : 'LTV : CAC Ratio', val: ltvCac.toFixed(2) + ' : 1' },
        { label: isAr ? 'القيمة الدائمة للعميل (LTV)' : 'Customer Lifetime Value (LTV)', val: ltv.toFixed(2) },
        { label: isAr ? 'أقصى تكلفة اكتساب مستهدفة' : 'Max Allowable CAC (3:1)', val: maxAllowableCac.toFixed(2) }
      ],
      breakdown: [
        { label: isAr ? 'القيمة الربحية السنوية لكل عميل' : 'Annual Gross Profit Contribution', val: annualVal.toFixed(2) },
        { label: isAr ? 'متوسط عمر العميل المتوقع' : 'Estimated Customer Lifespan', val: lifespan.toFixed(1) + ' ' + (isAr?'سنوات':'years') },
        { label: isAr ? 'القيمة الدائمة الكاملة للعميل (LTV)' : 'Total Customer Lifetime Value (LTV)', val: ltv.toFixed(2) },
        { label: isAr ? 'نسبة LTV إلى تكلفة الاستحواذ' : 'True LTV:CAC Ratio', val: ltvCac.toFixed(2) + 'x' },
        { label: isAr ? 'تقييم كفاءة نموذج العمل' : 'Health Benchmark Status', val: status }
      ],
      alert: {
        type: alertType,
        title: isAr ? ('تقييم LTV:CAC: ' + status) : ('Health Verdict: ' + status),
        text: isAr ? (ltvCac >= 3.0 ? 'النموذج يولد أرباحاً ممتازة تتجاوز 3 أضعاف تكلفة الإعلانات، يمكنك زيادة ميزانية التوسع بأمان.' : 'تكلفة الاستحواذ مرتفعة جداً مقارنة بمعدل تكرار الشراء. ركز على ولاء العملاء وتنشيطهم.') : (ltvCac >= 3.0 ? 'Highly profitable unit economics allowing aggressive paid scaling.' : 'CAC is dangerously high relative to retention. Improve repeat purchases.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة نسبة القيمة الدائمة للعميل LTV إلى تكلفة الاكتساب CAC لمتاجر الخليج ومصر' + ' (' + APP_ID + ') ===\n\n';
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
