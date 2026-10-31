/**
 * APP-100: Customer Win-Back & Dormant Account Reactivation ROI Modeler
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-100';
  var outputsList = ["Projected Reactivated Buying Customers (at channel benchmark response rate)", "Gross Revenue Generated from Dormant Base", "Net Profit Realized After Discount & Messaging Costs", "Effective Reactivation CAC (typically <$3 vs cold ads >$20)", "Recommended 3-Step Win-Back Offer Sequence Timing"];
  var defaultValues = {"dormant_customer_count": 8500, "average_order_value": 290, "gross_margin_pct": 48, "winback_discount_pct": 15, "messaging_channel": "whatsapp"};

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
    var users = Math.max(1, inp.dormant_customer_count || 1000);
    var aov = Math.max(1, inp.average_order_value || 100);
    var margin = Math.min(100, Math.max(1, inp.gross_margin_pct || 40)) / 100;
    var disc = Math.min(50, Math.max(0, inp.winback_discount_pct || 0)) / 100;
    var ch = inp.messaging_channel || 'whatsapp';

    var rates = { 'whatsapp': 0.09, 'sms': 0.05, 'email': 0.025 };
    var actRate = rates[ch] || 0.05;

    var costPerContact = ch === 'whatsapp' ? 0.08 : (ch === 'sms' ? 0.05 : 0.005);
    var totalCampaignCost = users * costPerContact;

    var reactivatedUsers = Math.round(users * actRate);
    var recoveredRevenue = reactivatedUsers * aov * (1 - disc);
    var grossProfit = recoveredRevenue * margin;
    var netProfit = grossProfit - totalCampaignCost;
    var roi = totalCampaignCost > 0 ? ((netProfit / totalCampaignCost) * 100) : 0;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'صافي الربح المسترد من العملاء الخاملين' : 'Net Win-Back Profit', val: '$' + Math.round(netProfit).toLocaleString() },
        { label: isAr ? 'عدد العملاء الذين تم استرجاعهم' : 'Reactivated Customers', val: reactivatedUsers.toLocaleString() + ' buyers' },
        { label: isAr ? 'العائد على استثمار الحملة (ROI)' : 'Campaign ROI %', val: '+' + Math.round(roi) + '%' }
      ],
      breakdown: [
        { label: isAr ? 'إجمالي العملاء الخاملين المستهدفين' : 'Dormant Audience Size', val: users.toLocaleString() },
        { label: isAr ? 'تكلفة إرسال الحملة الإجمالية' : 'Total Outreach Messaging Cost', val: '$' + totalCampaignCost.toFixed(2) },
        { label: isAr ? 'المبيعات المستردة الصافية بعد الخصم' : 'Recovered Gross Revenue', val: '$' + Math.round(recoveredRevenue).toLocaleString() },
        { label: isAr ? 'صافي الأرباح المحققة بعد تكلفة البضاعة والرسائل' : 'Bottom-Line Cash Contribution', val: '$' + Math.round(netProfit).toLocaleString() }
      ],
      alert: {
        type: 'success',
        title: isAr ? 'أعلى عائد استثماري ممكن في التسويق' : 'Exceptional Winback ROI',
        text: isAr ? ('إعادة تنشيط ' + reactivatedUsers.toLocaleString() + ' عميل سابق عبر ' + (ch === 'whatsapp' ? 'واتساب' : ch) + ' يحقق عائداً يفوق ' + Math.round(roi) + '% لأن العميل يعرف علامتك ويثق بها مسبقاً.') : ('Reactivating dormant customers delivers significantly higher ROI than cold ad acquisition.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'محاكي عائد حملات إعادة تنشيط العملاء القدامى والخاملين لمتاجر التجزئة' + ' (' + APP_ID + ') ===\n\n';
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
