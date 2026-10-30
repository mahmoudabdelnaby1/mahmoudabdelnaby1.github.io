/**
 * APP-076: Ad Click-Through Rate (CTR) to Landing Page Conversion Diagnostic
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-076';
  var outputsList = ["Funnel Health Quadrant (Unicorn / Bait & Switch / Boring Ad / Broken Funnel)", "Diagnosis of Primary Leak (Ad Fatigue vs Headline Disconnect vs Technical Bug)", "Expected Industry Benchmark Comparison for MENA", "Actionable Step-by-Step Prescription to Fix the Gap"];
  var defaultValues = {"ad_ctr_pct": 3.4, "landing_page_cvr_pct": 1.1, "industry_benchmark": "ecommerce_mena"};

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
    var ctr = Math.max(0, inp.ad_ctr_pct || 1.5);
    var cvr = Math.max(0, inp.landing_page_cvr_pct || 2.0);

    var isAr = (lang === 'ar');
    var diagnosis = '';
    var alertType = 'info';

    if (ctr >= 2.5 && cvr < 1.5) {
      diagnosis = isAr ? 'انفصال في الرسالة: الإعلان جذاب جداً لكن صفحة الهبوط تفشل في الإقناع (Message Mismatch)' : 'Message Mismatch: Great ad hook, weak landing page conversion';
      alertType = 'danger';
    } else if (ctr < 1.2 && cvr >= 2.5) {
      diagnosis = isAr ? 'عرض فائز لكن الإعلان ضعيف: العرض مقنع جداً ولكن إعلانك لا يجذب نقرات كافية' : 'Great Offer / Weak Ad Creative';
      alertType = 'warning';
    } else if (ctr >= 2.0 && cvr >= 2.0) {
      diagnosis = isAr ? 'حملة متوازنة ورابحة: توافق تام بين جاذبية الإعلان وقوة صفحة الهبوط' : 'Harmonious High-Performing Funnel';
      alertType = 'success';
    } else {
      diagnosis = isAr ? 'ضعف عام: الحملة بحاجة لإعادة صياغة العرض وتجديد التصاميم' : 'Needs Fundamental Offer & Creative Revision';
      alertType = 'warning';
    }

    return {
      metrics: [
        { label: isAr ? 'التشخيص الاستراتيجي للحملة' : 'Funnel Health Diagnosis', val: isAr ? 'تم تشخيص الخلل' : 'Diagnosed' },
        { label: isAr ? 'معدل النقر على الإعلان (CTR)' : 'Ad CTR %', val: ctr.toFixed(2) + '%' },
        { label: isAr ? 'معدل تحويل الصفحة (CVR)' : 'Landing Page CVR %', val: cvr.toFixed(2) + '%' }
      ],
      breakdown: [
        { label: isAr ? 'التقرير التشخيصي المفصل' : 'Diagnostic Breakdown', val: diagnosis },
        { label: isAr ? 'مقارنة نسبة النقر بالمعيار الإقليمي' : 'Ad Hook Performance', val: ctr >= 1.8 ? (isAr?'أعلى من المعيار (ممتاز)':'Above Benchmark') : (isAr?'أقل من المعيار':'Below Benchmark') },
        { label: isAr ? 'مقارنة تحويل الصفحة بالمعيار' : 'Landing Page Friction', val: cvr >= 2.2 ? (isAr?'تحويل صحي':'Healthy CVR') : (isAr?'تسرب زوار مرتفع':'High Visitor Leakage') }
      ],
      alert: {
        type: alertType,
        title: isAr ? 'تشخيص التوافق بين الإعلان والصفحة' : 'Funnel Alignment Verdict',
        text: diagnosis
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'أداة تشخيص التوافق بين نقرات الإعلان ومعدل تحويل صفحة الهبوط Message Match' + ' (' + APP_ID + ') ===\n\n';
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
