/**
 * APP-025: Arabic Keyword Density & Diacritic Stripper for Clean Content
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-025';
  var outputsList = ["Total Word & Character Count (Raw vs Normalized)", "Top 1-Gram, 2-Gram, and 3-Gram Phrase Density Table", "Focus Keyword Occurrence Count and Density %", "Keyword Stuffing Over-Optimization Warning (>3.5%)", "Cleaned Normalized Text Output"];
  var defaultValues = {"content_text": "تعتبر القهوة المختصة من أكثر المشروبات طلباً في السعودية، حيث يحرص عشاق القهوة على تحضير القهوة باستخدام أدوات القهوة الاحترافية لضمان أفضل مذاق للقهوة.", "target_keyword": "القهوة", "ignore_common_words": "yes"};

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
    var text = inp.content_text || '';
    var kw = (inp.target_keyword || '').trim();

    // Strip Tashkeel & normalize
    function norm(s) {
      return s.replace(/[\u064B-\u065F\u0670]/g, '')
              .replace(/[إأآا]/g, 'ا')
              .replace(/ة/g, 'ه')
              .replace(/ى/g, 'ي')
              .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
              .toLowerCase();
    }

    var cleanText = norm(text);
    var cleanKw = norm(kw);

    var words = cleanText.split(/\s+/).filter(function(w) { return w.length > 0; });
    var totalWords = words.length;

    var kwOccurrences = 0;
    if (cleanKw) {
      words.forEach(function(w) {
        if (w === cleanKw || w.indexOf(cleanKw) !== -1) kwOccurrences++;
      });
    }

    var density = totalWords > 0 ? ((kwOccurrences / totalWords) * 100) : 0;
    var isAr = (lang === 'ar');

    var status = density > 3.5 ? (isAr ? 'حشو مفرط خطير (Keyword Stuffing)' : 'Over-optimized / Keyword Stuffing') : (density >= 1.0 ? (isAr ? 'مثالي ومطابق لمعايير السيو (1% - 3%)' : 'Optimal Density (1% - 3%)') : (isAr ? 'منخفض وغير كافٍ (< 1%)' : 'Under-optimized (< 1%)'));
    var alertType = density > 3.5 ? 'danger' : (density >= 1.0 ? 'success' : 'warning');

    return {
      metrics: [
        { label: isAr ? 'كثافة الكلمة المفتاحية' : 'Keyword Density %', val: density.toFixed(2) + '%' },
        { label: isAr ? 'عدد مرات التكرار' : 'Keyword Occurrences', val: kwOccurrences + ' ' + (isAr?'مرات':'times') },
        { label: isAr ? 'إجمالي عدد الكلمات' : 'Total Word Count', val: totalWords + ' ' + (isAr?'كلمة':'words') }
      ],
      breakdown: [
        { label: isAr ? 'الكلمة المفتاحية المستهدفة' : 'Target Keyword Analyzed', val: kw || 'N/A' },
        { label: isAr ? 'عدد مرات ظهور الكلمة' : 'Exact Occurrences in Text', val: kwOccurrences.toString() },
        { label: isAr ? 'إجمالي كلمات المقال' : 'Total Word Count', val: totalWords.toString() },
        { label: isAr ? 'النسبة المئوية للكثافة' : 'Exact Keyword Density %', val: density.toFixed(2) + '%' },
        { label: isAr ? 'تقييم التوافق مع خوارزميات جوجل' : 'Google Algorithm Verdict', val: status }
      ],
      alert: {
        type: alertType,
        title: isAr ? ('تقييم الكثافة: ' + status) : ('Keyword Density: ' + status),
        text: isAr ? (density > 3.5 ? 'تكرار الكلمة مرتفع جداً وقد يعرض الصفحة لعقوبة الحشو المفرط (Stuffing). قلل التكرار واستخدم مرادفات.' : 'توزيع الكلمة المفتاحية سليم وطبيعي ويعزز صلة الصفحة بمحركات البحث.') : (density > 3.5 ? 'High density risk trigger. Reduce keyword occurrences and use synonyms.' : 'Natural keyword distribution aligned with modern SEO.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'محلل كثافة الكلمات المفتاحية باللغة العربية مع معالج إزالة التشكيل والهمزات' + ' (' + APP_ID + ') ===\n\n';
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
