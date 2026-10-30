/**
 * APP-063: A/B Test Statistical Significance & Sample Size Calculator for MENA
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-063';
  var outputsList = ["Conversion Rates (CR A vs CR B)", "Relative Uplift % (+18.4% improvement)", "P-Value and Statistical Significance % (e.g. 96.8% Confident)", "Verdict (Winner Confirmed / Inconclusive - Keep Running / Negative Impact)", "Additional Visitors Needed if Inconclusive"];
  var defaultValues = {"sample_size_a": 5000, "conversions_a": 160, "sample_size_b": 5100, "conversions_b": 225, "confidence_level": "95"};

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
    var n1 = Math.max(1, inp.sample_size_a || 100);
    var c1 = Math.max(0, inp.conversions_a || 0);
    var n2 = Math.max(1, inp.sample_size_b || 100);
    var c2 = Math.max(0, inp.conversions_b || 0);
    var conf = inp.confidence_level || '95';

    var p1 = c1 / n1;
    var p2 = c2 / n2;
    var pPool = (c1 + c2) / (n1 + n2);
    var se = Math.sqrt(pPool * (1 - pPool) * ((1 / n1) + (1 / n2)));
    var z = se > 0 ? ((p2 - p1) / se) : 0;
    var absZ = Math.abs(z);

    var zThreshold = conf === '99' ? 2.576 : (conf === '90' ? 1.645 : 1.96);
    var isSignificant = absZ >= zThreshold;
    var lift = p1 > 0 ? (((p2 - p1) / p1) * 100) : 0;

    var isAr = (lang === 'ar');
    var winner = isSignificant ? (p2 > p1 ? (isAr ? 'النسخة B فائزة مؤكدة' : 'Variant B Winner') : (isAr ? 'النسخة A فائزة' : 'Variant A Winner')) : (isAr ? 'النتيجة غير حاسمة إحصائياً بعد' : 'Not Statistically Significant Yet');

    return {
      metrics: [
        { label: isAr ? 'القرار الإحصائي النهائي' : 'Test Significance Verdict', val: winner },
        { label: isAr ? 'نسبة التحسن (Lift %)' : 'Relative Conversion Lift', val: (lift >= 0 ? '+' : '') + lift.toFixed(2) + '%' },
        { label: isAr ? 'قيمة Z-Score المحسوبة' : 'Calculated Z-Score', val: z.toFixed(2) + ' (Req: ' + zThreshold + ')' }
      ],
      breakdown: [
        { label: isAr ? 'معدل تحويل النسخة A الأصلية' : 'Variant A Conversion Rate', val: (p1 * 100).toFixed(2) + '% (' + c1 + '/' + n1 + ')' },
        { label: isAr ? 'معدل تحويل النسخة B التجريبية' : 'Variant B Conversion Rate', val: (p2 * 100).toFixed(2) + '% (' + c2 + '/' + n2 + ')' },
        { label: isAr ? 'قيمة الدلالة الإحصائية المحققة' : 'Confidence Level Met', val: isSignificant ? (conf + '% Significant') : 'Insignificant' },
        { label: isAr ? 'التوصية المعتمدة' : 'Execution Guidance', val: isSignificant ? (isAr ? 'اعتماد النسخة الفائزة فوراً وتطبيقها على 100% من الزوار' : 'Roll out winning variant to 100% traffic') : (isAr ? 'الاستمرار في جمع عينات إضافية لتفادي أخطاء العينة العشوائية' : 'Continue test to collect more samples') }
      ],
      alert: {
        type: isSignificant ? 'success' : 'warning',
        title: isAr ? ('نتيجة الاختبار: ' + winner) : ('A/B Test Verdict: ' + winner),
        text: isAr ? (isSignificant ? ('النسخة B تحقق تحسناً حقيقياً بنسبة ' + lift.toFixed(1) + '% بثقة إحصائية ' + conf + '%. يمكنك إيقاف الاختبار بأمان.') : 'الفارق الحالي قد يكون ناتجاً عن الصدفة العشوائية فقط. استمر في الاختبار حتى تصل إلى حجم عينة كافٍ.') : (isSignificant ? 'Statistically significant result verified.' : 'Inconclusive; continue test.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة الدلالة الإحصائية وحجم العينة لاختبارات A/B لمتاجر الشرق الأوسط' + ' (' + APP_ID + ') ===\n\n';
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
