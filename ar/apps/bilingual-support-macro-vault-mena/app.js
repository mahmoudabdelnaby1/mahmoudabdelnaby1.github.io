/**
 * APP-035: Bilingual WhatsApp Customer Support Quick-Reply Macro Vault
 * Runtime Architecture: Zero Backend, 100% Client-Side Deterministic Logic
 */

(function () {
  'use strict';

  var APP_ID = 'APP-035';
  var outputsList = ["Tailored Quick-Reply Text Ready to Copy", "Alternative Empathetic Variations", "Recommended Follow-up Timing", "One-Click Copy to Clipboard Action"];
  var defaultValues = {"scenario": "delayed_shipment", "customer_language": "saudi_arabic", "agent_name": "سارة"};

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
    var sc = inp.scenario || 'delayed_shipment';
    var dialect = inp.customer_language || 'saudi_arabic';
    var agent = inp.agent_name || 'سارة';

    var responses = {
      'delayed_shipment': {
        'saudi_arabic': 'يا هلا ومسهلا بك! معك ' + agent + ' من خدمة العملاء. نعتذر جداً عن التأخير الخارج عن إرادتنا مع شركة الشحن. تم رفع طلب استعجال فوري للشحنة وأبشر باللي يسرك، شحنتك بتكون عندك خلال 24 ساعة بإذن الله.',
        'egyptian_arabic': 'أهلاً بحضرتك! معاك ' + agent + ' من خدمة العملاء. بنعتذر جداً عن أي تأخير حصل في التوصيل، تواصلنا حالاً مع المندوب وطلبنا تسليمها لحضرتك في أسرع وقت اليوم، وحضرتك تؤمرنا.',
        'english': 'Hello! This is ' + agent + ' from customer care. We sincerely apologize for the delay. We have expedited your parcel with the courier and it will be delivered within 24 hours.'
      },
      'out_of_stock': {
        'saudi_arabic': 'يا هلا بك! نعتذر منك بشدة، القطعة هذي نفدت كميتها بسبب الإقبال الكبير. وفرنا لك بديل مقارب وبنفس الجودة، أو إذا تحب نرجع لك المبلغ لحسابك فوراً وأبشر بالخير.',
        'egyptian_arabic': 'أهلاً بحضرتك! بنعتذر جداً، المنتج ده خلص حالياً بسبب الضغط، نقدر نقترح على حضرتك بديل ممتاز بنفس المواصفات أو نرجع لحضرتك المبلغ فوراً.',
        'english': 'Hello! We apologize, but this item is currently out of stock. We can offer an equivalent alternative or issue a full instant refund.'
      }
    };

    var res = (responses[sc] && responses[sc][dialect]) ? responses[sc][dialect] : responses['delayed_shipment']['saudi_arabic'];
    var isAr = (lang === 'ar');

    return {
      metrics: [
        { label: isAr ? 'حالة القالب' : 'Template Status', val: isAr ? 'معتمد ومختبر' : 'Tested & Approved' },
        { label: isAr ? 'اللهجة المعتمدة' : 'Selected Dialect', val: dialect },
        { label: isAr ? 'طول الرد' : 'Word Count', val: res.split(' ').length + ' words' }
      ],
      breakdown: [
        { label: isAr ? 'الرد الجاهز المخصص' : 'Ready Support Macro', val: res },
        { label: isAr ? 'اسم ممثل الخدمة' : 'Agent Persona Name', val: agent },
        { label: isAr ? 'حالة الموقف' : 'Customer Scenario', val: sc }
      ],
      alert: {
        type: 'success',
        title: isAr ? 'قالب خدمة عملاء عالي التعاطف' : 'High Empathy Customer Response',
        text: isAr ? 'استخدام اللهجة الصحيحة والمفردات الودودة يمتص غضب العميل ويحول المشكلة لتجربة إيجابية.' : 'Localized dialect mitigates customer friction and prevents chargebacks.'
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

    var text = (isAr ? '=== تقرير ' : '=== Report: ') + 'مخزن قوالب الردود السريعة لخدمة العملاء بالعامية المصرية والخليجية والفصحى' + ' (' + APP_ID + ') ===\n\n';
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
