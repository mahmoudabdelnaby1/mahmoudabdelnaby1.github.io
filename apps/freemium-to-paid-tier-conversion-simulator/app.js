/**
 * APP-094: Freemium to Paid Tier Conversion Economics Simulator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-094';
  var outputsList = ["Total Paying Subscriber Base", "Monthly Recurring Revenue (MRR)", "Total Cost of Free User Drag", "Net Profit Contribution", "Break-Even Minimum Conversion Rate Threshold"];
  var defaultValues = {"free_tier_active_users": 15000, "free_to_paid_conversion_rate_pct": 3.5, "monthly_subscription_price": 29, "free_user_hosting_cost": 0.12};

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
    var freeUsers = Math.max(1, inp.free_tier_active_users || 1000);
    var cvr = Math.min(100, Math.max(0.01, inp.free_to_paid_conversion_rate_pct || 3.0)) / 100;
    var price = Math.max(1, inp.monthly_subscription_price || 20);
    var costPerFree = Math.max(0, inp.free_user_hosting_cost || 0.1);

    var paidSubscribers = Math.round(freeUsers * cvr);
    var mrr = paidSubscribers * price;
    var infrastructureBurn = freeUsers * costPerFree;
    var netMonthlyProfit = mrr - infrastructureBurn;
    var breakEvenCvr = (infrastructureBurn / (freeUsers * price)) * 100;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'صافي الإيراد الشهري المتكرر (MRR)' : 'Monthly Recurring Revenue (MRR)', val: '$' + mrr.toLocaleString() },
        { label: isAr ? 'صافي الربح بعد تكاليف السيرفرات' : 'Net Monthly Profit', val: '$' + Math.round(netMonthlyProfit).toLocaleString() },
        { label: isAr ? 'الحد الأدنى لنسبة التحويل للتعادل' : 'Break-Even Conversion Floor', val: breakEvenCvr.toFixed(2) + '%' }
      ],
      breakdown: [
        { label: isAr ? 'عدد المشتركين في الباقة المدفوعة' : 'Paid Paying Subscribers', val: paidSubscribers.toLocaleString() },
        { label: isAr ? 'تكلفة استضافة المستخدمين المجانيين' : 'Free Tier Infrastructure Cost', val: '$' + Math.round(infrastructureBurn).toLocaleString() },
        { label: isAr ? 'نسبة التحويل من مجاني لمدفوع' : 'Freemium Conversion Rate', val: (cvr*100).toFixed(2) + '%' },
        { label: isAr ? 'صافي الهامش الربحي لنموذج العمل' : 'Freemium Net Margin %', val: ((netMonthlyProfit / Math.max(1, mrr)) * 100).toFixed(1) + '%' }
      ],
      alert: {
        type: netMonthlyProfit > 0 ? 'success' : 'danger',
        title: isAr ? (netMonthlyProfit > 0 ? 'نموذج فريميوم رابح وقابل للتوسع' : 'تحذير: تكلفة المستخدم المجاني تبتلع الأرباح!') : 'Freemium Economics Verdict',
        text: isAr ? (netMonthlyProfit > 0 ? 'المشتركون في الباقة المدفوعة يغطون تكلفة الخوادم للمستخدمين المجانيين ويوفرون أرباحاً ممتازة.' : 'تكلفة استضافة الحسابات المجانية تفوق الإيرادات المحصلة! قيد خصائص الباقة المجانية فوراً.') : 'Healthy freemium dynamics sustaining free tier infrastructure overhead.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'محاكي تحويل المستخدمين المجانيين إلى باقات مدفوعة في التطبيقات والخدمات' + ' (' + APP_ID + ') ===\n\n';
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
