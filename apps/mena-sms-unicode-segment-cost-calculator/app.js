/**
 * APP-032: MENA SMS Unicode Segment & Cost Calculator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-032';
  var outputsList = ["Detected Encoding (GSM-7 Standard vs UCS-2 Unicode)", "Billable Parts per Message (1, 2, 3... segments)", "Characters Remaining Until Next Segment Trigger", "Total Campaign Send Cost", "High-Cost Character Highlighter (Identifies emojis, smart quotes, hidden symbols)"];
  var defaultValues = {"sms_text": "خصم خاص 30% بمناسبة يوم التأسيس! استخدم كود KSA30 واستمتع بشحن مجاني لطلبك اليوم: https://store.sa/sale", "recipient_volume": 15000, "cost_per_sms": 0.08};

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
    var text = inp.sms_text || '';
    var recipients = Math.max(1, inp.recipient_volume || 1000);
    var unitCost = Math.max(0.001, inp.cost_per_sms || 0.05);

    // Detect Unicode (Arabic)
    var isUnicode = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);

    var maxFirst = isUnicode ? 70 : 160;
    var maxConcat = isUnicode ? 67 : 153;

    var len = text.length;
    var segments = 1;
    if (len > maxFirst) {
      segments = Math.ceil(len / maxConcat);
    }
    var totalSmsUnits = recipients * segments;
    var totalCost = totalSmsUnits * unitCost;

    var charsLeftInCurrent = (segments === 1) ? (maxFirst - len) : ((segments * maxConcat) - len);

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'إجمالي تكلفة الحملة' : 'Total Campaign Cost', val: '$' + totalCost.toFixed(2) },
        { label: isAr ? 'عدد أجزاء الرسالة (Segments)' : 'SMS Segments per User', val: segments + ' ' + (isAr?'أجزاء':'segments') },
        { label: isAr ? 'نوع الترميز' : 'Encoding Protocol', val: isUnicode ? 'UCS-2 / Unicode (Arabic)' : 'GSM 7-bit (Latin)' }
      ],
      breakdown: [
        { label: isAr ? 'إجمالي طول النص (حرف)' : 'Character Count', val: len + ' ' + (isAr?'حرفاً':'chars') },
        { label: isAr ? 'الحد الأقصى للجزء' : 'Segment Boundary Limit', val: (segments === 1 ? maxFirst : maxConcat) + ' ' + (isAr?'حرف للجزء':'chars/seg') },
        { label: isAr ? 'الحروف المتبقية قبل فتح جزء جديد' : 'Remaining Chars in Current Segment', val: charsLeftInCurrent + ' ' + (isAr?'حرف':'chars') },
        { label: isAr ? 'إجمالي وحدات SMS المحاسب عليها' : 'Total Billable SMS Messages', val: totalSmsUnits.toLocaleString() },
        { label: isAr ? 'التكلفة الإجمالية للحملة' : 'Total Invoiced SMS Cost', val: '$' + totalCost.toFixed(2) }
      ],
      alert: {
        type: segments > 1 ? 'warning' : 'success',
        title: isAr ? (segments > 1 ? 'تنبيه: الرسالة مقسمة إلى ' + segments + ' أجزاء!' : 'رسالة ممتازة في جزء واحد') : (segments > 1 ? 'Multi-Segment Cost Alert (' + segments + 'x)' : 'Single Segment Efficient'),
        text: isAr ? (segments > 1 ? ('أنت تدفع ' + segments + ' أضعاف التكلفة لكل عميل! اختصر ' + (len - maxFirst) + ' حرفاً لخفض الميزانية للنصف فوراً.') : 'الرسالة محصورة في جزء واحد، مما يحقق أعلى كفاءة اقتصادية للحملة.') : (segments > 1 ? 'You are paying ' + segments + 'x SMS billing. Shorten text to save budget.' : 'Optimized single segment delivery.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة أجزاء وتكلفة الرسائل النصية SMS للنصوص العربية والإنجليزية لشبكات الاتصالات' + ' (' + APP_ID + ') ===\n\n';
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
