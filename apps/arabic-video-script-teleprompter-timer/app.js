/**
 * APP-046: Arabic Video Script Teleprompter & WPM Duration Calculator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-046';
  var outputsList = ["Exact Estimated Spoken Duration (Minutes : Seconds)", "Total Word and Syllable Count", "Duration Over-Budget Alert", "Interactive Browser-Based Teleprompter View with Adjustable Speed", "Script Trimming Suggestion (Cut X words to hit target seconds)"];
  var defaultValues = {"video_script_text": "إذا كنت تعاني من ارتفاع تكلفة إعلانات متجرك الإلكتروني، فهذا الفيديو لك! المشكلة ليست في الميزانية، المشكلة في خطاف الفيديو وصفحة الهبوط. في 3 خطوات بسيطة:\\nأولاً: ابدأ الفيديو بسؤال صادم أو نتيجة حقيقية بالأرقام.\\nثانياً: وضح حل المشكلة في أول 10 ثوانٍ.\\nثالثاً: ضع دعوة واضحة لشراء العرض مع كود خصم حصري.\\nجرب هذه الطريقة وشاركنا النتائج!", "speaking_pace_wpm": 130, "target_duration_seconds": 30};

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
    var script = inp.video_script_text || '';
    var wpm = Math.max(50, inp.speaking_pace_wpm || 130);
    var targetSec = Math.max(5, inp.target_duration_seconds || 30);

    var words = script.trim().split(/\s+/).filter(function(w){ return w.length > 0; });
    var wordCount = words.length;

    var durationSec = Math.round((wordCount / wpm) * 60);
    var diff = durationSec - targetSec;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'زمن إلقاء الاسكريبت المتوقع' : 'Estimated Script Duration', val: durationSec + ' ' + (isAr?'ثانية':'sec') },
        { label: isAr ? 'مدة الفيديو المستهدفة' : 'Target Target Length', val: targetSec + ' ' + (isAr?'ثانية':'sec') },
        { label: isAr ? 'إجمالي عدد كلمات الاسكريبت' : 'Total Script Words', val: wordCount + ' words' }
      ],
      breakdown: [
        { label: isAr ? 'المدة التقديرية للإلقاء الطبيعي' : 'Projected Speaking Time', val: durationSec + ' ' + (isAr?'ثانية':'seconds') },
        { label: isAr ? 'الفارق عن المدة المحددة' : 'Variance from Target', val: (diff === 0 ? (isAr ? 'مطابق تماماً' : 'Exact match') : ((diff > 0 ? '+' : '') + diff + ' ' + (isAr?'ثانية':'sec'))) },
        { label: isAr ? 'سرعة الإلقاء المعتمدة' : 'Speaking Pace Applied', val: wpm + ' WPM (Words per minute)' },
        { label: isAr ? 'توصية التعديل' : 'Editing Recommendation', val: diff > 3 ? (isAr ? 'احذف حوالي ' + Math.round((diff/60)*wpm) + ' كلمة ليناسب الـ ' + targetSec + ' ثانية' : 'Trim words to fit target') : (isAr ? 'الاسكريبت جاهز ومثالي للتصوير' : 'Script fits duration perfectly') }
      ],
      alert: {
        type: Math.abs(diff) <= 3 ? 'success' : (diff > 3 ? 'warning' : 'info'),
        title: isAr ? (Math.abs(diff) <= 3 ? 'توقيت مثالي لإعلانات ريلز وتيك توك' : 'تنبيه تجاوز مدة الفيديو') : 'Pacing & Duration Verdict',
        text: isAr ? 'الفيديوهات القصيرة (أقل من 30 ثانية) تحقق أعلى نسبة إكمال واحتفاظ بالمشاهدين (Retention Rate).' : 'Videos under 30s maximize algorithmic completion rate on Reels & TikTok.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة مدة ومعدل قراءة سكريبت الفيديو الإعلاني باللغة العربية WPM' + ' (' + APP_ID + ') ===\n\n';
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
