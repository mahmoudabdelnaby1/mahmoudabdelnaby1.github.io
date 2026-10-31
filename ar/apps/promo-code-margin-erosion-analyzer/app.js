/**
 * APP-056: Promo Code Performance & Discount Margin Erosion Analyzer
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-056';
  var outputsList = ["Total Discount Dollar/SAR Bleed Given Away", "True Incremental Sales (Excluding Organic Leakage)", "Real Campaign ROAS & Net Profit Contribution", "Effective Cost per Truly Incremental Customer", "Code Extension Verdict (Renew / Renegotiate / Terminate Code)"];
  var defaultValues = {"full_retail_price": 350, "cogs": 110, "discount_code_pct": 15, "creator_commission_pct": 10, "fixed_shipping_cost": 35};

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
    var price = Math.max(1, inp.full_retail_price || 100);
    var cogs = Math.max(0, inp.cogs || 0);
    var disc = Math.min(90, Math.max(0, inp.discount_code_pct || 0)) / 100;
    var comm = Math.min(50, Math.max(0, inp.creator_commission_pct || 0)) / 100;
    var ship = Math.max(0, inp.fixed_shipping_cost || 0);

    var discountedPrice = price * (1 - disc);
    var creatorFee = discountedPrice * comm;
    var regularProfit = price - cogs - ship;
    var promoProfit = discountedPrice - cogs - ship - creatorFee;
    var marginErosion = regularProfit - promoProfit;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'صافي الربح مع كود المؤثر' : 'Net Profit with Promo Code', val: promoProfit.toFixed(2) },
        { label: isAr ? 'تآكل هامش الربح' : 'Profit Margin Erosion', val: '-' + marginErosion.toFixed(2) },
        { label: isAr ? 'نسبة الربح المتبقية' : 'Retained Net Margin %', val: ((promoProfit / discountedPrice) * 100).toFixed(1) + '%' }
      ],
      breakdown: [
        { label: isAr ? 'سعر البيع الأصلي قبل العرض' : 'Regular Retail Price', val: price.toFixed(2) },
        { label: isAr ? 'سعر البيع بعد خصم الكود للعميل' : 'Discounted Consumer Price', val: discountedPrice.toFixed(2) },
        { label: isAr ? 'عمولة المؤثر المخصومة' : 'Creator Commission Paid', val: creatorFee.toFixed(2) },
        { label: isAr ? 'صافي الربح للطلب الواحد' : 'True Net Profit per Unit', val: promoProfit.toFixed(2) },
        { label: isAr ? 'حجم المبيعات الإضافي المطلوب للتعويض' : 'Volume Multiplier to Match Profit', val: (promoProfit > 0 ? (regularProfit / promoProfit).toFixed(2) + 'x' : 'Infinite') }
      ],
      alert: {
        type: promoProfit > 0 ? 'success' : 'danger',
        title: isAr ? (promoProfit > 0 ? 'كود الخصم يحافظ على الربحية' : 'تنبيه: كود الخصم يسبب خسارة مباشرة!') : 'Margin Erosion Verdict',
        text: isAr ? 'يجب أن تزيد مبيعات الكود بنسبة لا تقل عن التعويض الرياضي لتبرير تقديم هذا الخصم والعمولة.' : 'Ensure influencer order volume compensates for the margin compression.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'محلل أداء كودات الخصم ومدى تآكل هامش الربح لكل كود مؤثر للمتاجر' + ' (' + APP_ID + ') ===\n\n';
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
