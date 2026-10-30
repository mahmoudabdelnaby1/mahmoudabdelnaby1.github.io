/**
 * APP-054: Affiliate Marketing Commission Tier & Payout Simulator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-054';
  var outputsList = ["Affiliate Payout Amount per Sale", "Customer Discount Amount per Sale", "Net Merchant Profit Retained per Affiliate Order", "Combined Margin Erosion % (Discount + Commission)", "Tiered Scale Model (Tier 1: 1-50 sales, Tier 2: 51-200 sales, Tier 3: 200+ sales)"];
  var defaultValues = {"average_order_value": 280, "gross_margin_pct": 48, "customer_discount_code_pct": 10, "affiliate_commission_pct": 12};

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
    var aov = Math.max(1, inp.average_order_value || 100);
    var margin = Math.min(100, Math.max(1, inp.gross_margin_pct || 40)) / 100;
    var disc = Math.min(50, Math.max(0, inp.customer_discount_code_pct || 0)) / 100;
    var comm = Math.min(50, Math.max(0, inp.affiliate_commission_pct || 0)) / 100;

    var grossProfit = aov * margin;
    var customerDiscountVal = aov * disc;
    var netBilledToCustomer = aov - customerDiscountVal;
    var affiliatePayout = netBilledToCustomer * comm;
    var netRetainedProfit = grossProfit - customerDiscountVal - affiliatePayout;
    var retainedMarginPct = (netRetainedProfit / aov) * 100;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'صافي ربح المتجر بعد العمولة والخصم' : 'Net Retained Profit per Sale', val: netRetainedProfit.toFixed(2) },
        { label: isAr ? 'عمولة المسوق بالعمولة' : 'Affiliate Commission Payout', val: affiliatePayout.toFixed(2) },
        { label: isAr ? 'الهامش المتبقي للمتجر' : 'Retained Net Margin %', val: retainedMarginPct.toFixed(1) + '%' }
      ],
      breakdown: [
        { label: isAr ? 'إجمالي الربح قبل الخصومات' : 'Gross Profit per Order', val: grossProfit.toFixed(2) },
        { label: isAr ? 'قيمة الخصم الممنوح للمشتري' : 'Customer Discount Amount', val: customerDiscountVal.toFixed(2) },
        { label: isAr ? 'قيمة عمولة المسوق المسددة' : 'Affiliate Payout Amount', val: affiliatePayout.toFixed(2) },
        { label: isAr ? 'صافي الربح الفعلي المتبقي في خزينة المتجر' : 'Final Retained Profit', val: netRetainedProfit.toFixed(2) }
      ],
      alert: {
        type: netRetainedProfit > 0 ? (retainedMarginPct >= 20 ? 'success' : 'warning') : 'danger',
        title: isAr ? (netRetainedProfit > 0 ? 'هيكل عمولة رابح ومحفز' : 'تحذير: عمولة الأفلييت تسبب خسائر!') : 'Affiliate Unit Economics Verdict',
        text: isAr ? (netRetainedProfit <= 0 ? 'مجموع خصم العميل وعمولة المسوق يتجاوز هامش ربحك! قلل نسبة العمولة أو الخصم فوراً.' : 'برنامج العمولة متوازن ويضمن ربحية ممتازة للمتجر ومكافأة عادلة للمسوق.') : 'Structure safely preserves merchant margins.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'محاكي شرائح العمولات ونسب الأرباح لبرامج التسويق بالعمولة المحلية' + ' (' + APP_ID + ') ===\n\n';
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
