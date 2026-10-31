/**
 * APP-007: Ad Fatigue & Creative Decay Velocity Predictor
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-007';
  var outputsList = ["Creative Decay Index (0 - 100)", "Fatigue Stage (Fresh / Maturing / Saturated / Burned Out)", "Estimated Days Until CPA Exceeds Break-Even", "Prescribed Action (Refresh Hook / Swap Angles / Broaden Audience)"];
  var defaultValues = {"current_frequency": 3.2, "initial_ctr": 2.4, "current_ctr": 1.1, "daily_reach": 45000, "total_audience_size": 350000};

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
    var freq = Math.max(1, inp.current_frequency || 1);
    var initCtr = Math.max(0.01, inp.initial_ctr || 2.0);
    var currCtr = Math.max(0, inp.current_ctr || 1.0);
    var reach = Math.max(0, inp.daily_reach || 0);
    var audSize = Math.max(1, inp.total_audience_size || 100000);

    var ctrDropPct = ((initCtr - currCtr) / initCtr) * 100;
    var penetration = Math.min(1, (reach * freq) / audSize);
    var decayIndex = Math.min(100, Math.max(0, Math.round((ctrDropPct * 0.5) + (freq * 12) + (penetration * 20))));

    var isAr = (lang === 'ar');
    var stage = decayIndex > 75 ? (isAr ? 'محترق بالكامل (Burned Out)' : 'Burned Out') : (decayIndex > 50 ? (isAr ? 'تشبع متقدم (Saturated)' : 'Saturated') : (decayIndex > 25 ? (isAr ? 'في طور النضج (Maturing)' : 'Maturing') : (isAr ? 'طازج وفعال (Fresh)' : 'Fresh')));
    var alertType = decayIndex > 75 ? 'danger' : (decayIndex > 50 ? 'warning' : 'success');
    var daysLeft = decayIndex > 75 ? 0 : Math.max(1, Math.round((100 - decayIndex) / 6));

    return {
      metrics: [
        { label: isAr ? 'مؤشر إجهاد الإعلان (0-100)' : 'Creative Decay Index (0-100)', val: decayIndex + '/100' },
        { label: isAr ? 'مرحلة الإعلان' : 'Fatigue Stage', val: stage },
        { label: isAr ? 'الأيام المتبقية قبل كسر التعادل' : 'Estimated Days to Exceed CPA', val: daysLeft + ' ' + (isAr?'أيام':'days') }
      ],
      breakdown: [
        { label: isAr ? 'مؤشر الإجهاد المركب' : 'Creative Decay Index (0 - 100)', val: decayIndex.toString() },
        { label: isAr ? 'مرحلة إجهاد التصميم' : 'Fatigue Stage', val: stage },
        { label: isAr ? 'نسبة انخفاض النقر (CTR Drop)' : 'CTR Decline Percentage', val: ctrDropPct.toFixed(1) + '%' },
        { label: isAr ? 'الأيام المتوقعة قبل انهيار الـ CPA' : 'Estimated Days Until CPA Exceeds Break-Even', val: daysLeft.toString() },
        { label: isAr ? 'الإجراء العلاجي المقترح' : 'Prescribed Action', val: (decayIndex > 50 ? (isAr ? 'استبدال الخطاف البصري (Hook) واختبار زوايا تسويقية جديدة' : 'Refresh opening hook and introduce new angles') : (isAr ? 'الاستمرار في التوسع الطبيعي' : 'Continue normal scaling')) }
      ],
      alert: {
        type: alertType,
        title: isAr ? ('حالة التصميم: ' + stage) : ('Creative Status: ' + stage),
        text: isAr ? (decayIndex > 50 ? 'الإعلان يقترب من ذروة الإجهاد. الجمهور شاهد التصميم أكثر من اللازم، بادر بتغيير الفيديو فوراً.' : 'الإعلان يحقق أداءً جيداً دون مؤشرات تراجع خطيرة.') : (decayIndex > 50 ? 'Ad creative has reached saturation. Hook refresh required immediately.' : 'Creative performance remains within healthy benchmarks.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مؤشر إجهاد الإعلانات وسرعة تراجع أداء التصاميم والفيديوهات الإعلانية' + ' (' + APP_ID + ') ===\n\n';
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
