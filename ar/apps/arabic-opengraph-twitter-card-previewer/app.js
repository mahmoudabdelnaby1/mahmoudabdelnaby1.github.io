/**
 * APP-026: OpenGraph & Twitter Card Previewer for Arabic Social Feeds
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-026';
  var outputsList = ["Live Interactive WhatsApp Chat Link Preview Card", "Live Interactive X (Twitter) Summary Card Preview", "Live Interactive LinkedIn / Facebook Feed Post Preview", "Ready-to-Paste HTML <meta> Tags Header Block"];
  var defaultValues = {"og_title": "دليل التسويق الرقمي والتجارة الإلكترونية في الخليج 2026", "og_description": "اكتشف أفضل الممارسات وحاسبات الميزانيات المخصصة للأسواق السعودية والإماراتية والمصرية لزيادة المبيعات والعائد.", "og_image_url": "https://example.com/images/mena-ecommerce-cover.jpg", "destination_domain": "marketinghub.com"};

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
    var title = inp.og_title || 'Page Title';
    var desc = inp.og_description || 'Page Description';
    var img = inp.og_image_url || 'https://via.placeholder.com/1200x630';
    var domain = (inp.destination_domain || 'example.com').replace(/^https?:\/\//, '');

    var isAr = (lang === 'ar');
    var tags = [
      '<meta property="og:type" content="article" />',
      '<meta property="og:title" content="' + title + '" />',
      '<meta property="og:description" content="' + desc + '" />',
      '<meta property="og:image" content="' + img + '" />',
      '<meta property="og:site_name" content="' + domain + '" />',
      '<meta name="twitter:card" content="summary_large_image" />',
      '<meta name="twitter:title" content="' + title + '" />',
      '<meta name="twitter:description" content="' + desc + '" />',
      '<meta name="twitter:image" content="' + img + '" />'
    ];

    return {
      metrics: [
        { label: isAr ? 'طول عنوان المشاركة' : 'OG Title Length', val: title.length + ' chars' },
        { label: isAr ? 'طول الوصف الاجتماعي' : 'OG Description Length', val: desc.length + ' chars' },
        { label: isAr ? 'الأبعاد المثالية للصورة' : 'Ideal Image Ratio', val: '1200 x 630 px (1.91:1)' }
      ],
      breakdown: [
        { label: isAr ? 'وسوم Open Graph الكاملة' : 'Full Open Graph HTML Tags', val: tags.join(' ') },
        { label: isAr ? 'نوع بطاقة تويتر' : 'Twitter Card Format', val: 'summary_large_image' },
        { label: isAr ? 'رابط الصورة البصرية' : 'Social Share Image Asset', val: img },
        { label: isAr ? 'النطاق المعروض للمستخدم' : 'Destination Domain Snippet', val: domain }
      ],
      alert: {
        type: 'info',
        title: isAr ? 'معاينة المشاركة في واتساب وتويتر ولينكد إن' : 'Social Card Ready',
        text: isAr ? 'هذه الوسوم تضمن ظهور عنوان وصورة ووصف جذاب باللغة العربية عند مشاركة رابط الموقع على شبكات التواصل.' : 'Tags ensure rich visual preview rendering across WhatsApp, X, and LinkedIn.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'معاين بطاقات السوشيال ميديا ووسوم OG للنصوص والصور العربية' + ' (' + APP_ID + ') ===\n\n';
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
