/**
 * APP-083: Lead Scoring Matrix & Sales Hand-Off Qualification Assessor
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-083';
  var outputsList = ["Composite Lead Score (0 - 100)", "Lead Classification (Tier 1: Sales Ready SQL / Tier 2: Marketing Nurture MQL / Tier 3: Disqualified)", "Recommended Sales Action (Immediate Phone Call within 15 mins / Automated WhatsApp / Email Nurture)", "Exportable Lead Routing Logic Rule (for CRM integration)"];
  var defaultValues = {"budget_authority": "c_level_owner", "company_size_tier": "mid_enterprise", "timeframe_to_buy": "immediate_30d", "specific_need_fit": "exact_match"};

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
    var authScores = { 'c_level_owner': 35, 'manager_evaluator': 20, 'individual_student': 5 };
    var sizeScores = { 'mid_enterprise': 25, 'sme_small': 15, 'micro_solo': 5 };
    var timeScores = { 'immediate_30d': 25, 'quarter_90d': 15, 'exploratory_future': 5 };
    var fitScores = { 'exact_match': 15, 'partial_fit': 10, 'unclear': 0 };

    var score = (authScores[inp.budget_authority] || 20) +
                (sizeScores[inp.company_size_tier] || 15) +
                (timeScores[inp.timeframe_to_buy] || 15) +
                (fitScores[inp.specific_need_fit] || 10);

    var isAr = (lang === 'ar');
    var tier = score >= 80 ? (isAr ? 'عميل ساخن مؤهل للشراء فوراً (Hot Lead)' : 'Hot Lead - Immediate Sales Call') : (score >= 55 ? (isAr ? 'عميل دافئ يحتاج متابعة وتغذية (Warm Lead)' : 'Warm Lead - Nurturing Sequence') : (isAr ? 'عميل بارد غير مؤهل حالياً (Cold Lead)' : 'Cold Lead - Unqualified'));
    var alertType = score >= 80 ? 'success' : (score >= 55 ? 'warning' : 'danger');

    return {
      metrics: [
        { label: isAr ? 'درجة تقييم العميل BANT (0-100)' : 'BANT Lead Score', val: score + ' / 100' },
        { label: isAr ? 'تصنيف أولوية المبيعات' : 'Sales Priority Tier', val: tier },
        { label: isAr ? 'سرعة المتابعة المطلوبة' : 'Action SLA', val: score >= 80 ? '< 2 Hours' : 'Automated Email' }
      ],
      breakdown: [
        { label: isAr ? 'تقييم الصلاحية والقرار المالي (Authority)' : 'Decision Authority Score', val: (authScores[inp.budget_authority] || 20) + ' / 35' },
        { label: isAr ? 'حجم المنشأة والملاءمة (Budget/Size)' : 'Organization Size Fit', val: (sizeScores[inp.company_size_tier] || 15) + ' / 25' },
        { label: isAr ? 'الإطار الزمني لقرار الشراء (Timeline)' : 'Purchasing Timeline Fit', val: (timeScores[inp.timeframe_to_buy] || 15) + ' / 25' },
        { label: isAr ? 'تطابق الاحتياج الفعلي (Need Fit)' : 'Need Urgency Match', val: (fitScores[inp.specific_need_fit] || 10) + ' / 15' }
      ],
      alert: {
        type: alertType,
        title: isAr ? ('تصنيف العميل: ' + tier) : ('Lead Verdict: ' + tier),
        text: isAr ? (score >= 80 ? 'العميل يملك الصلاحية والميزانية والحاجة الملحة. رتب اجتماعاً فورياً مع فريق المبيعات.' : 'العميل لا يملك القرار المباشر حالياً، ضعه في مسار التغذية بالبريد الإلكتروني بدلاً من إضاعة وقت مدراء المبيعات.') : 'Routing recommendation based on deterministic BANT assessment.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مصفوفة تقييم جودة العملاء المحتملين MQL to SQL لتحديد أولويات المبيعات' + ' (' + APP_ID + ') ===\n\n';
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
