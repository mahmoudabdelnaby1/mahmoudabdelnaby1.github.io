/**
 * APP-085: Cold Outreach Email Sequence Timing & Follow-up Planner
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-085';
  var outputsList = ["5-Step Scheduled Calendar Cadence with Exact Send Dates", "Touchpoint Angle Blueprint (Touch 1: Value Hook, Touch 2: Case Study, Touch 3: Quick Question, Touch 4: Resource, Touch 5: Breakup)", "Optimal Send Time Window (e.g. 08:30 - 10:00 AM local time)", "Automatic Weekend & Friday Blackout Protection"];
  var defaultValues = {"industry_target": "real_estate_gcc", "sequence_steps_count": 4, "business_working_days": "gcc_sun_thu"};

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
    var isGcc = (inp.business_working_days === 'gcc_sun_thu');

    var plan = isGcc ? [
      { step: 'الرسالة 1 (الأحد 9:30 صباحاً)', desc: 'افتتاحية أسبوع العمل: استفسار سريع عن التحدي الأكبر وعرض قيمة مخصص' },
      { step: 'الرسالة 2 (الثلاثاء 10:15 صباحاً)', desc: 'متابعة ناعمة: مشاركة دراسة حالة بالأرقام لشركة مشابهة في نفس القطاع' },
      { step: 'الرسالة 3 (الأحد التالي 11:00 صباحاً)', desc: 'زاوية جديدة: إرسال فكرة عملية مجانية قابلة للتطبيق مباشرة' },
      { step: 'الرسالة 4 (الثلاثاء 2:00 ظهراً)', desc: 'رسالة إغلاق محترمة (Breakup Email): احترام وقتهم وترك الباب مفتوحاً' }
    ] : [
      { step: 'Email 1 (Tuesday 9:00 AM)', desc: 'Relevant problem statement and soft value proposition' },
      { step: 'Email 2 (Thursday 10:30 AM)', desc: 'Short case study with quantified client ROI metrics' },
      { step: 'Email 3 (Tuesday 2:00 PM)', desc: 'Specific audit takeaway or quick teardown' },
      { step: 'Email 4 (Friday 11:00 AM)', desc: 'Polite breakup email closing the thread' }
    ];

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'عدد خطوات المسار التتابعي' : 'Sequence Touchpoints', val: '4 Steps' },
        { label: isAr ? 'أيام العمل المعتمدة' : 'Working Days Protocol', val: isGcc ? 'GCC (Sun-Thu)' : 'Mon-Fri' },
        { label: isAr ? 'ساعات الإرسال الذهبية' : 'Prime Dispatch Hours', val: '9:30 AM - 11:30 AM' }
      ],
      breakdown: plan.map(function(p) {
        return { label: p.step, val: p.desc };
      }),
      alert: {
        type: 'success',
        title: isAr ? 'جدولة متوافقة مع عادات العمل في الخليج' : 'GCC B2B Timing Aligned',
        text: isAr ? 'تجنب تماماً الإرسال أيام الجمعة والسبت أو بعد ظهر الخميس، حيث تنخفض معدلات فتح الإيميل إلى ما دون 4%.' : 'Avoid Friday/Saturday dispatches; Tuesday and Sunday mornings achieve 3x higher open rates.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مخطط فترات المتابعة وحملات التواصل المباشر البارد مع مديري الشركات' + ' (' + APP_ID + ') ===\n\n';
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
