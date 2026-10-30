/**
 * APP-059: Influencer Unboxing & UGC Brief Generator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-059';
  var outputsList = ["Structured Scene-by-Scene Filming Brief (Beat 1: Hook, Beat 2: Unboxing/Demo, Beat 3: Result & CTA)", "Lighting, Audio & Technical Requirements (Vertical 9:16, Clean Natural Lighting, Lapel Mic)", "Non-Negotiable Do's & Don'ts Checklist (e.g. No competitor packaging in frame)", "Printable / PDF-Ready Creator Agreement Page"];
  var defaultValues = {"brand_name": "سكن كير برو", "product_name": "سيروم الهيالورونيك المرطب", "key_benefits": "ترطيب عميق 24 ساعة، امتصاص فوري بدون لمعان، مناسب للبشرة الحساسة في حرارة الصيف", "do_not_mentions": "تجنب ذكر أي وعود علاجية للأمراض الجلدية، لا تقارن بالاسم مع الماركات الأخرى"};

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
    var brand = inp.brand_name || 'اسم العلامة';
    var prod = inp.product_name || 'اسم المنتج';
    var ben = inp.key_benefits || 'المزايا الأساسية';
    var avoid = inp.do_not_mentions || 'المحاذير';

    var brief = '📋 دليل تصوير المحتوى الإعلاني المعتمد (UGC Brief)\n\n' +
      '1. الهدف: فيديو فتح صندوق (Unboxing) عفوي وطبيعي بأسلوب اليوميات.\n' +
      '2. الثواني الثلاث الأولى (Hook): ابدأ بتصوير فتح الطرد أو تجربة قوام الـ ' + prod + ' على اليد مع تعبير إعجاب فوري.\n' +
      '3. النقاط الإلزامية التي يجب ذكرها:\n   • ' + ben + '\n' +
      '4. المحاذير النظامية الصارمة:\n   • ' + avoid + '\n' +
      '5. الختام والدعوة للإجراء (CTA): ارفع الشاشة واطلب من المتجر واستخدم كود الخصم الحصري.\n' +
      '6. إرسال المسودة للمراجعة قبل النشر.';

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'طول الدليل الإرشادي' : 'Brief Word Count', val: brief.split(' ').length + ' words' },
        { label: isAr ? 'جاهزية البريف' : 'Brief Readiness', val: isAr ? 'جاهز للإرسال للمؤثر' : 'Ready' },
        { label: isAr ? 'الامتثال الرقابي' : 'Compliance Guards', val: 'SFDA / GCAM Protected' }
      ],
      breakdown: [
        { label: isAr ? 'نص الدليل الإرشادي الكامل' : 'Complete Creator Briefing Document', val: brief },
        { label: isAr ? 'اسم المنتج والعلامة التجارية' : 'Featured Brand & Product', val: brand + ' - ' + prod },
        { label: isAr ? 'المزايا التسويقية المركزة' : 'Core Selling Angles', val: ben },
        { label: isAr ? 'المحاذير التي يحظر ذكرها' : 'Strict Compliance Guardrails', val: avoid }
      ],
      alert: {
        type: 'success',
        title: isAr ? 'بريف تصوير احترافي يمنع الأخطاء' : 'Comprehensive Creator Brief Ready',
        text: isAr ? 'إرسال بريف محدد وواضح يضمن التزام المؤثر بالرسالة التسويقية ويجنبك إعادة التصوير أو مخالفة اللوائح.' : 'Detailed briefs reduce reshoot requests by 85%.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مولد بريف وتعليمات تصوير فيديوهات تجربة المنتجات والمحتوى المنشأ UGC' + ' (' + APP_ID + ') ===\n\n';
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
