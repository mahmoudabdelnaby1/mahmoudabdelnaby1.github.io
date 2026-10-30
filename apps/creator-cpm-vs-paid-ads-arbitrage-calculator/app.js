/**
 * APP-060: Creator CPM/CPE vs Direct Paid Ads Cost Arbitrage Calculator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-060';
  var outputsList = ["Influencer Effective CPM vs Paid Ad Auction CPM", "Influencer Effective CPC vs Paid Ad Auction CPC", "Impressions Gained or Lost Compared to Direct Ad Spend", "Arbitrage Efficiency Verdict (Influencer Arbitrage Win / Paid Ads Cheaper)", "Hybrid Recommendation (e.g. Sponsor for Content Asset, Scale via Ads)"];
  var defaultValues = {"influencer_fee": 4500, "guaranteed_or_average_views": 65000, "platform_paid_ad_cpm": 95, "organic_trust_multiplier": 1.4};

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
    var fee = Math.max(1, inp.influencer_fee || 1000);
    var views = Math.max(100, inp.guaranteed_or_average_views || 10000);
    var paidCpm = Math.max(1, inp.platform_paid_ad_cpm || 50);
    var trust = Math.max(1, inp.organic_trust_multiplier || 1.2);

    var creatorCpm = (fee / views) * 1000;
    var paidAdEquivalentCost = (views / 1000) * paidCpm;
    var arbitrageSavings = paidAdEquivalentCost - fee;

    var isAr = (lang === 'ar');
    var isProfitableArbitrage = (creatorCpm < paidCpm);

    return {
      metrics: [
        { label: isAr ? 'الـ CPM الفعلي للمؤثر' : 'Effective Creator CPM', val: creatorCpm.toFixed(2) + ' SAR' },
        { label: isAr ? 'تكلفة شراء نفس الظهور بالإعلانات' : 'Paid Ad Equivalent Cost', val: paidAdEquivalentCost.toFixed(2) + ' SAR' },
        { label: isAr ? 'فارق وفر التحكيم المالي (Arbitrage)' : 'Net Arbitrage Savings', val: (arbitrageSavings >= 0 ? '+' : '') + arbitrageSavings.toFixed(2) + ' SAR' }
      ],
      breakdown: [
        { label: isAr ? 'تكلفة الألف ظهور عبر المؤثر' : 'Creator CPM per 1k Views', val: creatorCpm.toFixed(2) + ' SAR' },
        { label: isAr ? 'تكلفة الألف ظهور عبر مزاد الإعلانات' : 'Platform Auction CPM Benchmark', val: paidCpm.toFixed(2) + ' SAR' },
        { label: isAr ? 'تكلفة الوصول لنفس عدد المشاهدين بالإعلانات' : 'Paid Ads Equivalent Spend', val: paidAdEquivalentCost.toFixed(2) + ' SAR' },
        { label: isAr ? 'معامل الثقة والمصداقية العضوية' : 'Organic Trust Multiplier', val: trust.toFixed(1) + 'x higher engagement' }
      ],
      alert: {
        type: isProfitableArbitrage ? 'success' : 'warning',
        title: isAr ? (isProfitableArbitrage ? 'فرصة تحكيم مالي ممتازة (Arbitrage Winner)!' : 'إعلانات المزاد أرخص من المؤثر') : 'Arbitrage Verdict',
        text: isAr ? ('التعاقد مع هذا المؤثر يمنحك ظهوراً أرخص من شراء إعلانات ممولة بنفس القيمة، مع ميزة الثقة العضوية الإضافية.') : ('Creator delivers reach cheaper than platform ad auction.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مقارن تكلفة الوصول والتفاعل بين إعلانات المنصات المباشرة ورعاية المؤثرين' + ' (' + APP_ID + ') ===\n\n';
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
