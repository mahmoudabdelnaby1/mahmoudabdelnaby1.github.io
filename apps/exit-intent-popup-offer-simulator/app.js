/**
 * APP-069: Exit-Intent Popup Offer Simulator & Discount Impact Modeler
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-069';
  var outputsList = ["Projected Recovered Orders (at 3% baseline conversion)", "Gross Revenue Recovered from Bouncing Traffic", "Net Profit Realized After Discount Deductions", "Discount Breakeven Limit (Maximum allowable exit discount before margin loss)", "Live Interactive Arabic Exit-Popup HTML/CSS Preview Card"];
  var defaultValues = {"monthly_unconverted_visitors": 25000, "average_order_value": 280, "exit_popup_conversion_rate_pct": 3.2, "discount_pct": 10};

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
    var v = Math.max(1, inp.monthly_unconverted_visitors || 10000);
    var aov = Math.max(1, inp.average_order_value || 100);
    var popCvr = Math.min(20, Math.max(0.1, inp.exit_popup_conversion_rate_pct || 3.0)) / 100;
    var disc = Math.min(50, Math.max(0, inp.discount_pct || 0)) / 100;

    var recoveredOrders = Math.round(v * popCvr);
    var netAov = aov * (1 - disc);
    var grossRecovered = recoveredOrders * netAov;
    var netProfitGain = grossRecovered * 0.40; // Assuming 40% gross product margin

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'المبيعات المستردة شهرياً' : 'Monthly Recovered Revenue', val: grossRecovered.toLocaleString() + ' SAR/EGP' },
        { label: isAr ? 'الطلبات الإضافية المنقذة' : 'Saved Orders Count', val: recoveredOrders.toLocaleString() + ' orders' },
        { label: isAr ? 'صافي الربح الإضافي المحقق' : 'Net Incremental Profit', val: netProfitGain.toLocaleString() + ' SAR/EGP' }
      ],
      breakdown: [
        { label: isAr ? 'الزوار المغادرون بدون شراء' : 'Unconverted Exit Traffic Pool', val: v.toLocaleString() },
        { label: isAr ? 'معدل تحويل نافذة الخروج (Exit Popup)' : 'Exit-Intent Conversion Rate', val: (popCvr*100).toFixed(1) + '%' },
        { label: isAr ? 'عدد الطلبات التي تم إنقاذها' : 'Total Rescued Orders', val: recoveredOrders.toLocaleString() },
        { label: isAr ? 'قيمة المبيعات المستردة الصافية' : 'Net Recovered Revenue', val: grossRecovered.toLocaleString() }
      ],
      alert: {
        type: 'success',
        title: isAr ? 'إيرادات مستردة بدون دفع أي سنت إعلاني إضافي' : 'Zero-CAC Revenue Unlock',
        text: isAr ? ('تفعيل نافذة الخروج الذكية بعرض خصم ' + (disc*100).toFixed(0) + '% ينقذ ' + recoveredOrders.toLocaleString() + ' طلب شهرياً بقيمة ' + grossRecovered.toLocaleString() + '!') : ('Exit popups rescue high-intent abandoning shoppers before bounce.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'محاكي عروض نوافذ نية الخروج وحساب صافي الربح من الخصم المعروض للمتاجر' + ' (' + APP_ID + ') ===\n\n';
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
