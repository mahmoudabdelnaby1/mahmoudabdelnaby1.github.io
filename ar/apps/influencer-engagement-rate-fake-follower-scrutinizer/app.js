/**
 * APP-053: Influencer True Engagement Rate & Fake Follower Ratio Scrutinizer
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-053';
  var outputsList = ["Calculated Engagement Rate % (ER)", "Industry Tier Benchmark Comparison (Nano, Micro, Macro, Mega)", "Bot / Engagement Pod Anomaly Risk (Low / Suspicious / High Danger)", "Comment-to-Like Ratio Health (Normal 1-3% vs Bot Pods >10% or Zombie <0.1%)", "Verdict: Safe to Sponsor / High Risk Fraud"];
  var defaultValues = {"total_followers": 250000, "sample_post_likes": 3200, "sample_post_comments": 65, "platform": "instagram"};

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
    var followers = Math.max(10, inp.total_followers || 10000);
    var likes = Math.max(0, inp.sample_post_likes || 0);
    var comments = Math.max(0, inp.sample_post_comments || 0);

    var interactions = likes + (comments * 2);
    var er = (interactions / followers) * 100;
    var commentToLikeRatio = likes > 0 ? ((comments / likes) * 100) : 0;

    var isAr = (lang === 'ar');
    var suspicion = (er < 0.8 || commentToLikeRatio < 0.5) ? (isAr ? 'شبهة متابعين وهميين عالية' : 'High Fake Follower Suspicion') : (isAr ? 'تفاعل طبيعي وصحي' : 'Healthy Engagement');
    var alertType = (er < 0.8 || commentToLikeRatio < 0.5) ? 'danger' : 'success';

    return {
      metrics: [
        { label: isAr ? 'معدل التفاعل الحقيقي (ER)' : 'True Engagement Rate', val: er.toFixed(2) + '%' },
        { label: isAr ? 'نسبة التعليقات إلى الإعجابات' : 'Comment-to-Like Ratio', val: commentToLikeRatio.toFixed(2) + '%' },
        { label: isAr ? 'تقييم مصداقية الحساب' : 'Audience Authenticity', val: suspicion }
      ],
      breakdown: [
        { label: isAr ? 'معدل التفاعل الإجمالي' : 'True Engagement Rate (ER %)', val: er.toFixed(2) + '%' },
        { label: isAr ? 'نسبة التعليقات الطبيعية' : 'Comment Ratio vs Likes', val: commentToLikeRatio.toFixed(2) + '% (Benchmark: 1% - 5%)' },
        { label: isAr ? 'المعيار الطبيعي لحجم الحساب' : 'Industry Benchmark for Tier', val: followers > 100000 ? '1.2% - 2.5%' : '2.5% - 5.0%' },
        { label: isAr ? 'القرار الاستثماري الموصى به' : 'Collaboration Recommendation', val: (alertType === 'danger' ? (isAr ? 'تجنب التعاقد أو اطلب إحصائيات موثوقة' : 'Avoid or demand verified analytics') : (isAr ? 'حساب متفاعل ومناسب للتعاون' : 'Approved for collaboration')) }
      ],
      alert: {
        type: alertType,
        title: isAr ? ('تقييم مصداقية المؤثر: ' + suspicion) : ('Audience Verdict: ' + suspicion),
        text: isAr ? (alertType === 'danger' ? 'معدل التفاعل متدنٍ جداً نسبة لعدد المتابعين! احتمال كبير وجود متابعين وهميين أو حسابات خاملة.' : 'التفاعل حقيقي ومتوازن ويعكس اهتماماً فعلياً من الجمهور بالمحتوى.') : (alertType === 'danger' ? 'Disproportionately low engagement points to bought followers.' : 'Audience interactions align with healthy creator benchmarks.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'محلل معدل التفاعل الحقيقي واكتشاف نسب المتابعين الوهميين للحسابات' + ' (' + APP_ID + ') ===\n\n';
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
