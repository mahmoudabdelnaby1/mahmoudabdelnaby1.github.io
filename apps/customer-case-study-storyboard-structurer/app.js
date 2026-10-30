/**
 * APP-090: Customer Testimonial & Case Study Storyboard Structurer
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-090';
  var outputsList = ["Executive Case Study One-Pager (Bilingual Arabic/English)", "Prominent Metric Callout Cards (+X% Uplift, $ Saved, Time Cut)", "LinkedIn Carousel Storyboard Ready to Post", "Copyable Client Quote Pull-Out Snippet"];
  var defaultValues = {"client_name_or_industry": "متجر أزياء فاخرة في الرياض", "starting_challenge": "ارتفاع تكلفة الـ CAC بنسبة 60% وانخفاض نسبة استلام طلبات الدفع عند الاستلام RTO إلى 65%", "solution_implemented": "تفعيل مسار تأكيد تلقائي عبر واتساب وإعادة هيكلة الإعلانات لتطبيق عروض الشحن المجاني الذكي", "quantified_metrics_achieved": "رفع نسبة الاستلام إلى 88% وخفض تكلفة الشحن المرتجع بنسبة 45% ومضاعفة الـ ROAS إلى 4.2x"};

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
    var client = inp.client_name_or_industry || 'العميل';
    var chal = inp.starting_challenge || 'التحدي الأولي';
    var sol = inp.solution_implemented || 'الحل المنفذ';
    var res = inp.quantified_metrics_achieved || 'النتائج المحققة';

    var storyboard = [
      { step: '1. التحدي والوضع السابق (Situation & Obstacle)', content: 'كان ' + client + ' يواجه: ' + chal },
      { step: '2. الحل والتنفيذ العملي (Strategy & Action)', content: 'تم تطبيق استراتيجية متكاملة شملت: ' + sol },
      { step: '3. النتائج الملموسة بالأرقام (Quantified Results)', content: 'خلال 60 يوماً تحققت قفزة استثنائية: ' + res },
      { step: '4. الدرس المستفاد والدعوة للإجراء (Takeaway & CTA)', content: 'إذا كان متجرك يواجه نفس التحدي، احجز جلسة تدقيق مجانية لحسابك الآن.' }
    ];

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'هيكل قصة النجاح' : 'Case Study Structure', val: '4-Step Enterprise Framework' },
        { label: isAr ? 'النتائج الملموسة' : 'Proof Points', val: 'Quantified Data Metrics' },
        { label: isAr ? 'جاهزية العرض البيعي' : 'Sales Pitch Deck Ready', val: '100% Formatted' }
      ],
      breakdown: storyboard.map(function(s) {
        return { label: s.step, val: s.content };
      }),
      alert: {
        type: 'success',
        title: isAr ? 'دراسة حالة مقنعة جاهزة لصفقات B2B' : 'B2B Case Study Storyboard Ready',
        text: isAr ? 'دراسات الحالة المدعومة بالأرقام الحقيقية تعتبر أداة الإقناع الأقوى على الإطلاق لمدراء المبيعات لإغلاق الصفقات الكبرى.' : 'Quantified proof points drive enterprise B2B sales cycles to rapid closing.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'منظم قصص نجاح العملاء ودراسات الحالة التسويقية لإقناع العملاء المحتملين' + ' (' + APP_ID + ') ===\n\n';
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
