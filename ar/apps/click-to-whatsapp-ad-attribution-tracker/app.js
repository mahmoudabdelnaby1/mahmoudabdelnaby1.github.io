/**
 * APP-038: Click-to-WhatsApp Ad Conversion Attribution Tracker
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-038';
  var outputsList = ["Cost Per Started Conversation (CPMC)", "Chat-to-Sale Closing Rate %", "True Cost Per Acquired Order (CPA/CPO)", "Real WhatsApp Campaign ROAS", "Sales Agent Performance Benchmark (Healthy >15% closing vs Low <8%)"];
  var defaultValues = {"campaign_name": "ramadan_wa_conversations", "target_cpc": 0.65, "chat_to_order_conversion_rate_pct": 18, "average_order_value": 320};

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
    var cpc = Math.max(0.01, inp.target_cpc || 0.5);
    var cvr = Math.min(100, Math.max(0.1, inp.chat_to_order_conversion_rate_pct || 15)) / 100;
    var aov = Math.max(1, inp.average_order_value || 200);

    // Assume 85% of ad clicks actually initiate a message thread
    var costPerChat = cpc / 0.85;
    var cac = costPerChat / cvr;
    var roas = aov / cac;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'تكلفة المحادثة (Cost per Chat)' : 'Cost per Started Chat', val: '$' + costPerChat.toFixed(2) },
        { label: isAr ? 'تكلفة اكتساب الطلب (CAC)' : 'Customer Acquisition Cost (CAC)', val: '$' + cac.toFixed(2) },
        { label: isAr ? 'العائد على الإنفاق (ROAS)' : 'Projected Campaign ROAS', val: roas.toFixed(2) + 'x' }
      ],
      breakdown: [
        { label: isAr ? 'تكلفة النقرة في إعلان واتساب (CPC)' : 'Target Ad Click Cost (CPC)', val: '$' + cpc.toFixed(2) },
        { label: isAr ? 'تكلفة بدء المحادثة الفعلية' : 'True Cost per Opened WhatsApp Thread', val: '$' + costPerChat.toFixed(2) },
        { label: isAr ? 'معدل تحويل المحادثات إلى شراء' : 'Sales Close Rate (% of Chats)', val: (cvr*100).toFixed(1) + '%' },
        { label: isAr ? 'تكلفة اكتساب العميل المشتري (CAC)' : 'Customer Acquisition Cost', val: '$' + cac.toFixed(2) },
        { label: isAr ? 'العائد المتوقع على الإنفاق الإعلاني' : 'Implied Direct ROAS', val: roas.toFixed(2) + 'x' }
      ],
      alert: {
        type: roas >= 3.0 ? 'success' : (roas >= 1.8 ? 'warning' : 'danger'),
        title: isAr ? ('عائد الحملة: ' + roas.toFixed(2) + 'x') : ('Campaign ROAS: ' + roas.toFixed(2) + 'x'),
        text: isAr ? (roas >= 3.0 ? 'أرقام ممتازة! إعلانات التحويل إلى واتساب تحقق عائداً استثمارياً مرتفعاً.' : 'معدل إغلاق المبيعات داخل المحادثات يحتاج إلى تحسين أو تدريب فريق الرد.') : (roas >= 3.0 ? 'Highly profitable Click-to-WhatsApp funnel.' : 'Close rate inside chats needs improvement.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة ومقيس عائد إعلانات التحويل إلى واتساب ونسبة الإغلاق الفعلي من المحادثات' + ' (' + APP_ID + ') ===\n\n';
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
