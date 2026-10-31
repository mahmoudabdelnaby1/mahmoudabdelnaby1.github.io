/**
 * APP-034: Interactive WhatsApp Catalog Order Message Generator
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-034';
  var outputsList = ["Customer-Facing Structured Order Template", "Instant Click-to-Order wa.me Link with Pre-filled Variables", "Embeddable 'Order via WhatsApp' HTML Button", "Order Confirmation Receipt Template for Merchant"];
  var defaultValues = {"customer_name": "عبدالله الشمري", "product_items": "1x عطر لافندر فاخر (280 ر.س)\n1x بخور عود ملكي (150 ر.س)", "delivery_address": "الرياض - حي الملقا - شارع وادي حنيفة", "payment_method": "mada"};

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
    var name = inp.customer_name || 'العميل العزيز';
    var items = inp.product_items || '';
    var addr = inp.delivery_address || '';
    var pay = inp.payment_method || 'mada';

    var payText = pay === 'cod' ? 'الدفع عند الاستلام (يرجى تجهيز المبلغ)' : (pay === 'tabby' ? 'مدفوع بالأقساط عبر تابي/تمارا' : 'مدفوع إلكترونياً بالكامل');

    var orderMsg = 'أهلاً بك أستاذ ' + name + ' 🌸\n\n' +
      'تم استلام طلبك بنجاح من متجرنا! تفاصيل الطلب:\n' +
      '📦 المنتجات:\n' + items + '\n\n' +
      '📍 عنوان التوصيل:\n' + addr + '\n\n' +
      '💳 طريقة السداد: ' + payText + '\n\n' +
      'سيتم إشعارك برابط تتبع الشحنة فور تسليمها لشركة التوصيل. شكراً لثقتك بنا! ✨';

    var isAr = (lang === 'ar');
    return {
      metrics: [
        { label: isAr ? 'طول رسالة التأكيد' : 'Message Length', val: orderMsg.length + ' chars' },
        { label: isAr ? 'حالة الرسالة' : 'Message Readiness', val: isAr ? 'جاهزة للإرسال' : 'Ready' },
        { label: isAr ? 'نبرة التواصل' : 'Customer Experience Tone', val: isAr ? 'احترافية وودودة' : 'Polite & Clear' }
      ],
      breakdown: [
        { label: isAr ? 'نص رسالة الواتساب النهائية' : 'Full Structured WhatsApp Message', val: orderMsg },
        { label: isAr ? 'اسم المستلم' : 'Customer Recipient', val: name },
        { label: isAr ? 'حالة السداد المسجلة' : 'Payment Status Confirmed', val: payText }
      ],
      alert: {
        type: 'success',
        title: isAr ? 'رسالة تأكيد طلب منسقة وجاهزة للنسخ' : 'Formatted Order Receipt Ready',
        text: isAr ? 'انسخ الرسالة وأرسلها للعميل عبر واتساب فور إتمام الطلب لتقليل نسبة المرتجعات وبناء الثقة.' : 'Ready to paste into WhatsApp Web to confirm order details.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مولد رسائل طلبات المنتجات الجاهزة عبر الواتساب لتجار المتاجر والمطاعم' + ' (' + APP_ID + ') ===\n\n';
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
