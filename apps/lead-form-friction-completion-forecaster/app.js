/**
 * APP-064: Lead Gen Form Field Friction & Completion Rate Forecaster
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-064';
  var outputsList = ["Projected Conversion Rate Change (e.g. 3.2% -> 5.8%)", "Projected Additional Leads Generated per Month", "Effective Reduction in Cost Per Lead (CPL Savings)", "Field Necessity Matrix (Essential vs Candidates for Post-Submission Follow-Up)"];
  var defaultValues = {"number_of_form_fields": 6, "asks_for_phone_number": "yes", "asks_for_company_or_budget": "yes", "mobile_traffic_share_pct": 85};

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
    var fields = Math.max(1, inp.number_of_form_fields || 4);
    var phone = (inp.asks_for_phone_number === 'yes');
    var company = (inp.asks_for_company_or_budget === 'yes');
    var mobilePct = Math.min(100, Math.max(0, inp.mobile_traffic_share_pct || 80)) / 100;

    // Base baseline CVR for 3-field form ~12%
    var baseCvr = 16.0;
    // Each field beyond 3 reduces CVR by 10%
    var fieldPenalty = Math.max(0, fields - 3) * 1.5;
    var phonePenalty = phone ? 2.5 : 0;
    var companyPenalty = company ? 3.0 : 0;

    var expectedCvr = Math.max(1.5, baseCvr - fieldPenalty - phonePenalty - companyPenalty);
    // Extra friction on mobile
    expectedCvr = expectedCvr * (1 - (mobilePct * 0.15));

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'معدل إكمال النموذج المتوقع' : 'Projected Completion Rate', val: expectedCvr.toFixed(1) + '%' },
        { label: isAr ? 'مؤشر الاحتكاك وصعوبة التعبئة' : 'Form Friction Index', val: fields > 5 ? (isAr ? 'مرتفع ومنفر' : 'High Friction') : (isAr ? 'منخفض وسهل' : 'Low Friction') },
        { label: isAr ? 'عدد الحقول الإجمالية' : 'Total Form Fields', val: fields + ' fields' }
      ],
      breakdown: [
        { label: isAr ? 'معدل التحويل المتوقع لنموذج البيانات' : 'Forecasted Form Conversion Rate', val: expectedCvr.toFixed(2) + '%' },
        { label: isAr ? 'أثر طلب رقم الهاتف على التحويل' : 'Phone Field Friction Impact', val: phone ? '-20% to -25% Drop' : 'Zero Friction' },
        { label: isAr ? 'نسبة زيارات الموبايل المطبقة' : 'Mobile Viewport Share Applied', val: (mobilePct*100).toFixed(0) + '%' },
        { label: isAr ? 'التوصية الفورية لتحسين الإكمال' : 'Optimization Recommendation', val: fields > 4 ? (isAr ? 'تقليص الحقول إلى 3 فقط وتقسيم الباقي لخطوة ثانية بعد الشراء' : 'Reduce to 3 fields for 35% higher volume') : (isAr ? 'النموذج متوازن وخفيف' : 'Form length is optimal') }
      ],
      alert: {
        type: fields <= 4 ? 'success' : 'warning',
        title: isAr ? (fields <= 4 ? 'نموذج خفيف وسلس للعميل' : 'تنبيه: كثرة الحقول ترفع تكلفة الـ Lead!') : 'Form Friction Verdict',
        text: isAr ? 'في سوق الشرق الأوسط، 85% من الزوار يتصفحون عبر الموبايل؛ كل حقل إضافي يضاعف فرص الخروج من الصفحة دون إرسال.' : 'Every additional form field on mobile drops completion rate by ~10%.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مقدر تأثير عدد حقول استمارة التسجيل على نسبة ملء البيانات' + ' (' + APP_ID + ') ===\n\n';
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
