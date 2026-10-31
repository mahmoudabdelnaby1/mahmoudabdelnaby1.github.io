/**
 * APP-029: Core Web Vitals Budget & Resource Weight Planner
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-029';
  var outputsList = ["Total Maximum Page Weight Budget (KB)", "Allocated Budget Breakdown (Images KB, JS KB, CSS KB, Fonts KB, HTML KB)", "Estimated LCP and INP Performance Score", "Actionable Optimization Checklist (WebP/AVIF, Font Subsetting, Lazy Loading)"];
  var defaultValues = {"target_lcp_seconds": 2.5, "image_weight_kb": 850, "javascript_weight_kb": 450};

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
    var targetLcp = Math.max(0.5, inp.target_lcp_seconds || 2.5);
    var imgKb = Math.max(0, inp.image_weight_kb || 0);
    var jsKb = Math.max(0, inp.javascript_weight_kb || 0);

    var totalKb = imgKb + jsKb;
    // Regional 4G mobile baseline: 12 Mbps real throughput (~1500 KB/s) + 120ms RTT
    var downloadTimeSec = (totalKb / 1500) + 0.24;
    var pass = (downloadTimeSec <= targetLcp);

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'زمن التحميل المتوقع (4G)' : 'Projected 4G Load Time', val: downloadTimeSec.toFixed(2) + 's' },
        { label: isAr ? 'حجم الموارد الكلي' : 'Total Asset Weight', val: totalKb.toLocaleString() + ' KB' },
        { label: isAr ? 'حالة اجتياز مؤشر LCP' : 'Core Web Vitals Verdict', val: pass ? (isAr ? 'ناجح (Good)' : 'Good (<= 2.5s)') : (isAr ? 'يحتاج تحسين' : 'Needs Work (> 2.5s)') }
      ],
      breakdown: [
        { label: isAr ? 'الميزانية المستهدفة للـ LCP' : 'Target LCP Threshold', val: targetLcp.toFixed(1) + 's' },
        { label: isAr ? 'إجمالي وزن الصور والأصول' : 'Image Resource Weight', val: imgKb.toLocaleString() + ' KB' },
        { label: isAr ? 'إجمالي وزن ملفات الجافاسكريبت' : 'JavaScript Payload Weight', val: jsKb.toLocaleString() + ' KB' },
        { label: isAr ? 'الوقت المستغرق على شبكة 4G إقليمية' : 'Estimated Mobile Download Duration', val: downloadTimeSec.toFixed(2) + 's' }
      ],
      alert: {
        type: pass ? 'success' : 'danger',
        title: isAr ? (pass ? 'الصفحة سريعة ومطابقة لمعايير جوجل CWV' : 'تحذير: وزن الصفحة يعيق اجتياز مؤشرات الأداء!') : (pass ? 'Core Web Vitals Compliant' : 'Performance Budget Exceeded'),
        text: isAr ? (pass ? 'حجم الأصول خفيف ويضمن سرعة تحميل ممتازة وتجربة مستخدم سلسة على الموبايل.' : 'حجم الصور وملفات السكربت كبير جداً ويؤخر الـ LCP عن 2.5 ثانية. اضغط الصور إلى صيغة WebP.') : (pass ? 'Assets comply with performance budget.' : 'Payload exceeds 2.5s LCP threshold; compress images to WebP.')
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مخطط ميزانية سرعة الموقع وحجم الأصول لمعايير تجربة الصفحة في الشرق الأوسط' + ' (' + APP_ID + ') ===\n\n';
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
