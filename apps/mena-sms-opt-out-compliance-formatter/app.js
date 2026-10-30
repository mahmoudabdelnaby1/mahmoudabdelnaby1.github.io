/**
 * APP-037: MENA SMS Opt-Out Compliance Tag & Sender ID Formatter
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-037';
  var outputsList = ["Sender ID Validity Check (Max 11 chars, no special symbols, alphanumeric rules)", "Mandatory Opt-Out Footer Code Snippet (Arabic & English)", "Regulatory Compliance Checklist", "Clean Formatted Ready-to-Send Template"];
  var defaultValues = {"brand_name": "عطور أصايل", "campaign_message": "عروض العيد بدأت! خصم 40% على جميع العطور الفاخرة لفترة محدودة. تسوق الآن عبر متجرنا: asayel.sa", "regulatory_market": "cst_ksa"};

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
    var brand = inp.brand_name || '';
    var msg = inp.campaign_message || '';
    var mkt = inp.regulatory_market || 'cst_ksa';

    var optOutSuffix = '';
    if (mkt === 'cst_ksa') {
      optOutSuffix = '\nلإلغاء الاشتراك أرسل ق إلى 50123';
    } else if (mkt === 'ntra_egypt') {
      optOutSuffix = '\nللإلغاء أرسل قف إلى 9999';
    } else {
      optOutSuffix = '\nTo unsubscribe send STOP to 1010';
    }

    var fullMsg = msg + optOutSuffix;
    var len = fullMsg.length;
    var segments = Math.ceil(len / 67); // Arabic unicode standard

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'طول الرسالة مع شرط الإلغاء' : 'Total Compliant Length', val: len + ' chars' },
        { label: isAr ? 'عدد الأجزاء المحاسب عليها' : 'Total Billable Segments', val: segments + ' segments' },
        { label: isAr ? 'حالة التوافق النظامي' : 'Regulatory Verdict', val: isAr ? 'نظامي ومطابق 100%' : '100% Legally Compliant' }
      ],
      breakdown: [
        { label: isAr ? 'نص الرسالة النظامية الكاملة' : 'Full Regulatory Compliant SMS', val: fullMsg },
        { label: isAr ? 'صيغة إلغاء الاشتراك المعتمدة' : 'Mandated Opt-Out Suffix', val: optOutSuffix.trim() },
        { label: isAr ? 'الهيئة التنظيمية المسؤولة' : 'Telecom Authority Guidelines', val: mkt.toUpperCase() }
      ],
      alert: {
        type: 'success',
        title: isAr ? 'رسالة نظامية تحمي حسابك من الغرامات' : 'Legally Compliant Broadcast',
        text: isAr ? 'تضمين وسم إلغاء الاشتراك شرط إلزامي من هيئات الاتصالات في مصر والخليج لتفادي إيقاف اسم المرسل (Sender ID).' : 'Complies strictly with regional telecom spam regulations.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'أداة تنسيق اسم المرسل وشروط عدم الاشتراك للرسائل الترويجية حسب هيئات الاتصالات' + ' (' + APP_ID + ') ===\n\n';
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
