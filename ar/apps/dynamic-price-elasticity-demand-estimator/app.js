/**
 * APP-095: Dynamic Price Elasticity of Demand Estimator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-095';
  var outputsList = ["Price Elasticity of Demand Coefficient (PED)", "Demand Classification (Inelastic |PED| < 1, Unit Elastic = 1, Elastic |PED| > 1)", "Total Revenue Impact (Initial Total Revenue vs New Total Revenue)", "Optimal Pricing Action Recommendation"];
  var defaultValues = {"current_price": 200, "current_monthly_sales_units": 800, "proposed_price": 240, "price_elasticity_coefficient": -1.2};

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
    var p0 = Math.max(1, inp.current_price || 100);
    var q0 = Math.max(1, inp.current_monthly_sales_units || 100);
    var p1 = Math.max(1, inp.proposed_price || 120);
    var e = inp.price_elasticity_coefficient || -1.2;

    var priceChangePct = (p1 - p0) / p0;
    var quantityChangePct = priceChangePct * e;
    var q1 = Math.max(0, Math.round(q0 * (1 + quantityChangePct)));

    var rev0 = p0 * q0;
    var rev1 = p1 * q1;
    var revDiff = rev1 - rev0;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'الإيراد الشهري المتوقع بعد تعديل السعر' : 'Projected Monthly Revenue', val: '$' + Math.round(rev1).toLocaleString() },
        { label: isAr ? 'فارق المبيعات الناتج عن التسعير' : 'Revenue Variance', val: (revDiff >= 0 ? '+' : '') + '$' + Math.round(revDiff).toLocaleString() },
        { label: isAr ? 'الكمية المتوقع بيعها' : 'Projected Sales Units', val: q1.toLocaleString() + ' units' }
      ],
      breakdown: [
        { label: isAr ? 'نسبة التغير في السعر' : 'Price Change %', val: (priceChangePct*100).toFixed(1) + '%' },
        { label: isAr ? 'نسبة التغير في حجم الطلب (المرونة)' : 'Demand Quantity Change %', val: (quantityChangePct*100).toFixed(1) + '%' },
        { label: isAr ? 'الإيراد الأساسي الحالي' : 'Baseline Revenue', val: '$' + Math.round(rev0).toLocaleString() },
        { label: isAr ? 'توصية التسعير المثلى' : 'Pricing Elasticity Recommendation', val: revDiff > 0 ? (isAr ? 'رفع السعر مفيد ويزيد الإيرادات الإجمالية' : 'Price increase is accretive to revenue') : (isAr ? 'الطلب حساس جداً، رفع السعر سيقلل الإيرادات' : 'Elastic demand; price hike decreases gross revenue') }
      ],
      alert: {
        type: revDiff > 0 ? 'success' : 'warning',
        title: isAr ? (revDiff > 0 ? 'قرار تسعير صائب يرفع إجمالي الدخل' : 'تحذير: مرونة طلب مرتفعة تؤدي لتراجع الدخل') : 'Price Elasticity Verdict',
        text: isAr ? 'معادلة مرونة الطلب تحدد بدقة النقطة السعرية المثلى التي تعظم الأرباح دون الإضرار بحجم المبيعات.' : 'Measures consumer price sensitivity before rolling out price hikes.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مقدر مرونة الطلب السعرية وتأثير تعديل الأسعار على إجمالي الإيرادات' + ' (' + APP_ID + ') ===\n\n';
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
