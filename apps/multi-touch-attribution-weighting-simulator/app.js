/**
 * APP-072: Multi-Touch Attribution Weighting Model Simulator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-072';
  var outputsList = ["Revenue Allocated per Channel across 5 Attribution Models", "Comparative Attribution Matrix Table (First-Click vs Last-Click vs Position-Based)", "Top-of-Funnel Brand Lift Underestimation Warning", "Strategic Budget Rebalancing Recommendation"];
  var defaultValues = {"total_conversions": 1000, "channel_touchpoints": "TikTok Spark Ads, Instagram Retargeting, WhatsApp Chat, Google Search", "attribution_model": "position_based"};

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
    var convs = Math.max(1, inp.total_conversions || 100);
    var model = inp.attribution_model || 'position_based';

    var cFirst = 0, cMid1 = 0, cMid2 = 0, cLast = 0;
    if (model === 'position_based') {
      cFirst = convs * 0.40;
      cMid1 = convs * 0.10;
      cMid2 = convs * 0.10;
      cLast = convs * 0.40;
    } else if (model === 'last_touch') {
      cFirst = 0; cMid1 = 0; cMid2 = 0; cLast = convs;
    } else if (model === 'linear') {
      cFirst = convs * 0.25; cMid1 = convs * 0.25; cMid2 = convs * 0.25; cLast = convs * 0.25;
    } else { // time decay
      cFirst = convs * 0.10; cMid1 = convs * 0.20; cMid2 = convs * 0.30; cLast = convs * 0.40;
    }

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'رصيد لمسة الاكتشاف الأولى' : 'First-Touch Credit', val: Math.round(cFirst) + ' convs' },
        { label: isAr ? 'رصيد اللمسة الختامية' : 'Last-Touch Credit', val: Math.round(cLast) + ' convs' },
        { label: isAr ? 'نموذج الإسناد المطبق' : 'Active Attribution Model', val: model }
      ],
      breakdown: [
        { label: isAr ? 'قناة الاكتشاف الأولى (Top of Funnel)' : 'First Touch (TikTok Spark)', val: Math.round(cFirst) + ' conversions (' + ((cFirst/convs)*100).toFixed(0) + '%)' },
        { label: isAr ? 'قناة التغذية وإعادة الاستهداف' : 'Mid-Funnel Retargeting (Instagram)', val: Math.round(cMid1) + ' conversions' },
        { label: isAr ? 'قناة التفاعل المباشر' : 'Mid-Funnel Engagement (WhatsApp)', val: Math.round(cMid2) + ' conversions' },
        { label: isAr ? 'قناة إغلاق الشراء النهائي' : 'Last Converting Touch (Google / Direct)', val: Math.round(cLast) + ' conversions (' + ((cLast/convs)*100).toFixed(0) + '%)' }
      ],
      alert: {
        type: 'info',
        title: isAr ? 'فهم القيمة الحقيقية لكل قناة في رحلة العميل' : 'Multi-Touch Insights',
        text: isAr ? 'الاعتماد على اللمسة الأخيرة فقط يظلم قنوات الاكتشاف الأولى (مثل تيك توك وسناب) التي لولاها لما بحث العميل عن اسم متجرك.' : 'Avoid last-touch bias; top-of-funnel channels initiate the journey.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'محاكي نماذج العزو التسويقي: أول نقرة، آخر نقرة، خطي، وتناقص زمني' + ' (' + APP_ID + ') ===\n\n';
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
