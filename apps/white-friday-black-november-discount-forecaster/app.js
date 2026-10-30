/**
 * APP-091: White Friday / Black November Mega-Sale Discount & Stock Forecaster
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-091';
  var outputsList = ["Sale Selling Price per Unit", "Net Profit Margin per Unit Sold During Sale", "Total Projected Net Profit from Campaign", "Maximum Permissible Ad Spend (CPA) per Sale to Break Even", "Volume Multiplier Needed to Match Regular Month Gross Profit"];
  var defaultValues = {"standard_retail_price": 380, "product_cogs": 120, "planned_discount_pct": 35, "inventory_units_to_clear": 1200, "blended_shipping_cost": 35};

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
    var price = Math.max(1, inp.standard_retail_price || 100);
    var cogs = Math.max(0, inp.product_cogs || 0);
    var disc = Math.min(90, Math.max(0, inp.planned_discount_pct || 0)) / 100;
    var units = Math.max(1, inp.inventory_units_to_clear || 100);
    var ship = Math.max(0, inp.blended_shipping_cost || 0);

    var salePrice = price * (1 - disc);
    var profitPerUnit = salePrice - cogs - ship;
    var totalProfit = profitPerUnit * units;
    var regularProfit = price - cogs - ship;
    var volumeMultiplier = profitPerUnit > 0 ? (regularProfit / profitPerUnit) : 999;
    var marginPct = salePrice > 0 ? ((profitPerUnit / salePrice) * 100) : 0;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'سعر البيع أثناء التخفيضات' : 'Sale Display Price', val: salePrice.toFixed(2) },
        { label: isAr ? 'صافي الربح المتوقع من الحملة' : 'Total Campaign Net Profit', val: Math.round(totalProfit).toLocaleString() },
        { label: isAr ? 'الحد الأقصى لـ CPA لنقطة التعادل' : 'Max Break-Even CPA', val: Math.max(0, profitPerUnit).toFixed(2) }
      ],
      breakdown: [
        { label: isAr ? 'سعر البيع بعد خصم الـ ' + (disc*100).toFixed(0) + '%' : 'Promotional Sale Price', val: salePrice.toFixed(2) },
        { label: isAr ? 'هامش الربح للقطعة المباعة في العرض' : 'Unit Net Profit in Promo', val: profitPerUnit.toFixed(2) },
        { label: isAr ? 'نسبة الربح الصافية بعد الخصم والشحن' : 'Retained Net Margin %', val: marginPct.toFixed(1) + '%' },
        { label: isAr ? 'مضاعف المبيعات المطلوب لتعويض الخصم' : 'Required Volume Multiplier', val: volumeMultiplier.toFixed(2) + 'x more units needed' }
      ],
      alert: {
        type: profitPerUnit > 0 ? 'success' : 'danger',
        title: isAr ? (profitPerUnit > 0 ? 'عرض الجمعة البيضاء رابح ومحمي' : 'تحذير: الخصم يبيع بخسارة!') : 'White Friday Margin Verdict',
        text: isAr ? (profitPerUnit > 0 ? ('العرض يحقق ربحاً إجمالياً ' + Math.round(totalProfit).toLocaleString() + ' مع تصريف ' + units.toLocaleString() + ' قطعة من المخزون.') : 'سعر البيع بعد الخصم أقل من تكلفة البضاعة والشحن! خفض نسبة الخصم فوراً.') : 'Promo price safely clears stock with positive unit margins.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مخطط خصومات وعروض الجمعة البيضاء ونوفمبر للتوازن بين الربح وحجم المبيعات' + ' (' + APP_ID + ') ===\n\n';
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
