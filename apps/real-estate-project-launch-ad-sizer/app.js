/**
 * APP-088: Real Estate Property Launch Ad Budget Sizer by Unit Inventory
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-088';
  var outputsList = ["Gross Development Value (GDV) of Launch", "Recommended Total Marketing Launch Budget (1.8% of GDV standard)", "Required Total Qualified Lead Volume Needed", "Monthly Ad Budget & Daily Lead Targets", "Channel Budget Split (Meta 40%, Google Search 35%, Programmatic/OOH 25%)"];
  var defaultValues = {"total_inventory_units_to_sell": 80, "average_unit_price": 1800000, "target_lead_to_sale_conversion_pct": 0.8, "cost_per_lead_cpl": 120};

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
    var units = Math.max(1, inp.total_inventory_units_to_sell || 20);
    var price = Math.max(1000, inp.average_unit_price || 500000);
    var convPct = Math.min(100, Math.max(0.01, inp.target_lead_to_sale_conversion_pct || 0.8)) / 100;
    var cpl = Math.max(1, inp.cost_per_lead_cpl || 100);

    var requiredLeads = Math.round(units / convPct);
    var totalAdBudgetRequired = requiredLeads * cpl;
    var totalGrossInventoryValue = units * price;
    var adSpendShareOfInventory = (totalAdBudgetRequired / totalGrossInventoryValue) * 100;

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'الميزانية الإعلانية الإلزامية للإطلاق' : 'Required Launch Ad Budget', val: '$' + Math.round(totalAdBudgetRequired).toLocaleString() },
        { label: isAr ? 'عدد العملاء المهتمين المطلوب (Leads)' : 'Total Leads Required', val: requiredLeads.toLocaleString() + ' leads' },
        { label: isAr ? 'نسبة الإعلانات من قيمة المشروع' : 'Ad Spend % of Inventory Value', val: adSpendShareOfInventory.toFixed(2) + '%' }
      ],
      breakdown: [
        { label: isAr ? 'إجمالي قيمة الوحدات المعروضة للبيع' : 'Gross Real Estate Inventory Value', val: '$' + totalGrossInventoryValue.toLocaleString() },
        { label: isAr ? 'عدد العملاء المتوقع تسجيلهم للوصول للهدف' : 'Lead Generation Target Volume', val: requiredLeads.toLocaleString() },
        { label: isAr ? 'الميزانية الإعلانية الإجمالية الموصى بها' : 'Required Paid Media Investment', val: '$' + Math.round(totalAdBudgetRequired).toLocaleString() },
        { label: isAr ? 'المعيار التسويقي للمطورين' : 'Developer Industry Benchmark', val: 'Ad spend typically ranges 0.5% - 1.5% of GDV' }
      ],
      alert: {
        type: 'info',
        title: isAr ? 'خطة تسويق الإطلاق العقاري المكتملة' : 'Launch Campaign Budget Sized',
        text: isAr ? ('لتصريف ' + units + ' وحدة عقارية بنسبة إغلاق ' + (convPct*100) + '%، تحتاج لتوليد ' + requiredLeads.toLocaleString() + ' عميل محتمل بميزانية ' + Math.round(totalAdBudgetRequired).toLocaleString() + ' دولار.') : ('Full mathematical sizing for residential/commercial project clearance.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة ميزانية إطلاق المشروعات العقارية حسب عدد الوحدات وسعر المتر' + ' (' + APP_ID + ') ===\n\n';
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
