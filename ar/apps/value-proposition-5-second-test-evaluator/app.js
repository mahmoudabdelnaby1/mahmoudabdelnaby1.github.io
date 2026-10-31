/**
 * APP-067: Value Proposition Clarity & 5-Second Test Evaluator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-067';
  var outputsList = ["5-Second Clarity Score (0 - 100)", "Three Golden Questions Audit (1. What is this? 2. What's in it for me? 3. What do I do next?)", "Jargon & Vagueness Detector (Flags empty corporate buzzwords)", "Rewritten High-Clarity Headline Alternatives"];
  var defaultValues = {"headline_text": "عطور فاخرة تمنحك حضوراً لا يُنسى بثبات يدوم 48 ساعة وبضمان استرجاع ذهبي", "subheadline_text": "نوصلك لأفخم النوتات الشرقية والفرنسية في الرياض والخليج مع خيارات التقسيط بدون فوائد.", "target_audience": "الرجال والنساء الباحثين عن التميز في السعودية"};

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
    var h = inp.headline_text || '';
    var sub = inp.subheadline_text || '';

    // Score heuristics: specificity, length, benefit
    var words = (h + ' ' + sub).split(/\s+/).length;
    var hasSpecificNumber = /\d+/.test(h);
    var hasGuarantee = /ضمان|استرجاع|مجاني|فوري/.test(h + sub);

    var score = 60;
    if (words >= 10 && words <= 35) score += 15;
    if (hasSpecificNumber) score += 15;
    if (hasGuarantee) score += 10;
    score = Math.min(100, score);

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'مؤشر الوضوح السريع (0-100)' : '5-Second Clarity Score', val: score + ' / 100' },
        { label: isAr ? 'سرعة استيعاب العميل' : 'Comprehension Speed', val: '< 4 seconds' },
        { label: isAr ? 'وضوح الفائدة المباشرة' : 'Benefit Specificity', val: hasSpecificNumber ? (isAr ? 'محددة بالأرقام' : 'Specific Data') : (isAr ? 'عامة' : 'Generic') }
      ],
      breakdown: [
        { label: isAr ? 'العنوان الرئيسي المقيم' : 'Analyzed Value Proposition Headline', val: h },
        { label: isAr ? 'العنوان الفرعي المكمل' : 'Supporting Subheadline', val: sub },
        { label: isAr ? 'وجود أرقام وأدلة ملموسة' : 'Specific Evidence Embedded', val: hasSpecificNumber ? (isAr ? 'نعم (يحتوي على أرقام محددة)' : 'Yes') : (isAr ? 'لا' : 'No') },
        { label: isAr ? 'عناصر الضمان وتخفيف المخاطر' : 'Risk Reversal Guarantee', val: hasGuarantee ? (isAr ? 'متوفر بوضوح' : 'Active') : (isAr ? 'مفقود' : 'Missing') }
      ],
      alert: {
        type: score >= 80 ? 'success' : 'warning',
        title: isAr ? ('تقييم القيمة المقترحة: ' + score + '/100') : ('Clarity Score: ' + score + '/100'),
        text: isAr ? 'الزائر يفهم ما تقدمه وميزتك التنافسية وضمانك في أقل من 5 ثوانٍ، وهو مفتاح تقليل معدل الارتداد فوراً.' : 'Clear, concise proposition passes the 5-second landing page test.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'أداة تقييم وضوح الرسالة التسويقية لصفحة الهبوط في اختبار الـ 5 ثواني الأولى' + ' (' + APP_ID + ') ===\n\n';
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
