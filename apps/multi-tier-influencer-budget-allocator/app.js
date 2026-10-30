/**
 * APP-058: Multi-Tier Influencer Budget Allocator (Nano, Micro, Macro)
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-058';
  var outputsList = ["Recommended Budget Split by Tier (Macro %, Micro %, Nano %)", "Target Number of Creators to Contract in Each Tier", "Projected Total Reach and Impression Count", "Projected Total Engagement Actions (Likes, Shares, Comments)", "Campaign Execution Timeline by Tier"];
  var defaultValues = {"total_budget": 50000, "brand_objective": "conversions", "market": "ksa"};

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
    var budget = Math.max(1000, inp.total_budget || 20000);
    var obj = inp.brand_objective || 'conversions';

    var nano = 0, micro = 0, mid = 0, macro = 0;
    if (obj === 'conversions') {
      nano = budget * 0.25;  // 1k-10k
      micro = budget * 0.50; // 10k-50k
      mid = budget * 0.25;   // 50k-250k
      macro = 0;
    } else {
      nano = budget * 0.10;
      micro = budget * 0.20;
      mid = budget * 0.35;
      macro = budget * 0.35;
    }

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'حصة صناع المحتوى الميكرو (Micro)' : 'Micro-Creators Allocation', val: micro.toLocaleString() },
        { label: isAr ? 'حصة صناع المحتوى النانو (Nano)' : 'Nano-Creators Allocation', val: nano.toLocaleString() },
        { label: isAr ? 'حصة المشاهير والمتوسطين' : 'Mid/Macro Influencers Share', val: (mid + macro).toLocaleString() }
      ],
      breakdown: [
        { label: isAr ? 'ميزانية فئة النانو (1k - 10k متابع)' : 'Nano Influencers Budget (High Trust)', val: nano.toLocaleString() },
        { label: isAr ? 'ميزانية فئة الميكرو (10k - 50k متابع)' : 'Micro Influencers Budget (Highest ROI)', val: micro.toLocaleString() },
        { label: isAr ? 'ميزانية الفئة المتوسطة (50k - 250k)' : 'Mid-Tier Influencers Budget', val: mid.toLocaleString() },
        { label: isAr ? 'ميزانية كبار المشاهير (Macro)' : 'Macro Influencers Budget', val: macro.toLocaleString() },
        { label: isAr ? 'الهدف التسويقي الأساسي' : 'Primary Campaign Objective', val: obj.toUpperCase() }
      ],
      alert: {
        type: 'success',
        title: isAr ? 'توزيع استراتيجي يحقق أعلى عائد على المبيعات' : 'Diversified Creator Portfolio Ready',
        text: isAr ? 'الاعتماد على شبكة واسعة من صناع المحتوى الصغار (Micro & Nano) يولد ثقة أعلى وتكلفة اكتساب أقل بكثير من المشاهير.' : 'Micro-creators deliver 3x higher relative engagement and conversion rates.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'موزع ميزانية الحملات على المشاهير حسب فئات المتابعين لتحقيق أعلى وصول' + ' (' + APP_ID + ') ===\n\n';
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
