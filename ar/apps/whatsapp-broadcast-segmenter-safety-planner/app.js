/**
 * APP-033: WhatsApp Broadcast List Segmenter & Anti-Ban Timing Planner
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-033';
  var outputsList = ["Recommended Safe Batch Size (e.g. 25 messages per batch)", "Recommended Randomized Delay (e.g. 15-45 seconds between sends)", "Total Safe Sending Duration (Hours/Days)", "Anti-Ban Warm-up Schedule & Checklist"];
  var defaultValues = {"total_audience_count": 12000, "daily_message_limit": 1000, "warmup_phase": "tier_2"};

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
    var audience = Math.max(1, inp.total_audience_count || 1000);
    var tierLimits = { 'tier_1': 250, 'tier_2': 1000, 'tier_3': 10000, 'tier_4': 100000 };
    var limit = tierLimits[inp.warmup_phase] || 1000;

    var daysNeeded = Math.ceil(audience / limit);
    var messagesPerHour = Math.round(limit / 10); // Safe 10-hour daytime sending window
    var delaySeconds = Math.max(3, Math.round(3600 / messagesPerHour));

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'الأيام المطلوبة للإرسال الآمن' : 'Safe Campaign Duration', val: daysNeeded + ' ' + (isAr?'أيام':'days') },
        { label: isAr ? 'الحد اليومي الآمن للحساب' : 'Daily Safety Cap', val: limit.toLocaleString() + ' ' + (isAr?'عميل/يوم':'users/day') },
        { label: isAr ? 'الفاصل الزمني بين الرسائل' : 'Recommended Throttle Delay', val: delaySeconds + ' ' + (isAr?'ثوانٍ':'sec') }
      ],
      breakdown: [
        { label: isAr ? 'إجمالي حجم قائمة العملاء المستهدفة' : 'Total Broadcast Audience', val: audience.toLocaleString() },
        { label: isAr ? 'مستوى الحساب في واتساب بزنس' : 'Meta Business Messaging Tier', val: inp.warmup_phase.toUpperCase() + ' (' + limit.toLocaleString() + '/day)' },
        { label: isAr ? 'عدد الرسائل الآمن في الساعة' : 'Hourly Dispatch Velocity', val: messagesPerHour.toLocaleString() + ' msg/hr' },
        { label: isAr ? 'المدة الإجمالية للانتهاء بدون حظر' : 'Full Broadcast Pacing Plan', val: daysNeeded + ' ' + (isAr?'أيام على دفعات':'days in phased batches') }
      ],
      alert: {
        type: daysNeeded > 1 ? 'warning' : 'success',
        title: isAr ? 'خطة جدولة آمنة لتفادي حظر الرقم' : 'Anti-Ban Throttling Plan',
        text: isAr ? ('إرسال ' + audience.toLocaleString() + ' رسالة دفعة واحدة سيعرض الرقم للحظر فوراً! قسم الإرسال على ' + daysNeeded + ' أيام بمعدل ' + limit.toLocaleString() + ' رسالة يومياً.') : ('Spreading broadcast over ' + daysNeeded + ' days prevents Meta spam flag.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مخطط ومقسم قوائم رسائل الواتساب مع فترات التباعد الآمنة لمنع حظر الرقم' + ' (' + APP_ID + ') ===\n\n';
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
