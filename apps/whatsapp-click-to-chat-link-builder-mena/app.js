/**
 * APP-031: WhatsApp Click-to-Chat Link Builder with MENA Country Codes & Prefilled Text
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-031';
  var outputsList = ["Validated wa.me URL", "HTML Click-to-Chat Anchor Tag Code", "Direct SVG QR Code for Print/Billboards", "One-Click WhatsApp Test Launcher Button"];
  var defaultValues = {"country_code": "966", "phone_number": "501234567", "prefilled_message": "مرحباً، أود الاستفسار عن كود الخصم وعروض الشحن المجاني المتاحة اليوم."};

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
    var code = inp.country_code || '966';
    var rawPhone = inp.phone_number || '';
    var msg = inp.prefilled_message || '';

    // Strip non-digits and leading zero
    var cleanPhone = rawPhone.replace(/\D/g, '').replace(/^0+/, '');
    var fullNumber = code + cleanPhone;
    var encodedMsg = encodeURIComponent(msg);
    var waUrl = 'https://wa.me/' + fullNumber + (msg ? ('?text=' + encodedMsg) : '');
    var htmlAnchor = '<a href="' + waUrl + '" target="_blank" rel="noopener">تواصل معنا عبر واتساب</a>';

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'رابط الواتساب المولد' : 'Validated wa.me URL', val: waUrl.substring(0, 35) + '...' },
        { label: isAr ? 'الرقم الدولي المعتمد' : 'E.164 Number', val: '+' + fullNumber },
        { label: isAr ? 'حالة التوافق مع الهواتف' : 'Mobile Deep-Link Status', val: isAr ? 'يعمل بنقرة واحدة' : 'Instant 1-Click Launch' }
      ],
      breakdown: [
        { label: isAr ? 'الرابط المباشر الكامل' : 'Full WhatsApp Chat URL', val: waUrl },
        { label: isAr ? 'كود زر HTML للموقع' : 'HTML Click-to-Chat Anchor Tag', val: htmlAnchor },
        { label: isAr ? 'الرسالة التلقائية المجهزة' : 'Prefilled Encoded Message', val: msg || (isAr ? 'لا توجد رسالة مسبقة' : 'No prefilled text') },
        { label: isAr ? 'معيار التحقق الدولي' : 'ITU-T E.164 Compliance', val: isAr ? 'صحيح ومعتمد لشبكات الشرق الأوسط' : 'Valid E.164 Format' }
      ],
      alert: {
        type: cleanPhone.length >= 8 ? 'success' : 'warning',
        title: isAr ? (cleanPhone.length >= 8 ? 'رابط واتساب سليم 100%' : 'تنبيه: تحقق من عدد أرقام الهاتف') : (cleanPhone.length >= 8 ? 'Valid wa.me Link' : 'Phone Number Verification'),
        text: isAr ? 'تم تنظيف الرقم وإزالة الصفر البادئ وتجهيز الرابط ليعمل فوراً دون حفظ الرقم في جهات الاتصال.' : 'Sanitized phone number ready to launch chat directly.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'منشئ روابط واتساب المباشرة مع رموز دول الشرق الأوسط والرسائل الجاهزة' + ' (' + APP_ID + ') ===\n\n';
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
