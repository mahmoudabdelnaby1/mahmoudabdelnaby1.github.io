/**
 * APP-016: Inventory Velocity & Reorder Point Alert Forecaster
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-016';
  var outputsList = ["Days of Inventory Left", "Projected Stockout Calendar Date", "Reorder Point Threshold (Order when stock hits X units)", "Recommended Safety Stock Buffer Units"];
  var defaultValues = {"current_stock_units": 1500, "daily_sales_velocity": 45, "supplier_lead_time_days": 21, "planned_ad_spend_increase_pct": 30};

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
    var stock = Math.max(0, inp.current_stock_units || 0);
    var vel = Math.max(0.1, inp.daily_sales_velocity || 10);
    var lead = Math.max(1, inp.supplier_lead_time_days || 14);
    var adBoost = Math.max(0, inp.planned_ad_spend_increase_pct || 0);

    var scaledVelocity = vel * (1 + (adBoost / 100));
    var daysLeft = Math.round(stock / scaledVelocity);
    var safetyStock = Math.round(scaledVelocity * (lead * 0.35));
    var reorderPoint = Math.round((scaledVelocity * lead) + safetyStock);

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'الأيام المتبقية لنفاد المخزون' : 'Days of Inventory Left', val: daysLeft + ' ' + (isAr?'أيام':'days') },
        { label: isAr ? 'نقطة إعادة الطلب (Reorder Point)' : 'Reorder Point Threshold', val: reorderPoint.toLocaleString() + ' ' + (isAr?'قطعة':'units') },
        { label: isAr ? 'مخزون الأمان الإلزامي' : 'Recommended Safety Buffer', val: safetyStock.toLocaleString() + ' ' + (isAr?'قطعة':'units') }
      ],
      breakdown: [
        { label: isAr ? 'سرعة البيع اليومية مع زيادة الإعلانات' : 'Scaled Daily Sales Velocity', val: scaledVelocity.toFixed(1) + ' ' + (isAr?'قطعة/يوم':'units/day') },
        { label: isAr ? 'المدة المتبقية حتى نفاد الرفوف' : 'Days Until Complete Stockout', val: daysLeft.toString() },
        { label: isAr ? 'طلب شحنة جديدة فور وصول الرصيد إلى' : 'Trigger New Order at Threshold', val: reorderPoint.toLocaleString() + ' ' + (isAr?'قطعة':'units') },
        { label: isAr ? 'مخزون الأمان لمواجهة تأخير الشحن' : 'Buffer Stock for Carrier Delay', val: safetyStock.toLocaleString() + ' ' + (isAr?'قطعة':'units') }
      ],
      alert: {
        type: stock <= reorderPoint ? 'danger' : (daysLeft < (lead * 1.5) ? 'warning' : 'success'),
        title: isAr ? (stock <= reorderPoint ? 'تنبيه عاجل: يجب إعادة الطلب فوراً!' : 'حالة المخزون مستقرة') : (stock <= reorderPoint ? 'URGENT: Reorder Immediately!' : 'Inventory Levels Healthy'),
        text: isAr ? (stock <= reorderPoint ? 'المخزون الحالي وصل إلى نقطة الخطر! أي تأخير من المورد سيؤدي لتوقف الإعلانات وضياع المبيعات.' : 'المخزون كافٍ ومحمي بمخزون أمان يغطي فترة التوريد المقررة.') : (stock <= reorderPoint ? 'Stock has dropped below reorder threshold. Order now to prevent stockouts.' : 'Stock is within safe operating parameters.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'حاسبة معدل دوران المخزون وتحديد نقطة إعادة الطلب للمتاجر قبل نفاد البضائع' + ' (' + APP_ID + ') ===\n\n';
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
