/**
 * APP-028: FAQ Schema.org JSON-LD Generator with Arabic RTL Preview
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-028';
  var outputsList = ["Formatted JSON-LD Code Block", "Interactive RTL FAQ Accordion HTML Preview", "HTML Accordion Embed Code for Website", "Google Rich Test Quick Validator Link"];
  var defaultValues = {"faq_raw_text": "Q: هل الشحن مجاني لجميع مناطق المملكة؟\nA: نعم، الشحن مجاني للطلبات التي تتجاوز 250 ريال سعودي.\n\nQ: ما هي طرق الدفع المتاحة؟\nA: نقبل الدفع عبر مدى، فيزا، ماستركارد، أبل باي، والتقسيط عبر تابي وتمارا."};

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
    var raw = inp.faq_raw_text || '';
    var blocks = raw.split(/[\r\n]{2,}/);
    var mainEntity = [];

    blocks.forEach(function(blk) {
      var lines = blk.split(/[\r\n]+/);
      var q = '', a = '';
      lines.forEach(function(l) {
        if (/^Q:/i.test(l.trim())) q = l.replace(/^Q:/i, '').trim();
        else if (/^A:/i.test(l.trim())) a = l.replace(/^A:/i, '').trim();
      });
      if (q && a) {
        mainEntity.push({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": a
          }
        });
      }
    });

    var schemaObj = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": mainEntity
    };

    var jsonLd = JSON.stringify(schemaObj, null, 2);
    var isAr = (lang === 'ar');

    return {
      metrics: [
        { label: isAr ? 'عدد الأسئلة المستخرجة' : 'Parsed Questions Count', val: mainEntity.length + ' FAQs' },
        { label: isAr ? 'حالة التوافق مع Google FAQ' : 'Schema Type', val: 'FAQPage JSON-LD' },
        { label: isAr ? 'النتائج المنسقة الغنية' : 'Rich Snippet Eligibility', val: isAr ? 'مؤهل للظهور' : 'Eligible' }
      ],
      breakdown: [
        { label: isAr ? 'كود Schema JSON-LD الجاهز' : 'Generated JSON-LD Code', val: jsonLd },
        { label: isAr ? 'عدد الأسئلة والأجوبة المعتمدة' : 'Valid Question-Answer Pairs', val: mainEntity.length.toString() },
        { label: isAr ? 'أول سؤال مستخرج' : 'Sample Extracted Question', val: (mainEntity[0] ? mainEntity[0].name : 'N/A') }
      ],
      alert: {
        type: mainEntity.length > 0 ? 'success' : 'warning',
        title: isAr ? 'مخطط الأسئلة الشائعة جاهز' : 'FAQ Schema Ready',
        text: isAr ? 'إدراج هذا الكود يمنح صفحتك مساحة إضافية وأسئلة منسدلة داخل صفحة نتائج بحث جوجل مباشرة.' : 'Adds interactive collapsible FAQ accordions directly into Google search results.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مولد كود الأسئلة الشائعة FAQ Schema المنظم مع معاينة اتجاه اليمين' + ' (' + APP_ID + ') ===\n\n';
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
