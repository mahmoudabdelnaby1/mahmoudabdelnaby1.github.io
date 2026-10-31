/**
 * APP-044: Ramadan & National Holidays Campaign Content Calendar Generator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-044';
  var outputsList = ["Chronological Seasonal Campaign Timeline", "Key Shopping Windows (Pre-Ramadan, Gifting Week, White Friday, Back to School, National Days)", "Creative Asset Kick-Off Deadlines", "Downloadable iCal / ICS Calendar File or Printable PDF Matrix"];
  var defaultValues = {"target_year": 2026, "target_country": "ksa", "vertical": "retail"};

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
    var ctry = inp.target_country || 'ksa';
    var yr = inp.target_year || 2026;

    var events = [];
    if (ctry === 'ksa') {
      events = [
        { name: 'يوم التأسيس السعودي (Foundation Day)', date: '22 فبراير', window: 'عروض خصومات التأسيس والتراث' },
        { name: 'شهر رمضان المبارك (Ramadan)', date: 'منتصف فبراير - مارس', window: 'ذروة التسوق وموسم الهدايا والإفطار' },
        { name: 'عيد الفطر السعيد (Eid Al-Fitr)', date: 'أواخر مارس', window: 'عروض الملابس والعطور وهدايا العيد' },
        { name: 'اليوم الوطني السعودي (National Day)', date: '23 سبتمبر', window: 'أكبر موسم تخفيضات بعروض الـ 96 ريال' },
        { name: 'الجمعة البيضاء (White Friday)', date: 'نوفمبر', window: 'ذروة تصريف المخزون ومبيعات العام' }
      ];
    } else if (ctry === 'uae') {
      events = [
        { name: 'مهرجان دبي للتسوق (DSF)', date: 'يناير - فبراير', window: 'عروض السياحة والتسوق الكبرى' },
        { name: 'شهر رمضان وعيد الفطر', date: 'فبراير - مارس', window: 'ذروة الإنفاق والتجمعات العائلية' },
        { name: 'اليوم الوطني الإماراتي (Union Day)', date: '2 ديسمبر', window: 'عروض الاتحاد وتخفيضات العطلات' }
      ];
    } else {
      events = [
        { name: 'عيد الأم (Mother's Day)', date: '21 مارس', window: 'هدايا الأمهات والمجوهرات والأجهزة' },
        { name: 'موسم رمضان وعيد الفطر', date: 'فبراير - مارس', window: 'ذروة الأغذية والياميش والملابس' },
        { name: 'الجمعة البيضاء (Black Friday)', date: 'نوفمبر', window: 'أقوى موسم مبيعات للمتاجر الإلكترونية' }
      ];
    }

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'عدد المواسم التسويقية الكبرى' : 'Major Seasonal Events', val: events.length + ' key peaks' },
        { label: isAr ? 'السوق المستهدف' : 'Target Country Market', val: ctry.toUpperCase() },
        { label: isAr ? 'سنة التخطيط' : 'Campaign Year', val: yr.toString() }
      ],
      breakdown: events.map(function(e) {
        return { label: e.name + ' (' + e.date + ')', val: e.window };
      }),
      alert: {
        type: 'info',
        title: isAr ? 'خريطة المواسم التسويقية المعتمدة' : 'Seasonal Peak Campaign Plan',
        text: isAr ? 'ابدأ تجهيز الحملات الإعلانية ومحتوى المؤثرين قبل موعد الموسم بـ 14 يوماً على الأقل لتفادي تضخم أسعار المزادات.' : 'Prepare creative assets 14 days prior to event to avoid peak auction inflation.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مولد جدول محتوى المواسم والأعياد الوطنية لمصر والسعودية والإمارات' + ' (' + APP_ID + ') ===\n\n';
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
