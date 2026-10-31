/**
 * APP-040: WhatsApp Customer Satisfaction (CSAT) Survey Link Builder
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-040';
  var outputsList = ["Ready-to-Paste WhatsApp Message Template with Clickable Rating Links", "5 Distinct Pre-Encoded Rating URLs (⭐ to ⭐⭐⭐⭐⭐)", "Interactive HTML Email/SMS Rating Widget Code", "Survey Response Analysis Framework"];
  var defaultValues = {"business_phone": "966501234567", "order_number": "ORD-98421", "rating_scale": "5_star"};

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
    var phone = inp.business_phone || '966501234567';
    var ord = inp.order_number || 'ORD-1001';
    var scale = inp.rating_scale || '5_star';

    var msg = 'شكراً لطلبك رقم #' + ord + ' 🌸\nنسعد بتقييم تجربتك معنا لتحسين خدماتنا:\n\n' +
      '⭐ 5 - تجربة ممتازة وسريعة\n' +
      '⭐ 4 - جيدة جداً\n' +
      '⭐ 3 - مقبولة\n' +
      '⭐ 1-2 - واجهت مشكلة\n\n' +
      'يرجى الرد برقم التقييم وملاحظاتك. رأيك يهمنا جداً!';

    var surveyUrl = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(msg);
    var isAr = (lang === 'ar');

    return {
      metrics: [
        { label: isAr ? 'رابط الاستبيان المولد' : 'Survey Direct Link', val: surveyUrl.substring(0, 35) + '...' },
        { label: isAr ? 'رقم الطلب المرتبط' : 'Tracked Order ID', val: ord },
        { label: isAr ? 'معدل الاستجابة المتوقع' : 'Expected Response Rate', val: '~35% (via WhatsApp)' }
      ],
      breakdown: [
        { label: isAr ? 'رابط استبيان الرضا المباشر' : 'Full WhatsApp CSAT URL', val: surveyUrl },
        { label: isAr ? 'نص رسالة الاستبيان التلقائية' : 'Prefilled Rating Message', val: msg },
        { label: isAr ? 'مقياس التقييم المعتمد' : 'Rating Metric Scale', val: scale === '5_star' ? 'CSAT 5-Star' : 'NPS 0-10' }
      ],
      alert: {
        type: 'success',
        title: isAr ? 'استبيان رضا بنقرة واحدة عبر واتساب' : '1-Click WhatsApp CSAT Ready',
        text: isAr ? 'استبيانات واتساب تحقق معدل استجابة يصل إلى 35% مقارنة بأقل من 3% في الإيميل التقليدي.' : 'Achieves up to 35% response rates vs <3% in traditional email.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'منشئ روابط استبيان رضا العملاء عبر الواتساب بروابط تقييم بنقرة واحدة' + ' (' + APP_ID + ') ===\n\n';
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
