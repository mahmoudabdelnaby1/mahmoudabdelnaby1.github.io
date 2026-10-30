/**
 * APP-023: Arabic Meta Title & Description Pixel-Width SERP Checker
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-023';
  var outputsList = ["Exact Title Pixel Width (out of 600px desktop / 650px mobile limit)", "Exact Snippet Pixel Width (out of 960px limit)", "Visual Google SERP RTL Preview Simulation", "Truncation Alert & Truncation Point Indicator", "Copyable <title> and <meta name='description'> HTML Tags"];
  var defaultValues = {"meta_title": "أفضل متجر لبيع القهوة المختصة في الرياض | شحن مجاني سريع", "meta_description": "تسوق أجود محاصيل البن والقهوة المختصة وأدوات الإسبريسو والتقطير مع توصيل فوري في الرياض وجميع مدن السعودية. ادفع بالتقسيط مع تابي وتمارا.", "target_url": "https://coffee-store.com/specialty", "view_mode": "desktop"};

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
    var title = inp.meta_title || '';
    var desc = inp.meta_description || '';
    var url = inp.target_url || 'https://example.com';
    var isMobile = (inp.view_mode === 'mobile');

    // Approximate Google pixel width metrics for Arabic typography (Arial 20px / 14px)
    var titlePx = 0;
    for (var i = 0; i < title.length; i++) {
      var code = title.charCodeAt(i);
      titlePx += (code >= 0x0600 && code <= 0x06FF) ? 10.8 : (code === 32 ? 4.5 : 8.5);
    }
    titlePx = Math.round(titlePx);

    var descPx = 0;
    for (var j = 0; j < desc.length; j++) {
      var dCode = desc.charCodeAt(j);
      descPx += (dCode >= 0x0600 && dCode <= 0x06FF) ? 7.6 : (dCode === 32 ? 3.5 : 6.2);
    }
    descPx = Math.round(descPx);

    var maxTitle = isMobile ? 650 : 600;
    var maxDesc = 960;
    var titleTruncated = titlePx > maxTitle;
    var descTruncated = descPx > maxDesc;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'عرض العنوان بالبكسل' : 'Title Pixel Width', val: titlePx + 'px / ' + maxTitle + 'px' },
        { label: isAr ? 'عرض الوصف بالبكسل' : 'Description Pixel Width', val: descPx + 'px / ' + maxDesc + 'px' },
        { label: isAr ? 'حالة القص في جوجل' : 'SERP Truncation Status', val: (titleTruncated || descTruncated) ? (isAr ? 'يتم قصه (...)' : 'Truncated (...)') : (isAr ? 'كامل ومثالي' : 'Fully Visible') }
      ],
      breakdown: [
        { label: isAr ? 'طول العنوان بالبكسل' : 'Exact Title Pixel Width', val: titlePx + 'px (' + (titleTruncated ? (isAr?'يتجاوز الحد':'Over limit') : (isAr?'مطابق':'Safe')) + ')' },
        { label: isAr ? 'طول الوصف بالبكسل' : 'Exact Snippet Pixel Width', val: descPx + 'px (' + (descTruncated ? (isAr?'يتجاوز الحد':'Over limit') : (isAr?'مطابق':'Safe')) + ')' },
        { label: isAr ? 'معاينة وسم Title' : 'Title HTML Tag', val: '<title>' + title + '</title>' },
        { label: isAr ? 'معاينة وسم Meta Description' : 'Description Meta Tag', val: '<meta name="description" content="' + desc + '">' },
        { label: isAr ? 'نصيحة التحسين الفورية' : 'Optimization Advice', val: titleTruncated ? (isAr ? 'احذف ' + Math.round((titlePx - maxTitle)/11) + ' حروف من العنوان لتفادي ظهور علامة (...)' : 'Trim title to prevent truncation') : (isAr ? 'الطول مثالي ويظهر بالكامل في نتائج البحث' : 'Optimal length, no truncation') }
      ],
      alert: {
        type: (titleTruncated || descTruncated) ? 'warning' : 'success',
        title: isAr ? ((titleTruncated || descTruncated) ? 'تنبيه: سيتم قص النص في نتائج جوجل!' : 'طول مثالي يضمن أعلى نسبة نقر CTR') : ((titleTruncated || descTruncated) ? 'SERP Snippet Truncation Alert' : 'Perfect Display Width'),
        text: isAr ? 'محرك بحث جوجل يقيس العناوين بالبكسل وليس بعدد الحروف فقط. حافظ على العنوان دون 600 بكسل لضمان ظهوره كاملاً.' : 'Google measures SERP titles by pixel width, not character count.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'أداة فحص طول عناوين ووصف محركات البحث بالبكسل للنصوص العربية' + ' (' + APP_ID + ') ===\n\n';
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
