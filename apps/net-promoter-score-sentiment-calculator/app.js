/**
 * APP-075: Net Promoter Score (NPS) & Customer Sentiment Index Calculator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-075';
  var outputsList = ["Official NPS Score (-100 to +100)", "Percentage Breakdown (Promoters %, Passives %, Detractors %)", "Industry Health Benchmark (Poor <0 / Good 0-30 / Great 30-70 / World-Class 70+)", "Detractor Rescue & Churn Prevention Playbook", "Promoter Referral Activation Strategy"];
  var defaultValues = {"promoters_count": 650, "passives_count": 220, "detractors_count": 80};

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
    var p = Math.max(0, inp.promoters_count || 0);
    var pass = Math.max(0, inp.passives_count || 0);
    var d = Math.max(0, inp.detractors_count || 0);
    var total = p + pass + d;

    var nps = total > 0 ? Math.round(((p - d) / total) * 100) : 0;
    var isAr = (lang === 'ar');

    var verdict = nps >= 50 ? (isAr ? 'عالمي وممتاز (World Class 50+)' : 'World Class (50+)') : (nps >= 30 ? (isAr ? 'جيد جداً (30-50)' : 'Great (30-50)') : (nps >= 0 ? (isAr ? 'مقبول ويحتاج تحسين' : 'Fair (0-30)') : (isAr ? 'سلبي وخطير (< 0)' : 'Critical / Danger (< 0)')));
    var alertType = nps >= 50 ? 'success' : (nps >= 30 ? 'info' : (nps >= 0 ? 'warning' : 'danger'));

    return {
      metrics: [
        { label: isAr ? 'مؤشر صافي الترويج (NPS)' : 'Net Promoter Score (NPS)', val: (nps >= 0 ? '+' : '') + nps },
        { label: isAr ? 'تصنيف الرضا والولاء' : 'Customer Loyalty Tier', val: verdict },
        { label: isAr ? 'إجمالي تقييمات العملاء' : 'Total Survey Responses', val: total.toLocaleString() }
      ],
      breakdown: [
        { label: isAr ? 'المروجون المتحمسون (9 - 10)' : 'Promoters Count (9-10)', val: p.toLocaleString() + ' (' + (total>0?((p/total)*100).toFixed(1):0) + '%)' },
        { label: isAr ? 'المحايدون غير المبالين (7 - 8)' : 'Passives Count (7-8)', val: pass.toLocaleString() + ' (' + (total>0?((pass/total)*100).toFixed(1):0) + '%)' },
        { label: isAr ? 'المنتقدون المحبطون (0 - 6)' : 'Detractors Count (0-6)', val: d.toLocaleString() + ' (' + (total>0?((d/total)*100).toFixed(1):0) + '%)' },
        { label: isAr ? 'التصنيف المعتمد عالمياً' : 'Global NPS Industry Standard', val: verdict }
      ],
      alert: {
        type: alertType,
        title: isAr ? ('نتيجة مؤشر NPS: ' + nps) : ('NPS Score: ' + nps),
        text: isAr ? (nps >= 40 ? 'درجة ممتازة تدل على رضا استثنائي يولد مبيعات عضوية بالتوصية الشفهية (Word of Mouth).' : 'نسبة المنتقدين تتطلب مراجعة فورية لتجربة التوصيل أو جودة المنتجات.') : 'High NPS drives compounding organic referral loops.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة مؤشر صافي الترويج NPS وتصنيف العملاء المروجين والمحايدين والمنتقدين' + ' (' + APP_ID + ') ===\n\n';
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
