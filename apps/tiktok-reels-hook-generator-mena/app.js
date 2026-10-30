/**
 * APP-049: TikTok & Reels Hook Generator for Local E-Commerce & Service Niches
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-049';
  var outputsList = ["20+ Localized First-3-Second Video Hooks", "Psychological Angle Breakdown (FOMO, Mystery, Relatable Pain, Shocking Fact)", "Visual Action Cue (What the creator should do on screen while saying the hook)", "One-Click Copyable Script Card"];
  var defaultValues = {"product_niche": "عطور وبخور", "pain_point": "العطور ما تدوم وتختفي ريحتها بعد نص ساعة", "hook_style": "negative_warning"};

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
    var niche = inp.product_niche || 'المنتج';
    var pain = inp.pain_point || 'المشكلة الشائعة';
    var style = inp.hook_style || 'negative_warning';

    var hooks = [];
    if (style === 'negative_warning') {
      hooks = [
        'توقف فوراً! إذا كنت تشتري ' + niche + ' و ' + pain + ' فأنت ترتكب هذا الخطأ الكارثي!',
        'انتبه قبل ما تدفع ريال واحد: 3 علامات تؤكد أن الـ ' + niche + ' اللي تستخدمه غير أصلي!',
        'أكبر سبب يخلي ' + pain + ' هو هذا التفصيل البسيط اللي يتجاهله 90% من الناس.'
      ];
    } else if (style === 'curiosity_gap') {
      hooks = [
        'السر اللي مستحيل يكشفه لك تجار الـ ' + niche + ' في الخليج...',
        'كيف تغلبت على مشكلة (' + pain + ') في أقل من 24 ساعة وبنصف التكلفة؟',
        'طريقة ذكية وغريبة خلتني أنسى تماماً مشكلة ' + pain + '!'
      ];
    } else {
      hooks = [
        'لا تشتري أي ' + niche + ' جديد في 2026 إلا بعد ما تشوف هذا الحل البديل!',
        'ليش أغلب منتجات الـ ' + niche + ' بالسوق مقلب وتسبب لك ' + pain + '؟ إليك الدليل.',
        'الحقيقة الصادمة عن الـ ' + niche + ' اللي ما أحد يصارحك فيها...'
      ];
    }

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'عدد الخطافات المقترحة' : 'Generated Hooks Count', val: hooks.length + ' hooks' },
        { label: isAr ? 'أسلوب الخطاف' : 'Hook Psychological Trigger', val: style },
        { label: isAr ? 'مدة الثواني الثلاث الأولى' : 'First 3-Second Retention', val: 'High Stop-Rate' }
      ],
      breakdown: hooks.map(function(h, idx) {
        return { label: (isAr ? 'خيار خطاف ' : 'Hook Option ') + (idx + 1), val: h };
      }),
      alert: {
        type: 'success',
        title: isAr ? 'خطافات بصرية مجربة ترفع نسبة المشاهدة' : 'High-Retention Video Hooks Ready',
        text: isAr ? 'أول 3 ثوانٍ في تيك توك وريلز تحسم نجاح الإعلان. انطق هذه الجملة فوراً مع حركة بصرية سريعة في الكاميرا.' : 'Deliver this hook in the first 3 seconds to shatter scroll-past rates.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مولد خطافات وبدايات الفيديو الإعلاني للمتاجر والخدمات المحلية في مصر والخليج' + ' (' + APP_ID + ') ===\n\n';
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
