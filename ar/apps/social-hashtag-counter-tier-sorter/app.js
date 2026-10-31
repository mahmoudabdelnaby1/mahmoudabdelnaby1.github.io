/**
 * APP-045: Social Media Hashtag Counter & Category Tiering Sorter
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-045';
  var outputsList = ["Total Hashtags Count vs Platform Safe Limit", "Deduplicated Clean Hashtag String Ready to Copy", "Hashtag Tiering Distribution (Broad vs Niche)", "Arabic vs English Language Ratio"];
  var defaultValues = {"raw_hashtags_text": "#الرياض #تسوق_اونلاين #عطور_فاخرة #عروض_اليوم #السعودية #متجر_الكتروني #riyadh #perfume #sale #ksa", "platform_target": "instagram", "max_allowed": 30};

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
    var raw = inp.raw_hashtags_text || '';
    var plat = inp.platform_target || 'instagram';

    var tags = raw.match(/#[^\s#]+/g) || [];
    // Deduplicate
    var uniqueTags = [];
    tags.forEach(function(t) {
      var norm = t.toLowerCase();
      if (uniqueTags.indexOf(norm) === -1) uniqueTags.push(norm);
    });

    var count = uniqueTags.length;
    var maxRecommended = plat === 'instagram' ? 5 : (plat === 'linkedin' ? 5 : 6);

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'عدد الهاشتاجات الفريدة' : 'Unique Hashtags Count', val: count.toString() },
        { label: isAr ? 'العدد الموصى به للمنصة' : 'Recommended Limit', val: maxRecommended + ' tags' },
        { label: isAr ? 'حالة التوافق مع الخوارزمية' : 'Algorithm Health', val: count <= maxRecommended ? (isAr ? 'مثالي ومركز' : 'Optimal') : (isAr ? 'كثير ومشتت' : 'Diluted') }
      ],
      breakdown: [
        { label: isAr ? 'قائمة الهاشتاجات المنظفة' : 'Clean Deduplicated Hashtags', val: uniqueTags.join(' ') },
        { label: isAr ? 'عدد الهاشتاجات المكررة المحذوفة' : 'Duplicates Removed', val: (tags.length - count).toString() },
        { label: isAr ? 'المنصة المستهدفة' : 'Target Algorithm Rules', val: plat.toUpperCase() }
      ],
      alert: {
        type: count <= maxRecommended ? 'success' : 'warning',
        title: isAr ? (count <= maxRecommended ? 'عدد وسوم مثالي يعزز وصول المنشور' : 'تنبيه: كثرة الهاشتاجات تشتت تصنيف الخوارزمية') : 'Hashtag Optimization Verdict',
        text: isAr ? 'توصي خوارزميات إنستجرام وتيك توك ولينكد إن الحديثة باستخدام 3-5 وسوم شديدة الدقة بدلاً من وضع 30 هاشتاج عشوائي.' : 'Modern algorithms favor 3-5 hyper-relevant tags over 30 generic tags.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'أداة تصنيف الهاشتاجات حسب الحجم وتوزيع النسب لمنع الحظر الخفي' + ' (' + APP_ID + ') ===\n\n';
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
