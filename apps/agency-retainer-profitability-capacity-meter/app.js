/**
 * APP-087: Agency Client Retainer Profitability & Capacity Utilization Meter
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-087';
  var outputsList = ["Effective Hourly Realized Rate ($/hour)", "Client Gross Margin %", "Account Profitability Status (Highly Profitable / Healthy / Dangerously Subsidized / In Loss)", "Action Plan (Renegotiate Scope / Raise Retainer by $X / Terminate Contract)"];
  var defaultValues = {"monthly_retainer_fee": 12000, "allocated_team_hours_monthly": 80, "blended_hourly_cost_of_talent": 65};

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
    var fee = Math.max(1, inp.monthly_retainer_fee || 5000);
    var hours = Math.max(1, inp.allocated_team_hours_monthly || 40);
    var costRate = Math.max(1, inp.blended_hourly_cost_of_talent || 40);

    var internalCost = hours * costRate;
    var netProfit = fee - internalCost;
    var marginPct = (netProfit / fee) * 100;
    var realizedHourlyRate = fee / hours;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'صافي ربح الريتينر الشهري' : 'Net Retainer Monthly Profit', val: '$' + netProfit.toLocaleString() },
        { label: isAr ? 'هامش ربح الوكالة' : 'Agency Net Margin %', val: marginPct.toFixed(1) + '%' },
        { label: isAr ? 'عائد الساعة المحقق فعلياً' : 'Realized Hourly Rate', val: '$' + realizedHourlyRate.toFixed(2) + '/hr' }
      ],
      breakdown: [
        { label: isAr ? 'قيمة الاشتراك الشهري للعميل' : 'Billed Monthly Retainer', val: '$' + fee.toLocaleString() },
        { label: isAr ? 'تكلفة ساعات عمل الفريق الداخلية' : 'Internal Team Delivery Cost', val: '$' + internalCost.toLocaleString() },
        { label: isAr ? 'هامش ربح الوكالة الصافي' : 'Net Retainer Profit Margin', val: marginPct.toFixed(1) + '%' },
        { label: isAr ? 'مؤشر تآكل الساعات (Scope Creep)' : 'Capacity Health Status', val: marginPct >= 40 ? (isAr ? 'صحي ومربح' : 'Healthy (>40%)') : (isAr ? 'منخفض ومعرض للخسارة' : 'Margin Squeeze (<40%)') }
      ],
      alert: {
        type: marginPct >= 40 ? 'success' : (marginPct > 0 ? 'warning' : 'danger'),
        title: isAr ? ('ربحية العقد: ' + marginPct.toFixed(1) + '%') : ('Retainer Margin: ' + marginPct.toFixed(1) + '%'),
        text: isAr ? (marginPct >= 40 ? 'العقد يحقق ربحية ممتازة تتوافق مع معايير أفضل وكالات التسويق.' : 'الساعات المستهلكة تبتلع قيمة الاشتراك! ضع حدوداً واضحة لعدد التعديلات والمهام.') : 'Retainer margins must exceed 40% to sustain agency overhead.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مقياس ربحية عقود عملاء وكالات التسويق ونسبة استغلال ساعات الفريق' + ' (' + APP_ID + ') ===\n\n';
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
