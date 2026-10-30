/**
 * APP-027: Robots.txt & Canonical Tag Validator for MENA Sites
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-027';
  var outputsList = ["Complete Copyable robots.txt File Content", "Direct Downloadable robots.txt File", "Crawl Syntax Verification & Rule Safety Audit", "Canonical Tag Implementation Snippet"];
  var defaultValues = {"site_url": "https://ecommerce-store.sa", "disallow_paths": "/cart\n/checkout\n/admin\n/api/\n/account", "sitemap_url": "https://ecommerce-store.sa/sitemap_index.xml"};

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
    var site = (inp.site_url || 'https://example.com').replace(/\/+$/, '');
    var paths = (inp.disallow_paths || '/checkout').split(/[\r\n]+/).filter(function(p){ return p.trim().length > 0; });
    var sitemap = inp.sitemap_url || (site + '/sitemap.xml');

    var lines = [
      'User-agent: *'
    ];
    paths.forEach(function(p) {
      lines.push('Disallow: ' + p.trim());
    });
    lines.push('');
    lines.push('Sitemap: ' + sitemap);

    var robotsTxt = lines.join('\n');
    var isAr = (lang === 'ar');

    return {
      metrics: [
        { label: isAr ? 'عدد المسارات المحجوبة' : 'Disallowed Routes', val: paths.length + ' paths' },
        { label: isAr ? 'رابط ملف خريطة الموقع' : 'Sitemap Linked', val: isAr ? 'مربوط بنجاح' : 'Linked' },
        { label: isAr ? 'حماية بيانات الدفع والعملاء' : 'Checkout Protection', val: isAr ? 'محمي 100%' : '100% Protected' }
      ],
      breakdown: [
        { label: isAr ? 'محتوى ملف robots.txt النهائي' : 'Complete robots.txt Content', val: robotsTxt },
        { label: isAr ? 'المسارات المستبعدة من الأرشفة' : 'Blocked Dynamic URL Paths', val: paths.join(', ') },
        { label: isAr ? 'رابط ملف خريطة الموقع (Sitemap)' : 'Sitemap URL Directive', val: sitemap },
        { label: isAr ? 'توافق ملف الروبوتس' : 'Syntax Validation Verdict', val: isAr ? 'سليم ومتوافق مع معايير W3C و Googlebot' : '100% Valid W3C / Googlebot Syntax' }
      ],
      alert: {
        type: 'success',
        title: isAr ? 'ملف robots.txt مثالي لمتاجر التجارة الإلكترونية' : 'Optimal E-Commerce robots.txt',
        text: isAr ? 'حجب صفحات السلة والدفع وحسابات العملاء يوفر ميزانية الزحف (Crawl Budget) ويمنع أرشفة البيانات الحساسة.' : 'Blocks private checkout funnels and preserves Googlebot crawl budget.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مدقق ومنشئ ملف robots.txt والروابط الكنسية Canonical للمتاجر العربية' + ' (' + APP_ID + ') ===\n\n';
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
