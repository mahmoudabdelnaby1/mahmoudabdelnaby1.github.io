/**
 * APP-051: GCC Influencer Rate Benchmark & Fair Price Estimator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-051';
  var outputsList = ["Fair Market Price Range (Low, Median, Premium SAR/AED)", "Equivalent CPM (Cost Per 1,000 Real Views)", "Overpricing Warning Index (compared to paid ad CPM equivalents)", "Negotiation Counter-Offer Strategy & Talking Points"];
  var defaultValues = {"platform": "snapchat", "average_story_views": 35000, "influencer_niche": "beauty_fashion", "deliverables": "story_set"};

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
    var views = Math.max(100, inp.average_story_views || 10000);
    var plat = inp.platform || 'snapchat';

    // Regional CPM rates per 1,000 genuine views (SAR)
    var cpmRates = { 'snapchat': 110, 'instagram': 135, 'tiktok': 75 };
    var baseCpm = cpmRates[plat] || 100;

    var fairRate = (views / 1000) * baseCpm;
    var lowRange = fairRate * 0.80;
    var highRange = fairRate * 1.25;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'السعر العادل التقديري للإعلان' : 'Fair Estimated Rate', val: Math.round(fairRate).toLocaleString() + ' SAR' },
        { label: isAr ? 'النطاق التفاوضي المقبول' : 'Negotiation Range', val: Math.round(lowRange).toLocaleString() + ' - ' + Math.round(highRange).toLocaleString() + ' SAR' },
        { label: isAr ? 'معدل الـ CPM المعياري' : 'Benchmark Cost per 1k Views', val: baseCpm + ' SAR/CPM' }
      ],
      breakdown: [
        { label: isAr ? 'متوسط المشاهدات المعتمد للحساب' : 'Average Verified Viewership', val: views.toLocaleString() + ' ' + (isAr?'مشاهدة':'views') },
        { label: isAr ? 'تكلفة الألف مشاهدة الفعلية (CPM)' : 'Effective Fair CPM', val: baseCpm + ' SAR' },
        { label: isAr ? 'الحد الأدنى المقبول للتفاوض' : 'Minimum Negotiation Floor', val: Math.round(lowRange).toLocaleString() + ' SAR' },
        { label: isAr ? 'الحد الأقصى العادل للإعلان' : 'Maximum Fair Ceiling', val: Math.round(highRange).toLocaleString() + ' SAR' }
      ],
      alert: {
        type: 'info',
        title: isAr ? 'دليل التسعير العادل للمؤثرين بالخليج' : 'GCC Fair Pricing Benchmark',
        text: isAr ? 'لا تدفع بناءً على عدد المتابعين؛ التسعير الصحيح يعتمد حصرياً على متوسط مشاهدات السناب الأخيرة المثبتة بلقطة شاشة موثقة.' : 'Base pricing on verified recent story view screenshots, never vanity follower counts.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مقدر الأسعار العادلة ومؤشرات تكلفة مشاهير السوشيال ميديا في الخليج' + ' (' + APP_ID + ') ===\n\n';
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
