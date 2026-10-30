/**
 * APP-019: Product Bundle Pricing & Cannibalization Margin Analyzer
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-019';
  var outputsList = ["Standalone Combined Price vs Bundle Selling Price", "Bundle Net Profit Contribution per Order", "Shipping Cost Savings Saved by Single Parcel Delivery", "Volume Multiplier Required to Equal Single-Item Profit", "Pricing Recommendation"];
  var defaultValues = {"product_1_price": 180, "product_1_cogs": 60, "product_2_price": 120, "product_2_cogs": 35, "bundle_discount_pct": 15, "single_shipping_cost": 25};

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
    var p1 = Math.max(0, inp.product_1_price || 0);
    var c1 = Math.max(0, inp.product_1_cogs || 0);
    var p2 = Math.max(0, inp.product_2_price || 0);
    var c2 = Math.max(0, inp.product_2_cogs || 0);
    var disc = Math.min(90, Math.max(0, inp.bundle_discount_pct || 0)) / 100;
    var ship = Math.max(0, inp.single_shipping_cost || 0);

    var combinedRetail = p1 + p2;
    var totalCogs = c1 + c2;
    var bundlePrice = combinedRetail * (1 - disc);
    var standaloneProfit = combinedRetail - totalCogs - (2 * ship);
    var bundleProfit = bundlePrice - totalCogs - ship;
    var diff = bundleProfit - standaloneProfit;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'سعر بيع الباقة الترويجية' : 'Bundle Selling Price', val: bundlePrice.toFixed(2) },
        { label: isAr ? 'صافي ربح الباقة للطلب' : 'Bundle Net Profit per Order', val: bundleProfit.toFixed(2) },
        { label: isAr ? 'توفير تكلفة الشحن الموحد' : 'Shipping Cost Saved', val: ship.toFixed(2) }
      ],
      breakdown: [
        { label: isAr ? 'السعر الأصلي للمنتجين منفصلين' : 'Standalone Combined Retail Price', val: combinedRetail.toFixed(2) },
        { label: isAr ? 'سعر بيع الباقة بعد الخصم' : 'Bundle Selling Price', val: bundlePrice.toFixed(2) },
        { label: isAr ? 'تكلفة البضاعة المجمعة (COGS)' : 'Combined Product Cost (COGS)', val: totalCogs.toFixed(2) },
        { label: isAr ? 'الربح الصافي للباقة لكل شحنة' : 'Bundle Net Profit per Order', val: bundleProfit.toFixed(2) },
        { label: isAr ? 'فارق الربح مقارنة ببيعهما منفصلين' : 'Profit Difference vs Separate Sales', val: (diff >= 0 ? '+' : '') + diff.toFixed(2) }
      ],
      alert: {
        type: bundleProfit > 0 ? 'success' : 'danger',
        title: isAr ? (bundleProfit > standaloneProfit ? 'باقة رابحة جداً وتوفر مصاريف الشحن' : 'باقة مقبولة تسهم في سرعة تصريف المخزون') : 'Bundle Profitability Alert',
        text: isAr ? 'دمج المنتجين في طرد واحد يوفر تكلفة شحن كاملة ويعوض الخصم الممنوح للمشتري.' : 'Consolidating into a single parcel preserves margins despite the bundle discount.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'محلل تسعير البكجات والعروض المجمعة لحماية هامش الربح وزيادة السلة' + ' (' + APP_ID + ') ===\n\n';
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
