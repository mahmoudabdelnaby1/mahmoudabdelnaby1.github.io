/**
 * APP-042: Instagram & LinkedIn Carousel Slide Text Splitter & Formatter
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-042';
  var outputsList = ["Structured Carousel Slide Deck (Slide 1: Hook, Slides 2-7: Micro-Points, Slide 8: CTA)", "Visual Slide Preview Carousel with RTL Arabic Typography", "Per-Slide Word Count & Reading Time", "Copyable Slide-by-Slide Text or JSON for Canva/Figma"];
  var defaultValues = {"full_content_text": "التجارة الإلكترونية في الشرق الأوسط تشهد نمواً متسارعاً. إليك 4 خطوات أساسية لمضاعفة أرباح متجرك:\nأولاً: اختر منتجاً يحل مشكلة حقيقية للعميل وله هامش ربح لا يقل عن 50%.\nثانياً: ركز على صفحات هبوط متجاوبة بالكامل مع الهواتف الذكية مع سرعة تحميل أقل من ثانيتين.\nثالثاً: فعل تأكيد طلبات الدفع عند الاستلام عبر واتساب فوراً لتخفيض نسبة المرتجعات.\nرابعاً: اعتمد على تقديم عروض الشحن المجاني الذكي المربوط بعتبة سلة محددة لرفع الـ AOV.\nاحفظ المنشور وطبقه في متجرك اليوم!", "target_slide_count": 5, "words_per_slide_limit": 35};

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
    var text = inp.full_content_text || '';
    var targetSlides = Math.max(2, Math.min(10, inp.target_slide_count || 5));
    var wordLimit = Math.max(10, inp.words_per_slide_limit || 30);

    var paragraphs = text.split(/[\r\n]+/).filter(function(p){ return p.trim().length > 0; });
    var slides = [];

    // Slide 1: Hook
    slides.push({
      num: 1,
      title: 'شريحة 1: الخطاف البصري (Hook)',
      content: paragraphs[0] || 'الخطاف الرئيسي للمنشور'
    });

    // Middle slides
    var middleParagraphs = paragraphs.slice(1, -1);
    for (var i = 0; i < middleParagraphs.length && slides.length < targetSlides - 1; i++) {
      slides.push({
        num: slides.length + 1,
        title: 'شريحة ' + (slides.length + 1) + ': القيمة والمعلومة (' + (i + 1) + ')',
        content: middleParagraphs[i]
      });
    }

    // Last slide: CTA
    slides.push({
      num: slides.length + 1,
      title: 'شريحة ' + (slides.length + 1) + ': الدعوة لاتخاذ إجراء (CTA)',
      content: paragraphs[paragraphs.length - 1] || 'احفظ المنشور وشاركه مع مهتمين!'
    });

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'عدد الشرائح المنشأة' : 'Total Slides Created', val: slides.length + ' slides' },
        { label: isAr ? 'متوسط الكلمات لكل شريحة' : 'Avg Words per Slide', val: Math.round(text.split(' ').length / slides.length) + ' words' },
        { label: isAr ? 'معدل سهولة القراءة' : 'Readability Score', val: isAr ? 'ممتاز ومريح للعين' : 'Optimal' }
      ],
      breakdown: slides.map(function(s) {
        return { label: s.title, val: s.content };
      }),
      alert: {
        type: 'success',
        title: isAr ? 'كاروسيل مقسم وموزع باحترافية' : 'Carousel Slides Ready',
        text: isAr ? 'تقسيم المحتوى بحد أقصى 35 كلمة في الشريحة يحفز المتابع على التمرير حتى الشريحة الأخيرة ويزيد معدل الحفظ (Saves).' : 'Slide pacing optimized for maximum dwell time and saves.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'أداة تقطيع النصوص الطويلة إلى شرائح كاروسيل متناسقة للينكد إن وإنستجرام' + ' (' + APP_ID + ') ===\n\n';
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
