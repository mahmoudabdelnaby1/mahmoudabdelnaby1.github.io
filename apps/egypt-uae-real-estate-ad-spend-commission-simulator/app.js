/**
 * APP-082: Egypt & UAE Real Estate Broker Ad Spend to Commission Ratio Simulator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-082';
  var outputsList = ["Gross Commission Earned per Closed Deal", "Total Ad Cost Invested to Close 1 Unit", "Net Broker Profit per Sale After Ad Spend", "Real Estate Advertising ROAS (Commission / Ad Spend)", "Maximum Permissible Cost Per Lead (CPL) to Maintain 70% Margin"];
  var defaultValues = {"property_selling_price": 1500000, "broker_commission_pct": 2.0, "ad_budget_allocated": 25000, "target_qualified_buyer_leads": 180, "expected_closing_rate_pct": 1.5};

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
    var price = Math.max(10000, inp.property_selling_price || 500000);
    var commPct = Math.min(10, Math.max(0.1, inp.broker_commission_pct || 2.0)) / 100;
    var ads = Math.max(1, inp.ad_budget_allocated || 10000);
    var leads = Math.max(1, inp.target_qualified_buyer_leads || 100);
    var closeRate = Math.min(100, Math.max(0.1, inp.expected_closing_rate_pct || 1.0)) / 100;

    var commissionPerSale = price * commPct;
    var expectedDeals = leads * closeRate;
    var grossCommissionEarned = expectedDeals * commissionPerSale;
    var netBrokerProfit = grossCommissionEarned - ads;
    var roi = (netBrokerProfit / ads) * 100;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'صافي أرباح الوساطة العقارية' : 'Net Broker Ad Profit', val: Math.round(netBrokerProfit).toLocaleString() + ' AED/EGP' },
        { label: isAr ? 'عمولة الصفقة الواحدة' : 'Commission per Closed Unit', val: commissionPerSale.toLocaleString() + ' AED/EGP' },
        { label: isAr ? 'العائد على الإنفاق الإعلاني (ROI)' : 'Broker Ad Spend ROI', val: (roi >= 0 ? '+' : '') + Math.round(roi) + '%' }
      ],
      breakdown: [
        { label: isAr ? 'إجمالي الصفقات المتوقع إغلاقها' : 'Projected Closed Deals', val: expectedDeals.toFixed(1) + ' ' + (isAr?'صفقة':'deals') },
        { label: isAr ? 'إجمالي العمولات المحصلة من المطور' : 'Gross Brokerage Commissions', val: Math.round(grossCommissionEarned).toLocaleString() },
        { label: isAr ? 'الميزانية الإعلانية المنفقة على الحملة' : 'Ad Campaign Investment', val: ads.toLocaleString() },
        { label: isAr ? 'تكلفة اكتساب العميل المشتري الفعلي' : 'Effective Cost per Closed Buyer', val: Math.round(ads / Math.max(0.1, expectedDeals)).toLocaleString() }
      ],
      alert: {
        type: netBrokerProfit > 0 ? 'success' : 'danger',
        title: isAr ? 'جدوى الحملة العقارية' : 'Real Estate Campaign Economics',
        text: isAr ? ('صفقة واحدة تكفي لتغطية كامل ميزانية الإعلانات وتوليد أرباح صافية ممتازة للوسيط العقاري.') : ('A single closing covers the entire lead generation ad spend.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'محاكي نسبة الإنفاق الإعلاني إلى عمولة الوسطاء العقاريين في مصر ودبي' + ' (' + APP_ID + ') ===\n\n';
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
