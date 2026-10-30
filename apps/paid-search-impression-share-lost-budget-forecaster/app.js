/**
 * APP-078: Paid Search Impression Share & Lost Budget Due to Rank Forecaster
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-078';
  var outputsList = ["Total Potential Search Market Demand (Total Available Impressions)", "Uncaptured Impressions Due to Budget Limits", "Uncaptured Impressions Due to Poor Ad Rank/Bids", "Required Budget Increase to Capture 80% Impression Share", "Primary Action Priority (Add Budget vs Fix Landing Page & Quality Score)"];
  var defaultValues = {"search_impression_share_pct": 42, "lost_is_budget_pct": 38, "lost_is_rank_pct": 20, "current_monthly_spend": 12000, "current_conversions": 350};

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
    var isShare = Math.min(100, Math.max(1, inp.search_impression_share_pct || 40)) / 100;
    var lostBudget = Math.min(100, Math.max(0, inp.lost_is_budget_pct || 30)) / 100;
    var lostRank = Math.min(100, Math.max(0, inp.lost_is_rank_pct || 20)) / 100;
    var spend = Math.max(100, inp.current_monthly_spend || 5000);
    var convs = Math.max(1, inp.current_conversions || 100);

    var totalMarketOpportunitySpend = spend / isShare;
    var lostBudgetMoney = totalMarketOpportunitySpend * lostBudget;
    var lostConversionsDueToBudget = Math.round((convs / isShare) * lostBudget);

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'التحويلات المفقودة بسبب نقص الميزانية' : 'Lost Conversions (Budget)', val: '+' + lostConversionsDueToBudget + ' convs' },
        { label: isAr ? 'حصة الظهور المهدرة بسبب الميزانية' : 'Lost Impression Share (Budget)', val: (lostBudget*100).toFixed(1) + '%' },
        { label: isAr ? 'ميزانية التوسع الآمن المتاحة' : 'Uncapped Demand Budget', val: '$' + Math.round(lostBudgetMoney).toLocaleString() }
      ],
      breakdown: [
        { label: isAr ? 'حصة الظهور الحالية في البحث' : 'Current Search Impression Share', val: (isShare*100).toFixed(1) + '%' },
        { label: isAr ? 'حصة الظهور الضائعة بسبب نفاد الميزانية' : 'Lost IS (Budget)', val: (lostBudget*100).toFixed(1) + '%' },
        { label: isAr ? 'حصة الظهور الضائعة بسبب رتبة المزاد والـ Quality Score' : 'Lost IS (Rank)', val: (lostRank*100).toFixed(1) + '%' },
        { label: isAr ? 'الفرصة التوسعية المضمونة بدون منافسة جديدة' : 'Safe Scaling Headroom', val: '+' + lostConversionsDueToBudget + ' orders ready to capture' }
      ],
      alert: {
        type: lostBudget > 0.25 ? 'warning' : 'success',
        title: isAr ? ('حصة ضائعة بالميزانية: ' + (lostBudget*100).toFixed(0) + '%') : ('Lost IS Budget: ' + (lostBudget*100).toFixed(0) + '%'),
        text: isAr ? 'أنت تخسر عملاء يبحثون عنك بالاسم لأن حملتك تنفد ميزانيتها مبكراً كل يوم! زيادة الميزانية هنا ستولد مبيعات فورية بنفس التكلفة.' : 'Campaign is budget-capped; increasing daily caps immediately captures existing high-intent searchers.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'محلل حصة ظهور الإعلانات المفقودة بسبب الميزانية أو رتبة الإعلان' + ' (' + APP_ID + ') ===\n\n';
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
