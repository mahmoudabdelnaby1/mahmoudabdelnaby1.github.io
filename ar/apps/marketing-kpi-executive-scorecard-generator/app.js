/**
 * APP-079: Marketing KPI Executive Dashboard Scorecard Generator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-079';
  var outputsList = ["Executive Visual Scorecard (HTML/CSS Printable Table)", "Calculated Blended ROAS & MER %", "Calculated Blended Customer Acquisition Cost (CAC)", "Month-over-Month (MoM) Growth Delta % Indicator", "Copyable One-Paragraph C-Suite Executive Summary"];
  var defaultValues = {"monthly_ad_spend": 45000, "total_revenue": 210000, "blended_cac": 65, "average_order_value": 310, "repeat_customer_rate_pct": 32};

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
    var ads = Math.max(1, inp.monthly_ad_spend || 10000);
    var rev = Math.max(1, inp.total_revenue || 50000);
    var cac = Math.max(1, inp.blended_cac || 50);
    var aov = Math.max(1, inp.average_order_value || 200);
    var rep = Math.min(100, Math.max(0, inp.repeat_customer_rate_pct || 20));

    var roas = rev / ads;
    var mer = (ads / rev) * 100;
    var totalOrders = Math.round(rev / aov);

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'العائد الكلي الموحد (Blended ROAS)' : 'Blended ROAS', val: roas.toFixed(2) + 'x' },
        { label: isAr ? 'نسبة كفاءة التسويق (MER %)' : 'Marketing Efficiency Ratio', val: mer.toFixed(1) + '%' },
        { label: isAr ? 'إجمالي الطلبات الشهرية' : 'Monthly Order Volume', val: totalOrders.toLocaleString() }
      ],
      breakdown: [
        { label: isAr ? 'إجمالي الإيرادات المحققة' : 'Gross Recorded Revenue', val: '$' + rev.toLocaleString() },
        { label: isAr ? 'إجمالي الإنفاق الإعلاني الشامل' : 'Total Marketing Spend', val: '$' + ads.toLocaleString() },
        { label: isAr ? 'متوسط قيمة الطلب (AOV)' : 'Average Order Value (AOV)', val: '$' + aov.toFixed(2) },
        { label: isAr ? 'تكلفة الاستحواذ المدمجة (CAC)' : 'Blended CAC', val: '$' + cac.toFixed(2) },
        { label: isAr ? 'نسبة العملاء المتكررين' : 'Repeat Buyer Share %', val: rep + '%' }
      ],
      alert: {
        type: roas >= 4.0 ? 'success' : (roas >= 2.5 ? 'info' : 'warning'),
        title: isAr ? 'بطاقة الأداء التنفيذي الموحدة' : 'Executive Scorecard Summary',
        text: isAr ? 'لوحة مؤشرات مالية شاملة تقدم للإدارة التنفيذية صورة دقيقة عن ربحية الحملات وكفاءة كل دولار منفق.' : 'Executive-level summary of store marketing economics.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مولد بطاقة قياس الأداء التسويقي التنفيذية الشهرية لتقارير الإدارة والعملاء' + ' (' + APP_ID + ') ===\n\n';
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
