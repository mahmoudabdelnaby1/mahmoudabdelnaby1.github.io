/**
 * APP-081: GCC B2B Cost Per Qualified Lead (CPQL) & Pipeline Velocity Calculator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-081';
  var outputsList = ["Raw Cost Per Lead (CPL) vs True Cost Per Qualified Lead (CPQL)", "Lead Qualification Quality Rate % (SQL / Raw)", "Pipeline Velocity Index ($ Value Generated per Day)", "Required Lead Pipeline Volume to Hit Quarterly Revenue Quota"];
  var defaultValues = {"ad_spend": 15000, "total_raw_leads": 250, "qualification_rate_pct": 32, "sales_cycle_days": 45, "average_contract_value": 28000};

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
    var spend = Math.max(1, inp.ad_spend || 5000);
    var leads = Math.max(1, inp.total_raw_leads || 50);
    var qualPct = Math.min(100, Math.max(1, inp.qualification_rate_pct || 25)) / 100;
    var cycle = Math.max(1, inp.sales_cycle_days || 30);
    var acv = Math.max(1, inp.average_contract_value || 10000);

    var rawCpl = spend / leads;
    var qualLeads = Math.round(leads * qualPct);
    var cpql = qualLeads > 0 ? (spend / qualLeads) : spend;
    var winRate = 0.22; // Benchmark 22% B2B close rate on qualified pipeline
    var pipelineVelocityDaily = (qualLeads * winRate * acv) / cycle;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'تكلفة العميل المحتمل المؤهل (CPQL)' : 'Cost per Qualified Lead (CPQL)', val: '$' + cpql.toFixed(2) },
        { label: isAr ? 'سرعة توليد الإيرادات اليومية' : 'Pipeline Velocity / Day', val: '$' + Math.round(pipelineVelocityDaily).toLocaleString() + '/day' },
        { label: isAr ? 'عدد العملاء المؤهلين (SQLs)' : 'Sales Qualified Leads (SQLs)', val: qualLeads + ' leads' }
      ],
      breakdown: [
        { label: isAr ? 'تكلفة العميل الخام غير المفلتر (Raw CPL)' : 'Raw Cost per Lead', val: '$' + rawCpl.toFixed(2) },
        { label: isAr ? 'نسبة التأهيل والملاءمة (Qualification Rate)' : 'Qualification Rate %', val: (qualPct*100).toFixed(0) + '%' },
        { label: isAr ? 'التكلفة الحقيقية للعميل المؤهل للبيع (CPQL)' : 'True Cost per SQL', val: '$' + cpql.toFixed(2) },
        { label: isAr ? 'متوسط قيمة العقد السنوي (ACV)' : 'Average Contract Value (ACV)', val: '$' + acv.toLocaleString() },
        { label: isAr ? 'سرعة دورة المبيعات' : 'Sales Cycle Duration', val: cycle + ' ' + (isAr?'يوماً':'days') }
      ],
      alert: {
        type: 'info',
        title: isAr ? 'المقياس الحقيقي لإعلانات B2B في الخليج' : 'CPQL vs Vanity CPL',
        text: isAr ? 'انخفاض تكلفة الـ CPL قد يضللك إذا كانت البيانات لغير صناع القرار. التركيز على الـ CPQL هو المعيار الفعلي لربحية الحملات المؤسسية.' : 'Focus on Cost Per Qualified Lead (CPQL) rather than cheap irrelevant leads.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة تكلفة العميل المحتمل المؤهل وسرعة تدفق الصفقات لقطاع B2B في الخليج' + ' (' + APP_ID + ') ===\n\n';
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
