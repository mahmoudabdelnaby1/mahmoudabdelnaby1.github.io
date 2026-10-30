/**
 * APP-097: Marketing Agency Pitch ROI & Client Budget Recommendation Deck Generator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-097';
  var outputsList = ["3-Tier Scenario Matrix (Conservative: 70% budget / Growth: 100% / Aggressive: 150%)", "Projected Impressions, Clicks, Conversions, and Revenue per Tier", "Executive Pitch Slide Summary Card (HTML/Printable)", "Client Confidence Risk-Reversal Talking Points"];
  var defaultValues = {"client_brand_name": "سعودي ستايل للملابس الفاخرة", "client_industry": "ecommerce", "target_monthly_budget": 35000, "average_order_value": 320};

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
    var b = Math.max(1000, inp.target_monthly_budget || 20000);
    var aov = Math.max(1, inp.average_order_value || 200);

    // 3 Tiers
    var conservative = b * 0.70;
    var target = b;
    var aggressive = b * 1.50;

    var expectedRoas = 3.6;
    var targetOrders = Math.round((target * expectedRoas) / aov);

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'المبيعات الشهرية المتوقعة' : 'Projected Client Revenue', val: '$' + Math.round(target * expectedRoas).toLocaleString() },
        { label: isAr ? 'العائد المستهدف على الإعلانات' : 'Target Blended ROAS', val: expectedRoas.toFixed(1) + 'x' },
        { label: isAr ? 'الطلبات الشهرية المخططة' : 'Target Order Volume', val: targetOrders.toLocaleString() + ' orders' }
      ],
      breakdown: [
        { label: isAr ? 'باقة الاختبار والتحقق (Conservative Test)' : 'Conservative Tier (70%)', val: '$' + Math.round(conservative).toLocaleString() + ' (Projected: $' + Math.round(conservative * 3.2).toLocaleString() + ')' },
        { label: isAr ? 'الباقة الموصى بها للنمو (Target Growth)' : 'Recommended Tier (100%)', val: '$' + Math.round(target).toLocaleString() + ' (Projected: $' + Math.round(target * expectedRoas).toLocaleString() + ')' },
        { label: isAr ? 'باقة السيطرة والتوسع السريع (Aggressive Scale)' : 'Aggressive Scale Tier (150%)', val: '$' + Math.round(aggressive).toLocaleString() + ' (Projected: $' + Math.round(aggressive * 4.0).toLocaleString() + ')' }
      ],
      alert: {
        type: 'success',
        title: isAr ? 'هيكل ميزانية ثلاثي جاهز للعرض على العميل' : '3-Tier Pitch Recommendation Ready',
        text: isAr ? 'تقديم 3 خيارات واضحة يسهل موافقة العميل المالي ويبعد النقاش عن "هل نعمل معاً؟" إلى "أي باقة سنختار؟".' : 'Presenting 3 clear tiers reframes the closing conversation.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مولد توصيات الميزانيات وتوقعات العائد لعروض وكالات التسويق' + ' (' + APP_ID + ') ===\n\n';
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
