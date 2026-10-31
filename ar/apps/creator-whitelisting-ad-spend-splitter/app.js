/**
 * APP-057: Creator Whitelisting & Partnership Ad Spend Splitter
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-057';
  var outputsList = ["Remaining Paid Media Amplification Budget", "Paid Spend to Creator Fee Ratio (e.g. 4:1 Ratio)", "Required Conversion Volume to Cover Creator Fixed Fee", "Budget Allocation Health Score (Overpaid Creator vs Optimal Growth Ratio)"];
  var defaultValues = {"total_campaign_budget": 20000, "creator_content_licensing_fee": 4000, "paid_ad_spend_budget": 16000};

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
    var fee = Math.max(0, inp.creator_content_licensing_fee || 3000);
    var ads = Math.max(0, inp.paid_ad_spend_budget || 10000);
    var total = fee + ads;

    var feePct = total > 0 ? ((fee / total) * 100) : 0;
    var adsPct = total > 0 ? ((ads / total) * 100) : 0;

    var isAr = (lang === 'ar');
    var isBalanced = (feePct <= 30 && adsPct >= 70);

    return {
      metrics: [
        { label: isAr ? 'نسبة الإنفاق الإعلاني (Media)' : 'Paid Media Share %', val: adsPct.toFixed(1) + '%' },
        { label: isAr ? 'نسبة أتعاب صناعة المحتوى' : 'Creator Licensing Share %', val: feePct.toFixed(1) + '%' },
        { label: isAr ? 'تقييم كفاءة التوزيع' : 'Budget Efficiency Verdict', val: isBalanced ? (isAr ? 'توزيع مثالي (70/30)' : 'Optimal (70/30)') : (isAr ? 'أتعاب إنتاج مفرطة' : 'Top-Heavy Creative Fee') }
      ],
      breakdown: [
        { label: isAr ? 'ميزانية الإعلانات الممولة الموجهة للجمهور' : 'Paid Media Ad Spend', val: '$' + ads.toLocaleString() },
        { label: isAr ? 'أتعاب المؤثر وحقوق الترخيص (Whitelisting)' : 'Creator Content Fee', val: '$' + fee.toLocaleString() },
        { label: isAr ? 'إجمالي ميزانية الحملة المجمعة' : 'Total Combined Campaign Spend', val: '$' + total.toLocaleString() },
        { label: isAr ? 'المعادلة الذهبية الموصى بها' : 'Industry Standard Split', val: '20-30% Content Creation, 70-80% Paid Amplification' }
      ],
      alert: {
        type: isBalanced ? 'success' : 'warning',
        title: isAr ? (isBalanced ? 'توزيع مالي ذكي يعظم العائد' : 'تحذير: إنفاق زائد على صناعة المحتوى دون ميزانية توزيع كافية') : 'Budget Split Allocation',
        text: isAr ? 'أفضل الممارسات تقتضي رصد 70% إلى 80% من الميزانية للإعلانات الممولة خلف فيديو المؤثر لضمان وصوله لآلاف العملاء.' : 'Allocate at least 70% of budget to media spend behind the creator asset.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة توزيع الميزانية بين رسوم الترخيص للمنشئ والإنفاق الإعلاني Whitelisting' + ' (' + APP_ID + ') ===\n\n';
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
