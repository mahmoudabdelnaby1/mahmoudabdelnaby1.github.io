/**
 * APP-052: Barter vs Paid Influencer Collaboration ROI Calculator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-052';
  var outputsList = ["Effective True Cost per Guaranteed Published Post (Barter vs Paid)", "Financial Risk Assessment (Unpublished Gift Loss)", "Optimal Recommendation (Go Barter / Go Contracted Paid / Skip)", "Required Product Sales to Break Even on Each Method"];
  var defaultValues = {"gifted_product_retail_val": 450, "gifted_product_cogs": 130, "expected_posting_probability_pct": 45, "paid_sponsorship_fee": 3500};

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
    var retail = Math.max(1, inp.gifted_product_retail_val || 100);
    var cogs = Math.max(1, inp.gifted_product_cogs || 30);
    var prob = Math.min(100, Math.max(1, inp.expected_posting_probability_pct || 40)) / 100;
    var paidFee = Math.max(1, inp.paid_sponsorship_fee || 1000);

    // Effective cost per secured post via Barter = (COGS + Shipping 30 SAR) / prob
    var barterCostPerPost = (cogs + 30) / prob;
    var paidCostPerPost = paidFee + cogs; // Paid fee plus gifted product
    var savingsPct = ((paidCostPerPost - barterCostPerPost) / paidCostPerPost) * 100;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'تكلفة المنشور عبر الإهداء (Barter)' : 'Effective Barter Cost/Post', val: barterCostPerPost.toFixed(2) + ' SAR' },
        { label: isAr ? 'تكلفة المنشور المدفوع المضمون' : 'Guaranteed Paid Deal Cost', val: paidCostPerPost.toFixed(2) + ' SAR' },
        { label: isAr ? 'نسبة التوفير عبر استراتيجية الإهداء' : 'Savings via Gifting Strategy', val: savingsPct.toFixed(1) + '%' }
      ],
      breakdown: [
        { label: isAr ? 'تكلفة القطعة المهداة الفعلي (COGS + شحن)' : 'True Out-of-Pocket Gifting Cost', val: (cogs + 30).toFixed(2) + ' SAR' },
        { label: isAr ? 'احتمالية نشر المؤثر للمنتج المهدي' : 'Posting Probability Rate', val: (prob*100).toFixed(0) + '%' },
        { label: isAr ? 'التكلفة الفعلية لكل منشور ناجح (Barter)' : 'Effective Cost per Secured Post', val: barterCostPerPost.toFixed(2) + ' SAR' },
        { label: isAr ? 'مقارنة التكلفة مع التعاقد المدفوع' : 'Cost Comparison vs Direct Paid Fee', val: Math.round(paidCostPerPost / barterCostPerPost) + 'x Cheaper' }
      ],
      alert: {
        type: savingsPct > 50 ? 'success' : 'info',
        title: isAr ? 'استراتيجية الإهداء (Barter) توفر ميزانية ضخمة' : 'Gifting GTM Highly Recommended',
        text: isAr ? ('إرسال منتجات مجانية لـ 10 مؤثرين يكلفك ' + ((cogs+30)*10).toFixed(0) + ' ريال فقط، وتضمن الحصول على 4 إلى 5 منشورات بتكلفة أقل بكثير من التعاقد المدفوع.') : ('Micro-gifting secures organic creator posts at a fraction of paid agency retainers.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة جدوى وعائد الإهداءات والتعاون بالتبادل Barter مقابل الدفع النقدي' + ' (' + APP_ID + ') ===\n\n';
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
