/**
 * APP-011: Egypt & GCC COD Return Rate (RTO) Loss & Profitability Simulator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-011';
  var outputsList = ["Delivered vs Returned Package Count", "Total Unrecoverable Shipping Loss from RTO", "Total Wasted Ad Spend on Refused Orders", "True Realized Net Profit (vs Phantom Gross Profit)", "Maximum Permissible RTO Rate before Negative Cashflow"];
  var defaultValues = {"dispatched_orders": 1000, "average_order_value": 450, "product_cogs": 150, "forward_shipping_cost": 55, "reverse_shipping_fee": 35, "delivery_success_rate_pct": 72, "ad_spend_total": 85000};

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
    var orders = Math.max(1, inp.dispatched_orders || 100);
    var aov = Math.max(1, inp.average_order_value || 100);
    var cogs = Math.max(0, inp.product_cogs || 0);
    var fShip = Math.max(0, inp.forward_shipping_cost || 0);
    var rShip = Math.max(0, inp.reverse_shipping_fee || 0);
    var succRate = Math.min(100, Math.max(0, inp.delivery_success_rate_pct || 70));
    var ads = Math.max(0, inp.ad_spend_total || 0);

    var delivered = Math.round(orders * (succRate / 100));
    var rto = orders - delivered;
    var rev = delivered * aov;
    var totalShip = (orders * fShip) + (rto * rShip);
    var totalCogs = delivered * cogs;
    var netProfit = rev - totalCogs - totalShip - ads;
    var marginPct = rev > 0 ? ((netProfit / rev) * 100) : 0;
    var rtoBleed = rto * (fShip + rShip);

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'صافي الربح الفعلي' : 'True Net Profit', val: netProfit.toLocaleString() + ' EGP/SAR' },
        { label: isAr ? 'هامش الربح الصافي' : 'Net Margin %', val: marginPct.toFixed(1) + '%' },
        { label: isAr ? 'نزيف خسائر الـ RTO' : 'Total RTO Loss Bleed', val: rtoBleed.toLocaleString() + ' EGP/SAR' }
      ],
      breakdown: [
        { label: isAr ? 'الطلبات المسلمة والمحصلة' : 'Delivered & Collected Orders', val: delivered.toLocaleString() + ' / ' + orders.toLocaleString() + ' (' + succRate + '%)' },
        { label: isAr ? 'الطلبات المرتجعة المرفوضة (RTO)' : 'Refused Return Orders (RTO)', val: rto.toLocaleString() },
        { label: isAr ? 'إجمالي الإيراد الفعلي المحصل' : 'Collected Net Revenue', val: rev.toLocaleString() },
        { label: isAr ? 'إجمالي تكلفة الشحن ذهاباً وإياباً' : 'Total Logistics Cost (Forward + Return)', val: totalShip.toLocaleString() },
        { label: isAr ? 'صافي الربح بعد البضاعة والشحن والإعلانات' : 'Net Operational Profit', val: netProfit.toLocaleString() }
      ],
      alert: {
        type: netProfit > 0 ? (marginPct > 15 ? 'success' : 'warning') : 'danger',
        title: isAr ? (netProfit > 0 ? 'مشروع رابح' : 'تنبيه: العمليات تحقق خسارة!') : (netProfit > 0 ? 'Profitable COD Operation' : 'Loss-Making Alert!'),
        text: isAr ? (netProfit <= 0 ? 'نسبة المرتجع وتكلفة الإعلانات تبتلع كامل الأرباح. مطلوب تأكيد الطلبات عبر واتساب فوراً.' : 'نسبة الاستلام الحالية تحقق أرباحاً جيدة، استمر في مراقبة تكلفة الشحن المرتجع.') : (netProfit <= 0 ? 'High RTO and ad spend are eroding all profits. Implement WhatsApp order confirmation.' : 'Healthy operations with positive margins.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'محاكي خسائر مرتجعات الدفع عند الاستلام RTO وصافي الأرباح الحقيقي' + ' (' + APP_ID + ') ===\n\n';
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
