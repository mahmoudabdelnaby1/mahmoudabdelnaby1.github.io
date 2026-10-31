/**
 * APP-086: Event & Webinar Attendee Drop-off & Show-Up Rate Optimizer
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-086';
  var outputsList = ["Projected Live Attendee Headcount", "Projected Live Show-Up Rate % (e.g. 46.5%)", "Incremental Attendees Gained by Multi-Channel Reminders", "Optimal Multi-Touch Reminder Timing (24h before, 2h before, 10m before live)"];
  var defaultValues = {"registered_attendees_count": 600, "traffic_source": "paid_ads", "has_whatsapp_reminder_sequence": "yes"};

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
    var reg = Math.max(1, inp.registered_attendees_count || 100);
    var src = inp.traffic_source || 'paid_ads';
    var wa = (inp.has_whatsapp_reminder_sequence === 'yes');

    var baseRate = (src === 'organic_email') ? 0.42 : 0.24;
    if (wa) {
      baseRate += 0.22; // Massive lift with WhatsApp in MENA
    }
    var showUpRate = Math.min(0.85, baseRate);
    var attendees = Math.round(reg * showUpRate);

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'نسبة الحضور المباشر المتوقعة' : 'Predicted Show-Up Rate', val: (showUpRate * 100).toFixed(1) + '%' },
        { label: isAr ? 'عدد الحاضرين الفعلي المتوقع' : 'Live Attendees Count', val: attendees.toLocaleString() + ' attendees' },
        { label: isAr ? 'أثر تذكيرات واتساب' : 'WhatsApp Reminder Impact', val: wa ? '+22% Show-Up Lift' : 'No WA (+0%)' }
      ],
      breakdown: [
        { label: isAr ? 'إجمالي المسجلين في الويبنار' : 'Total Registered Attendees', val: reg.toLocaleString() },
        { label: isAr ? 'نسبة الحضور المباشر المقدرة' : 'Expected Live Show-Up %', val: (showUpRate*100).toFixed(1) + '%' },
        { label: isAr ? 'العدد المتوقع في الغرفة الافتراضية' : 'Live Audience in Session', val: attendees.toLocaleString() },
        { label: isAr ? 'تأثير قنوات التذكير' : 'Channel Lift Factor', val: wa ? (isAr ? 'تذكير واتساب يضاعف الحضور' : 'WhatsApp doubled attendance') : (isAr ? 'الإيميل فقط يسبب تسرب 70%' : 'Email-only loses 70% of signups') }
      ],
      alert: {
        type: wa ? 'success' : 'warning',
        title: isAr ? (wa ? 'معدل حضور قياسي بفضل واتساب' : 'تحذير: الإيميل وحده سيفقدك 75% من المسجلين!') : 'Webinar Show-Up Forecast',
        text: isAr ? 'في منطقة الشرق الأوسط، رسائل تذكير واتساب قبل الويبنار بساعة وبـ 10 دقائق ترفع الحضور من 24% إلى أكثر من 45%.' : 'WhatsApp SMS/Chat reminders increase MENA webinar show-up rates by +20%.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة ومحسن نسب حضور الفعاليات والندوات عبر الإنترنت في المنطقة' + ' (' + APP_ID + ') ===\n\n';
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
