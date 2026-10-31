/**
 * APP-017: Gulf Cross-Border E-Commerce Customs & Tariffs Estimator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-017';
  var outputsList = ["Duty-Free Exemption (De Minimis) Status", "Customs Duty Payable", "Import VAT Amount Payable", "Estimated Courier Clearance Administration Fee", "Total Landed Cost per Package"];
  var defaultValues = {"destination_country": "ksa", "goods_cif_value": 450, "product_category": "fashion", "customs_duty_rate_pct": 5.0};

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
    var cif = Math.max(0, inp.goods_cif_value || 0);
    var dutyRate = Math.max(0, inp.customs_duty_rate_pct || 5.0) / 100;
    var dest = inp.destination_country || 'ksa';

    var vatRate = (dest === 'ksa') ? 0.15 : ((dest === 'uae') ? 0.05 : 0.0);
    var deMinimis = (dest === 'ksa') ? 266 : ((dest === 'uae') ? 80 : 100);

    var isExempt = (cif <= deMinimis);
    var duty = isExempt ? 0 : (cif * dutyRate);
    var vat = (cif + duty) * vatRate;
    var clearance = isExempt ? 0 : 25; // Benchmark carrier handling fee
    var totalLanded = cif + duty + vat + clearance;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'إجمالي التكلفة الواصلة (Landed Cost)' : 'Total Landed Cost', val: '$' + totalLanded.toFixed(2) },
        { label: isAr ? 'ضريبة القيمة المضافة المستحقة' : 'Import VAT Payable', val: '$' + vat.toFixed(2) },
        { label: isAr ? 'الرسوم الجمركية المفروضة' : 'Customs Duty Payable', val: '$' + duty.toFixed(2) }
      ],
      breakdown: [
        { label: isAr ? 'قيمة الشحنة CIF (بضاعة + تأمين + شحن)' : 'Base Goods CIF Value', val: '$' + cif.toFixed(2) },
        { label: isAr ? 'حالة الإعفاء الجمركي (De Minimis)' : 'Duty-Free Exemption Status', val: (isExempt ? (isAr ? 'معفي من الرسوم الجمركية (أقل من الحد)' : 'Exempt (Below Threshold)') : (isAr ? 'خاضع للجمارك والرسوم' : 'Taxable / Subject to Duty')) },
        { label: isAr ? 'الرسوم الجمركية (' + (dutyRate*100).toFixed(0) + '%)' : 'Customs Duty Payable', val: '$' + duty.toFixed(2) },
        { label: isAr ? 'ضريبة القيمة المضافة عند المنفذ' : 'Import VAT Amount', val: '$' + vat.toFixed(2) },
        { label: isAr ? 'رسوم التخليص الإداري لشركة الشحن' : 'Courier Clearance Administrative Fee', val: '$' + clearance.toFixed(2) }
      ],
      alert: {
        type: isExempt ? 'success' : 'warning',
        title: isAr ? (isExempt ? 'شحنة معفاة من الجمارك' : 'تنبيه رسوم جمركية ومصاريف تخليص') : (isExempt ? 'Duty-Free Exemption Active' : 'Customs & Handling Fees Apply'),
        text: isAr ? (isExempt ? 'قيمة الشحنة أقل من حد الإعفاء، مما يجنبك دفع الرسوم الجمركية ورسوم التخليص الإداري.' : 'الشحنة تتجاوز حد الإعفاء. ستفرض الجمارك ضريبة ورسوم تخليص يتحملها العميل أو المتجر.') : (isExempt ? 'Package is below national de minimis threshold.' : 'Package exceeds exemption limit; expect duty and courier admin fees.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مقدر الرسوم الجمركية وضريبة القيمة المضافة للشحن بين دول الخليج' + ' (' + APP_ID + ') ===\n\n';
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
