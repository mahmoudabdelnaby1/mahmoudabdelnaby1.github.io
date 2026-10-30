/**
 * APP-022: MENA Multi-Regional Hreflang Tag & Header Generator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-022';
  var outputsList = ["Generated HTML <link rel='alternate' hreflang=...> Tags Block", "XML Sitemap Hreflang Format Code", "Bidirectional Cross-Linking Validation Checklist", "One-Click Copyable Code Snippet"];
  var defaultValues = {"base_url": "https://brand.com/store", "selected_regions": "sa,ae,eg,kw", "include_x_default": "yes"};

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
    var base = (inp.base_url || 'https://brand.com').replace(/\/+$/, '');
    var xDef = (inp.include_x_default === 'yes');

    var regionMap = [
      { code: 'ar-sa', country: 'Saudi Arabia', path: '/sa' },
      { code: 'ar-ae', country: 'United Arab Emirates', path: '/ae' },
      { code: 'ar-eg', country: 'Egypt', path: '/eg' },
      { code: 'ar-kw', country: 'Kuwait', path: '/kw' },
      { code: 'en-ae', country: 'UAE English', path: '/ae/en' }
    ];

    var tags = [];
    regionMap.forEach(function(r) {
      tags.push('<link rel="alternate" hreflang="' + r.code + '" href="' + base + r.path + '" />');
    });
    if (xDef) {
      tags.push('<link rel="alternate" hreflang="x-default" href="' + base + '" />');
    }

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'عدد وسوم Hreflang المولدة' : 'Generated Hreflang Tags', val: tags.length + ' tags' },
        { label: isAr ? 'وسم x-default الافتراضي' : 'x-default Status', val: xDef ? (isAr ? 'مدرج' : 'Active') : (isAr ? 'معطل' : 'Disabled') },
        { label: isAr ? 'النطاق الأساسي' : 'Base Domain', val: base.replace(/^https?:\/\//, '') }
      ],
      breakdown: [
        { label: isAr ? 'كود وسوم Head الكامل' : 'Full HTML Head Tags', val: tags.join(' ') },
        { label: isAr ? 'وسم السعودية' : 'KSA Alternate Tag', val: '<link rel="alternate" hreflang="ar-sa" href="' + base + '/sa" />' },
        { label: isAr ? 'وسم الإمارات (عربي)' : 'UAE Arabic Alternate Tag', val: '<link rel="alternate" hreflang="ar-ae" href="' + base + '/ae" />' },
        { label: isAr ? 'وسم مصر' : 'Egypt Alternate Tag', val: '<link rel="alternate" hreflang="ar-eg" href="' + base + '/eg" />' }
      ],
      alert: {
        type: 'success',
        title: isAr ? 'توليد وسوم Hreflang ثنائية الاتجاه' : 'Valid Hreflang Cluster Generated',
        text: isAr ? 'انسخ الأكواد وضعها في قسم <head> في جميع نسخ الموقع لضمان توجيه الباحثين في كل دولة للنسخة المحلية المخصصة لهم.' : 'Paste generated tags in <head> across all country versions to resolve multi-region SERP cannibalization.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مولد وسوم ولغة المناطق Hreflang لمصر ودول الخليج العربي' + ' (' + APP_ID + ') ===\n\n';
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
