/**
 * APP-061: MENA Landing Page RTL Visual Hierarchy & Trust Badge Auditor
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-061';
  var outputsList = ["MENA Conversion Readiness Score (0 - 100)", "Critical Trust Gaps Identified", "High-Impact Fix Recommendations for Egypt/GCC Shoppers", "Downloadable Arabic CRO Best Practice Checklist"];
  var defaultValues = {"page_url": "https://brand-store.sa", "has_cr_or_maroof_badge": "yes", "has_whatsapp_floating_button": "yes", "displays_local_payment_logos": "yes", "transparent_return_policy": "yes"};

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
    var cr = (inp.has_cr_or_maroof_badge === 'yes') ? 30 : 0;
    var wa = (inp.has_whatsapp_floating_button === 'yes') ? 25 : 0;
    var pay = (inp.displays_local_payment_logos === 'yes') ? 25 : 0;
    var ret = (inp.transparent_return_policy === 'yes') ? 20 : 0;

    var score = cr + wa + pay + ret;
    var isAr = (lang === 'ar');
    var status = score >= 80 ? (isAr ? 'صفحة هبوط فائقة الثقة (تحويل عالي)' : 'High Trust & Conversion Ready') : (score >= 50 ? (isAr ? 'ثقة متوسطة تحتاج تحسين' : 'Moderate Trust') : (isAr ? 'عوامل شك ونفور مرتفعة' : 'High Friction / Suspicion'));
    var alertType = score >= 80 ? 'success' : (score >= 50 ? 'warning' : 'danger');

    return {
      metrics: [
        { label: isAr ? 'مؤشر الثقة الإقليمي (0-100)' : 'MENA Trust Score', val: score + ' / 100' },
        { label: isAr ? 'جاهزية التحويل (CVR)' : 'Conversion Readiness', val: status },
        { label: isAr ? 'نسبة الارتداد المتوقعة' : 'Estimated Bounce Impact', val: score >= 80 ? 'Low (-35%)' : 'High (+50%)' }
      ],
      breakdown: [
        { label: isAr ? 'السجل التجاري والتوثيق الرسمي (30 نقطة)' : 'Official Business Registration', val: cr + ' / 30' },
        { label: isAr ? 'دعم واتساب المباشر (25 نقطة)' : 'Live WhatsApp Float Support', val: wa + ' / 25' },
        { label: isAr ? 'طرق الدفع المحلية ومدى وأبل باي (25 نقطة)' : 'Local Payment Trust Badges', val: pay + ' / 25' },
        { label: isAr ? 'سياسة الاستبدال والاسترجاع الشفافة (20 نقطة)' : 'Clear Return Guarantee Policy', val: ret + ' / 20' }
      ],
      alert: {
        type: alertType,
        title: isAr ? ('تقييم مصداقية صفحة الهبوط: ' + score + '/100') : ('Landing Page Trust Score: ' + score + '/100'),
        text: isAr ? (score >= 80 ? 'الصفحة تحتوي على جميع إشارات الأمان الأساسية التي يبحث عنها المشتري الخليجي والمصري قبل الدفع.' : 'فقدان التوثيق أو شعارات مدى والدفع عند الاستلام يرفع نسبة التردد والانسحاب من السلة بنسبة كبيرة.') : (score >= 80 ? 'Page features essential trust signals for MENA shoppers.' : 'Missing payment or registration badges hurts conversion.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مدقق الهيكلية البصرية وشارات الثقة لصفحات الهبوط الموجهة للشرق الأوسط' + ' (' + APP_ID + ') ===\n\n';
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
