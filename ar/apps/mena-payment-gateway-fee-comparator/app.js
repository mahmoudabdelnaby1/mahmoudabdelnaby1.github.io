/**
 * APP-013: MENA Payment Gateway Fee & Net Payout Comparator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-013';
  var outputsList = ["Total Processing Fees per Gateway", "Net In-Bank Payout Comparison Table", "Effective Fee Percentage (e.g. 2.92% vs 3.45%)", "Top Recommended Gateway for Your Transaction Profile", "Annual Cost Savings Difference"];
  var defaultValues = {"monthly_gmv": 150000, "average_ticket_size": 350, "country": "ksa", "payment_method_split": "mada_card"};

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
    var gmv = Math.max(100, inp.monthly_gmv || 50000);
    var ticket = Math.max(1, inp.average_ticket_size || 200);
    var country = inp.country || 'ksa';
    var orders = Math.round(gmv / ticket);

    var feePct = 0.0275;
    var fixedFee = 1.0;
    var curr = 'SAR';

    if (country === 'ksa') {
      curr = 'SAR';
      if (inp.payment_method_split === 'mada_card') {
        feePct = 0.0175; // Mada discounted rate
        fixedFee = 1.0;
      } else {
        feePct = 0.0275;
        fixedFee = 1.0;
      }
    } else if (country === 'egypt') {
      curr = 'EGP';
      feePct = 0.0275;
      fixedFee = 3.0; // Paymob benchmark
    } else {
      curr = 'AED';
      feePct = 0.0290;
      fixedFee = 1.0; // Stripe UAE benchmark
    }

    var totalPercentageFee = gmv * feePct;
    var totalFixedFees = orders * fixedFee;
    var totalFeeAmount = totalPercentageFee + totalFixedFees;
    var effectiveTakeRate = (totalFeeAmount / gmv) * 100;
    var netSettlement = gmv - totalFeeAmount;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'إجمالي رسوم البوابة الشهرية' : 'Total Gateway Fees', val: totalFeeAmount.toLocaleString() + ' ' + curr },
        { label: isAr ? 'النسبة الفعالة المخصومة' : 'Effective Take Rate %', val: effectiveTakeRate.toFixed(2) + '%' },
        { label: isAr ? 'صافي المبلغ المحول للبنك' : 'Net Settled Payout', val: netSettlement.toLocaleString() + ' ' + curr }
      ],
      breakdown: [
        { label: isAr ? 'حجم المبيعات الإجمالي (GMV)' : 'Total Monthly Sales Volume', val: gmv.toLocaleString() + ' ' + curr },
        { label: isAr ? 'عدد العمليات المنفذة' : 'Total Transaction Count', val: orders.toLocaleString() },
        { label: isAr ? 'الرسوم المتغيرة (' + (feePct*100).toFixed(2) + '%)' : 'Variable Gateway Commission', val: totalPercentageFee.toFixed(2) + ' ' + curr },
        { label: isAr ? 'الرسوم الثابتة لكل معاملة' : 'Fixed Per-Transaction Fees', val: totalFixedFees.toFixed(2) + ' ' + curr },
        { label: isAr ? 'صافي الحصيلة في الحساب البنكي' : 'Net Settlement Received', val: netSettlement.toFixed(2) + ' ' + curr }
      ],
      alert: {
        type: 'info',
        title: isAr ? 'تسعير المعاملات المحلية' : 'Local Payment Network Rates',
        text: isAr ? (country === 'ksa' ? 'استخدام مدى يقلل العمولة إلى 1.75% مقارنة بـ 2.75% للبطاقات الدولية.' : 'تم تطبيق تسعير بوابات الدفع الرسمية المعتمدة في السوق المحلي.') : 'Local debit routing unlocks significant interchange fee savings.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مقارن رسوم بوابات الدفع الإلكتروني وصافي التحصيل لمصر والخليج' + ' (' + APP_ID + ') ===\n\n';
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
