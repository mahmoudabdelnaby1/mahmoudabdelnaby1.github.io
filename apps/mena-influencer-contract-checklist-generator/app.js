/**
 * APP-055: Influencer Campaign Deliverables Contract Checklist for MENA
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-055';
  var outputsList = ["Customized Influencer Term Sheet Checklist (Bilingual Arabic/English)", "Mandatory Regulatory Compliance Clauses (Mawthoq license number display)", "Payment Milestone Protection Schedule (50% upfront / 50% post-delivery)", "Printable / Copyable Contract Addendum Format"];
  var defaultValues = {"jurisdiction": "ksa_gcam", "paid_ad_whitelisting_rights": "yes", "content_retention_days": 30, "competitor_exclusivity_days": 60};

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
    var jur = inp.jurisdiction || 'ksa_gcam';
    var whitelist = (inp.paid_ad_whitelisting_rights === 'yes');
    var retention = inp.content_retention_days || 30;
    var exclusivity = inp.competitor_exclusivity_days || 60;

    var clauses = [
      { clause: 'ترخيص موثوق / الرخص الإعلامية', desc: 'إلزام المؤثر بتسجيل رقم الترخيص الرسمي داخل المنشور الإعلاني.' },
      { clause: 'حقوق الإعلانات الممولة (Spark Ads / Partnership)', desc: whitelist ? 'الموافقة على تزويد المتجر بكود Spark Ads لتشغيل إعلانات لمدة ' + retention + ' يوماً.' : 'مقتصر على النشر الطبيعي دون إعلانات مدفوعة.' },
      { clause: 'شرط عدم الترويج للمنافسين (Exclusivity)', desc: 'حظر الإعلان لأي علامة تجارية منافسة في نفس القطاع لمدة ' + exclusivity + ' يوماً.' },
      { clause: 'معايير تسليم الإحصائيات الموثقة', desc: 'إلزام المؤثر بإرسال لقطة شاشة لإحصائيات المشاهدات بعد 24 ساعة من النشر.' }
    ];

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'عدد بنود العقد الإلزامية' : 'Mandatory Contract Clauses', val: clauses.length + ' clauses' },
        { label: isAr ? 'حق تشغيل الإعلانات الممولة' : 'Ad Whitelisting Rights', val: whitelist ? (isAr ? 'مشمول ومفعل' : 'Included') : (isAr ? 'غير مشمول' : 'Excluded') },
        { label: isAr ? 'فترة الحصرية ضد المنافسين' : 'Competitor Exclusivity Window', val: exclusivity + ' ' + (isAr?'يوماً':'days') }
      ],
      breakdown: clauses.map(function(c) {
        return { label: c.clause, val: c.desc };
      }),
      alert: {
        type: 'success',
        title: isAr ? 'عقد تعاون نظامي يحمي حقوق الطرفين' : 'Legally Binding Creator Agreement',
        text: isAr ? 'تحديد شروط الإحصائيات وحقوق الإعلانات الممولة (Whitelisting) يضاعف العائد على استثمارك مع المؤثرين.' : 'Securing whitelisting codes allows scaling winning creator assets in Meta/TikTok.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'قائمة فحص بنود العقود وحقوق استخدام المواد الإعلانية مع المؤثرين' + ' (' + APP_ID + ') ===\n\n';
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
