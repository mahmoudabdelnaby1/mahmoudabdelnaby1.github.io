/**
 * APP-005: Meta Ads Audience Overlap & Budget Cannibalization Estimator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-005';
  var outputsList = ["Estimated Shared Audience Headcount", "Auction Overlap Severity Score (Low/Medium/High)", "Projected Monthly Wasted Spend on Self-Competition", "Actionable Consolidation Recommendation"];
  var defaultValues = {"audience_a_size": 1200000, "audience_b_size": 850000, "estimated_overlap_pct": 28, "total_daily_spend": 300};

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
    var a = Math.max(0, inp.audience_a_size || 0);
    var b = Math.max(0, inp.audience_b_size || 0);
    var overlap = Math.min(100, Math.max(0, inp.estimated_overlap_pct || 0));
    var spend = Math.max(0, inp.total_daily_spend || 0);

    var sharedCount = Math.round(Math.min(a, b) * (overlap / 100));
    var wastedDaily = spend * (overlap / 100) * 0.35;
    var wastedMonthly = wastedDaily * 30;

    var isAr = (lang === 'ar');
    var severity = overlap > 25 ? (isAr ? 'مرتفع جداً (High)' : 'High') : (overlap >= 15 ? (isAr ? 'متوسط (Moderate)' : 'Moderate') : (isAr ? 'منخفض (Low)' : 'Low'));
    var alertType = overlap > 25 ? 'danger' : (overlap >= 15 ? 'warning' : 'success');

    return {
      metrics: [
        { label: isAr ? 'الهدر الشهري المتوقع' : 'Projected Monthly Wasted Spend', val: '$' + wastedMonthly.toFixed(2) },
        { label: isAr ? 'درجة التنافس الداخلي' : 'Auction Overlap Severity', val: severity },
        { label: isAr ? 'الجمهور المتطابق المشترك' : 'Shared Audience Headcount', val: sharedCount.toLocaleString() }
      ],
      breakdown: [
        { label: isAr ? 'حجم الجمهور المشترك بين المجموعتين' : 'Estimated Shared Audience Headcount', val: sharedCount.toLocaleString() + ' ' + (isAr?'مستخدم':'users') },
        { label: isAr ? 'درجة خطورة التداخل' : 'Auction Overlap Severity Score', val: severity },
        { label: isAr ? 'الميزانية المهدرة يومياً على التنافس' : 'Daily Wasted Spend on Self-Competition', val: '$' + wastedDaily.toFixed(2) },
        { label: isAr ? 'الهدر الشهري المتوقع' : 'Projected Monthly Wasted Spend', val: '$' + wastedMonthly.toFixed(2) },
        { label: isAr ? 'التوصية الفورية' : 'Actionable Consolidation Recommendation', val: (overlap > 25 ? (isAr ? 'دمج المجموعتين الإعلانيتين فوراً في حملة Advantage+ واحدة' : 'Consolidate into single Advantage+ ad set') : (isAr ? 'الإبقاء مع مراقبة التكرار Frequency' : 'Keep separated and monitor frequency')) }
      ],
      alert: {
        type: alertType,
        title: isAr ? ('مستوى التداخل: ' + severity) : ('Overlap Severity: ' + severity),
        text: isAr ? (overlap > 25 ? 'تداخل خطير يرفع الـ CPM ويؤدي لمزايدة حسابك ضد نفسه! ادمج المجموعات فوراً.' : 'التداخل ضمن الحدود المقبولة ولا يؤثر بشكل كبير على المزاد.') : (overlap > 25 ? 'Dangerous self-bidding inflating CPM! Consolidate ad sets immediately.' : 'Overlap is within acceptable operating tolerance.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مقدر تداخل الجماهير وحرق الميزانيات لحملات إعلانات ميتا في مصر والخليج' + ' (' + APP_ID + ') ===\n\n';
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
