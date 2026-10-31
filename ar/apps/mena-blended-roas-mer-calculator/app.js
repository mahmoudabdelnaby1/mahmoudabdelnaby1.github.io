/**
 * APP-004: MENA Blended ROAS & Marketing Efficiency Ratio (MER) Calculator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-004';
  var outputsList = ["Total Blended Ad Spend", "Store-Wide MER (Marketing Efficiency Ratio %)", "Blended ROAS (e.g. 4.2x)", "Platform Attribution Inflation Warning Index", "Health Classification (Profitable / Danger Zone / Loss Making)"];
  var defaultValues = {"total_collected_revenue": 150000, "meta_spend": 20000, "tiktok_spend": 12000, "snapchat_spend": 8000, "google_spend": 5000};

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
    var rev = Math.max(0, inp.total_collected_revenue || 0);
    var meta = Math.max(0, inp.meta_spend || 0);
    var tt = Math.max(0, inp.tiktok_spend || 0);
    var snap = Math.max(0, inp.snapchat_spend || 0);
    var goog = Math.max(0, inp.google_spend || 0);

    var totalSpend = meta + tt + snap + goog;
    var mer = rev > 0 ? ((totalSpend / rev) * 100) : 0;
    var roas = totalSpend > 0 ? (rev / totalSpend) : 0;

    var isAr = (lang === 'ar');
    var status = 'healthy';
    var statusText = isAr ? 'كفاءة ربحية ممتازة (MER أقل من 25%)' : 'Healthy & Highly Profitable (MER < 25%)';
    var alertType = 'success';

    if (mer >= 35) {
      status = 'critical';
      statusText = isAr ? 'منطقة الخطر واستنزاف الأرباح (MER أعلى من 35%)' : 'Danger Zone / Heavy Margin Drain (MER > 35%)';
      alertType = 'danger';
    } else if (mer > 25) {
      status = 'caution';
      statusText = isAr ? 'منطقة حذرة تتطلب مراجعة العوائد (MER بين 25% و 35%)' : 'Caution / Margins Narrowing (MER 25%-35%)';
      alertType = 'warning';
    }

    return {
      metrics: [
        { label: isAr ? 'العائد الكلي الموحد (Blended ROAS)' : 'Blended ROAS', val: roas.toFixed(2) + 'x' },
        { label: isAr ? 'نسبة كفاءة التسويق (MER)' : 'Store-Wide MER %', val: mer.toFixed(1) + '%' },
        { label: isAr ? 'إجمالي الإنفاق الإعلاني' : 'Total Blended Ad Spend', val: totalSpend.toLocaleString() }
      ],
      breakdown: [
        { label: isAr ? 'إجمالي الإنفاق الإعلاني الشامل' : 'Total Blended Ad Spend', val: totalSpend.toLocaleString() },
        { label: isAr ? 'نسبة كفاءة التسويق (MER)' : 'Store-Wide MER (%)', val: mer.toFixed(2) + '%' },
        { label: isAr ? 'العائد الحقيقي على الإنفاق (ROAS)' : 'Blended ROAS', val: roas.toFixed(2) + 'x' },
        { label: isAr ? 'مؤشر تضخم الإسناد بالمنصات' : 'Platform Attribution Inflation Warning Index', val: (roas > 4 ? (isAr ? 'عالي (احتمال ازدواجية)' : 'High (Duplication Risk)') : (isAr ? 'طبيعي' : 'Normal')) },
        { label: isAr ? 'تصنيف الصحة المالية للحملات' : 'Health Classification', val: statusText }
      ],
      alert: {
        type: alertType,
        title: isAr ? 'تقييم كفاءة الإنفاق الإعلاني' : 'Marketing Efficiency Verdict',
        text: statusText
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة العائد الكلي على الإنفاق الإعلاني Blended ROAS ونسبة الكفاءة MER لمتاجر الشرق الأوسط' + ' (' + APP_ID + ') ===\n\n';
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
