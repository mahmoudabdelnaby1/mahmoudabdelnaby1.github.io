/**
 * DM STATIC APP SUITE - SHARED CLIENT UTILITIES (SHARED.JS)
 * Zero Backend, Zero External Dependencies, 100% Client-Side
 */

(function () {
  'use strict';

  var sharedScriptSrc = document.currentScript ? document.currentScript.src : '';

  // Global State
  var currentLang = 'ar'; // Default Arabic for MENA suite

  // Check saved preference or URL param
  try {
    var savedLang = localStorage.getItem('dm_app_lang');
    if (savedLang === 'en' || savedLang === 'ar') {
      currentLang = savedLang;
    }
  } catch (e) {
    // LocalStorage disabled or sandboxed
  }

  // Set initial document attributes
  function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

    // Update all elements with data-en and data-ar
    var i18nElements = document.querySelectorAll('[data-en][data-ar]');
    for (var i = 0; i < i18nElements.length; i++) {
      var el = i18nElements[i];
      var text = el.getAttribute('data-' + lang);
      if (text !== null) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          if (el.getAttribute('placeholder')) {
            el.placeholder = text;
          }
        } else {
          el.textContent = text;
        }
      }
    }

    var localizedLinks = document.querySelectorAll('[data-href-en][data-href-ar]');
    for (var j = 0; j < localizedLinks.length; j++) {
      localizedLinks[j].setAttribute('href', localizedLinks[j].getAttribute('data-href-' + lang));
    }

    var localizedLabels = document.querySelectorAll('[data-aria-en][data-aria-ar]');
    for (var k = 0; k < localizedLabels.length; k++) {
      localizedLabels[k].setAttribute('aria-label', localizedLabels[k].getAttribute('data-aria-' + lang));
    }

    // Update language toggle button text
    var toggleBtn = document.getElementById('lang-toggle-btn');
    if (toggleBtn) {
      toggleBtn.textContent = (lang === 'ar') ? 'English' : 'عربي';
      toggleBtn.setAttribute('aria-label', (lang === 'ar') ? 'Switch to English' : 'التحويل للعربية');
    }

    // Notify active app logic if listener exists
    if (typeof window.onAppLanguageChange === 'function') {
      window.onAppLanguageChange(lang);
    }
    if (typeof window.refreshPortfolioToolSearch === 'function') {
      window.refreshPortfolioToolSearch();
    }

    try {
      localStorage.setItem('dm_app_lang', lang);
    } catch (e) {}
  }

  function setupPortfolioNavigation() {
    var header = document.querySelector('.top-nav');
    if (!header || header.getAttribute('data-portfolio-nav') === 'ready') return;

    var oldBrand = header.querySelector('.nav-brand');
    var oldBadge = oldBrand ? oldBrand.querySelector('.brand-badge') : null;
    var appId = oldBadge && /^APP-\d+/i.test(oldBadge.textContent.trim()) ? oldBadge.textContent.trim() : '';
    var oldToggle = header.querySelector('#lang-toggle-btn');

    function localizedText(tag, className, en, ar) {
      var element = document.createElement(tag);
      if (className) element.className = className;
      element.setAttribute('data-en', en);
      element.setAttribute('data-ar', ar);
      element.textContent = currentLang === 'ar' ? ar : en;
      return element;
    }

    function localizedLink(en, ar, enHref, arHref, className) {
      var link = localizedText('a', className || '', en, ar);
      link.setAttribute('data-href-en', enHref);
      link.setAttribute('data-href-ar', arHref);
      link.setAttribute('href', currentLang === 'ar' ? arHref : enHref);
      return link;
    }

    var brandGroup = document.createElement('div');
    brandGroup.className = 'portfolio-tools-brand-group';
    var brand = document.createElement('a');
    brand.className = 'portfolio-tools-brand';
    brand.setAttribute('data-href-en', '/');
    brand.setAttribute('data-href-ar', '/ar/');
    brand.setAttribute('href', currentLang === 'ar' ? '/ar/' : '/');
    brand.setAttribute('data-aria-en', 'Return to the portfolio');
    brand.setAttribute('data-aria-ar', 'العودة إلى الملف المهني');
    brand.setAttribute('aria-label', currentLang === 'ar' ? 'العودة إلى الملف المهني' : 'Return to the portfolio');
    var firstName = localizedText('span', '', 'MAHMOUD ', 'محمود ');
    var surname = localizedText('em', '', 'ABDELNABY', 'عبدالنبي');
    brand.appendChild(firstName);
    brand.appendChild(surname);
    brandGroup.appendChild(brand);

    var contextLink = localizedLink(
      appId ? 'All tools' : 'Marketing tools',
      appId ? 'كل الأدوات' : 'الأدوات التسويقية',
      '/apps/', '/apps/', 'portfolio-tools-context'
    );
    contextLink.setAttribute('aria-current', appId ? 'location' : 'page');
    brandGroup.appendChild(contextLink);
    if (appId) {
      var appBadge = document.createElement('span');
      appBadge.className = 'portfolio-tools-app-id';
      appBadge.textContent = appId;
      brandGroup.appendChild(appBadge);
    }

    var nav = document.createElement('nav');
    nav.className = 'portfolio-tools-nav';
    nav.setAttribute('data-aria-en', 'Primary navigation');
    nav.setAttribute('data-aria-ar', 'التنقل الرئيسي');
    nav.setAttribute('aria-label', currentLang === 'ar' ? 'التنقل الرئيسي' : 'Primary navigation');
    var links = document.createElement('div');
    links.className = 'portfolio-tools-nav-links';
    links.id = 'portfolio-tools-primary-links';
    links.appendChild(localizedLink('Experience', 'الأثر والخبرة', '/#selected-work', '/ar/#selected-work'));
    links.appendChild(localizedLink('Expertise', 'الخبرات', '/#expertise', '/ar/#expertise'));

    var libraryMenu = document.createElement('details');
    libraryMenu.className = 'portfolio-tools-library-menu';
    var summary = localizedText('summary', '', 'Libraries', 'المكتبات');
    libraryMenu.appendChild(summary);
    var panel = document.createElement('div');
    panel.className = 'portfolio-tools-library-panel';
    [
      ['Playbooks', 'الأدلة العملية', '/playbooks/', '/ar/playbooks/'],
      ['Frameworks', 'الأطر', '/frameworks/', '/ar/frameworks/'],
      ['Skills library', 'مكتبة المهارات', '/skills/', '/ar/skills/'],
      ['Marketing systems', 'الأنظمة التسويقية', '/marketing-systems/', '/ar/marketing-systems/'],
      ['Marketing tools', 'الأدوات التسويقية', '/apps/', '/apps/'],
      ['Blog & articles', 'المدونة والمقالات', '/blog/', '/ar/blog/'],
      ['Assistant library', 'مكتبة المساعدين', '/#assistant-library', '/ar/#assistant-library']
    ].forEach(function (item) {
      var link = localizedLink(item[0], item[1], item[2], item[3]);
      if (item[0] === 'Marketing tools') {
        link.setAttribute('aria-current', appId ? 'location' : 'page');
      }
      panel.appendChild(link);
    });
    libraryMenu.appendChild(panel);
    links.appendChild(libraryMenu);
    nav.appendChild(links);

    var actions = document.createElement('div');
    actions.className = 'nav-actions portfolio-tools-nav-actions';
    if (oldToggle) {
      oldToggle.className = 'btn btn-secondary btn-sm';
      actions.appendChild(oldToggle);
    } else {
      var languageToggle = document.createElement('button');
      languageToggle.id = 'lang-toggle-btn';
      languageToggle.type = 'button';
      languageToggle.className = 'btn btn-secondary btn-sm';
      actions.appendChild(languageToggle);
    }
    var contact = localizedLink('WhatsApp', 'واتساب', 'https://wa.me/201205904700', 'https://wa.me/201205904700', 'portfolio-tools-contact');
    contact.setAttribute('rel', 'noopener');
    actions.appendChild(contact);
    var menuToggle = localizedText('button', 'portfolio-tools-menu-toggle', 'Menu', 'القائمة');
    menuToggle.type = 'button';
    menuToggle.setAttribute('aria-controls', links.id);
    menuToggle.setAttribute('aria-expanded', 'false');
    actions.appendChild(menuToggle);
    nav.appendChild(actions);

    header.replaceChildren(brandGroup, nav);
    header.classList.add('portfolio-tools-top-nav');
    header.setAttribute('data-portfolio-nav', 'ready');

    setupPortfolioToolSearch(nav, actions);

    menuToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (event) {
      if (!nav.contains(event.target)) {
        nav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        libraryMenu.open = false;
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        if (libraryMenu.open) {
          libraryMenu.open = false;
          summary.focus();
        } else if (nav.classList.contains('is-open')) {
          nav.classList.remove('is-open');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.focus();
        }
      }
    });
  }

  var searchSynonyms = {
    'تكلفه': ['cost', 'price', 'fee', 'spend', 'budget'],
    'صرف': ['spend', 'cost', 'budget'],
    'هصرف': ['spend', 'cost', 'budget'],
    'اصرف': ['spend', 'cost', 'budget'],
    'فلوس': ['spend', 'budget', 'cost', 'revenue'],
    'ميزانيه': ['budget', 'spend', 'allocation'],
    'نسبه': ['rate', 'ratio', 'conversion', 'percentage'],
    'معدل': ['rate', 'ratio', 'velocity', 'metrics'],
    'قياس': ['measure', 'metric', 'score', 'analytics'],
    'اعلان': ['ad', 'ads', 'advertising', 'campaign', 'paid'],
    'اعلن': ['ad', 'ads', 'advertising', 'campaign', 'paid'],
    'حمله': ['campaign', 'ads', 'paid'],
    'ضريبه': ['tax', 'vat'],
    'قيمه': ['vat', 'tax'],
    'عموله': ['fee', 'markup', 'commission', 'payment'],
    'كارت': ['card', 'currency', 'markup'],
    'بطاقه': ['card', 'currency', 'markup'],
    'فيزا': ['card', 'currency', 'payment'],
    'دولار': ['usd', 'dollar', 'currency'],
    'عميل': ['customer', 'client', 'lead'],
    'عملاء': ['customer', 'client', 'lead'],
    'محادثه': ['whatsapp', 'chat'],
    'رساله': ['sms', 'message'],
    'رسائل': ['sms', 'message'],
    'واتساب': ['whatsapp'],
    'احسب': ['calculate', 'calculator', 'estimate'],
    'حساب': ['calculate', 'calculator', 'estimate'],
    'احسبلي': ['calculate', 'calculator', 'estimate'],
    'اعرف': ['calculate', 'calculator', 'estimate'],
    'يطلع': ['calculate', 'calculator', 'estimate'],
    'مبيعات': ['sales', 'revenue', 'conversion'],
    'تحويل': ['conversion', 'convert', 'attribution'],
    'سله': ['cart', 'basket'],
    'سلات': ['cart', 'basket'],
    'دفع': ['payment', 'checkout', 'bnpl'],
    'خصم': ['discount', 'debit', 'fee', 'cost'],
    'يتخصم': ['debit', 'card', 'fee', 'cost'],
    'هيتخصم': ['debit', 'card', 'fee', 'cost'],
    'يخصم': ['debit', 'card', 'fee', 'cost'],
    'ارجع': ['recovery', 'abandoned', 'cart', 'winback'],
    'متروكه': ['abandoned', 'cart', 'recovery'],
    'مشكله': ['diagnostic', 'checker', 'audit', 'issue'],
    'مشاكل': ['diagnostic', 'checker', 'audit', 'issue'],
    'بطئ': ['speed', 'performance', 'vitals'],
    'بطيء': ['speed', 'performance', 'vitals'],
    'سرعه': ['speed', 'performance', 'vitals'],
    'ظهور': ['search', 'seo', 'impressions', 'visibility'],
    'ترتيب': ['ranking', 'seo'],
    'رابط': ['link', 'url'],
    'موقع': ['website', 'landing', 'page'],
    'صفحه': ['landing', 'page'],
    'محتوي': ['content', 'copy', 'social'],
    'كلام': ['copy', 'content', 'writing'],
    'فيديو': ['video', 'script', 'reels', 'tiktok'],
    'بوست': ['social', 'post', 'linkedin', 'content'],
    'مؤثر': ['influencer', 'creator'],
    'متابعين': ['follower', 'engagement', 'influencer'],
    'استرجاع': ['recovery', 'abandoned', 'cart', 'winback'],
    'مخزون': ['inventory', 'stock'],
    'ربح': ['profit', 'margin', 'profitability'],
    'تتبع': ['tracking', 'utm', 'attribution'],
    'اختبار': ['test', 'ab', 'statistical'],
    'اقتراح': ['budget', 'proposal', 'recommendation'],
    'شحن': ['shipping', 'delivery'],
    'توصيل': ['shipping', 'delivery', 'fulfillment'],
    'مخالفه': ['compliance', 'policy', 'regulatory'],
    'ضرائب': ['tax', 'vat'],
    'charge': ['card', 'debit', 'fee', 'cost'],
    'charged': ['card', 'debit', 'fee', 'cost'],
    'bill': ['invoice', 'tax', 'vat', 'fee'],
    'withdraw': ['debit', 'card', 'fee', 'spend'],
    'spend': ['cost', 'budget', 'ad'],
    'cost': ['fee', 'price', 'budget'],
    'problem': ['issue', 'diagnostic', 'checker', 'audit'],
    'issue': ['problem', 'diagnostic', 'checker', 'audit'],
    'slow': ['speed', 'performance', 'vitals'],
    'track': ['tracking', 'utm', 'attribution'],
    'tracking': ['utm', 'attribution'],
    'sales': ['revenue', 'conversion', 'checkout'],
    'measure': ['calculate', 'calculator', 'track', 'analytics', 'diagnostic'],
    'improve': ['optimize', 'optimizer', 'conversion', 'performance'],
    'rate': ['ratio', 'percentage', 'conversion', 'score'],
    'customers': ['customer', 'client', 'lead'],
    'ads': ['ad', 'advertising', 'campaign', 'paid'],
    'tax': ['vat', 'fee'],
    'video': ['script', 'reels', 'tiktok'],
    'followers': ['follower', 'engagement', 'influencer'],
    'stock': ['inventory', 'reorder'],
    'shipping': ['delivery', 'fulfillment'],
    'website': ['site', 'landing', 'page']
  };

  var searchCategoryLabels = {
    'Paid Ads, Media Buying & Tax': 'الإعلانات والضرائب والعملات',
    'E-commerce & COD Economics': 'التجارة الإلكترونية والدفع عند الاستلام',
    'SEO & Technical Optimization': 'السيو والتحسين التقني',
    'WhatsApp Marketing & SMS': 'واتساب والرسائل النصية',
    'Social Media & Copywriting': 'السوشيال ميديا وصناعة المحتوى',
    'Influencer & Creator Marketing': 'المؤثرون وصناع المحتوى',
    'CRO & Funnel Optimization': 'تحسين التحويل وصفحات الهبوط',
    'Marketing Analytics & Attribution': 'التحليلات ونسب الإسناد',
    'B2B Marketing & Lead Gen': 'التسويق بين الشركات والعملاء المحتملين',
    'Growth Strategy & Seasonal Pricing': 'استراتيجيات النمو والمواسم'
  };

  var searchStopWords = new Set(('i me my we our you your he she it they them a an the and or but if then how what which who where when why is are am was were be been being do does did can could would should need want find looking for help with about on in at to from of by as into per this that these those there have has had much many tell show use please can will should could would tool tools app apps ' +
    'انا انت انتي هو هي احنا هم انا عايز عايزه عايزين محتاج محتاجه اريد ابغى ابحث بدور بدورعلى بدورعن عايزاعرف عايزه اعرف من فضلك لو سمحت ممكن ازاي كيف هل اي ايه ما ماذا في من على عن الي اللي ده دي دول دا كده كذا جدا عندي عنده عندها بتاع بتاعة يكون تكون كان كانت يتم لي و او ثم بس لكن بقى بقي كام قد يعني عايز اعرف عايزه اعرف عاوز عاوزه عاوز اعرف').split(/\s+/));

  function normalizeSearchText(value) {
    return String(value || '').toLowerCase()
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
      .replace(/[’'`]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  }

  function stemSearchToken(token) {
    var stem = token.replace(/^ال(?=.{4,})/, '').replace(/(ات|ون|ين|ان)$/, '');
    if (/^[a-z]+$/.test(stem)) {
      if (/ies$/.test(stem) && stem.length > 5) stem = stem.replace(/ies$/, 'y');
      else if (/(ches|shes|xes|zes|sses)$/.test(stem)) stem = stem.replace(/es$/, '');
      else if (/s$/.test(stem) && !/ss$/.test(stem) && stem.length > 4) stem = stem.slice(0, -1);
    }
    return stem;
  }

  function getSearchGroups(query) {
    var normalized = normalizeSearchText(query);
    var tokens = normalized.split(/\s+/).filter(function (token) {
      return token.length > 1 && !searchStopWords.has(token);
    });
    var seen = new Set();
    return tokens.filter(function (token) {
      if (seen.has(token)) return false;
      seen.add(token);
      return true;
    }).map(function (token) {
      var stem = stemSearchToken(token);
      return Array.from(new Set([token, stem].concat(searchSynonyms[token] || [], searchSynonyms[stem] || [])));
    });
  }

  function searchScore(query, searchableText) {
    var normalizedQuery = normalizeSearchText(query);
    var normalizedText = normalizeSearchText(searchableText);
    var groups = getSearchGroups(query);
    if (!groups.length || !normalizedText) return 0;
    var tokens = new Set();
    normalizedText.split(/\s+/).forEach(function (token) {
      tokens.add(token);
      tokens.add(stemSearchToken(token));
    });
    var hits = 0;
    groups.forEach(function (group) {
      if (group.some(function (term) { return tokens.has(normalizeSearchText(term)); })) hits++;
    });
    var requiredHits = groups.length <= 2 ? 1 : Math.max(2, Math.ceil(groups.length * 0.22));
    if (hits < requiredHits) return 0;
    var score = hits / groups.length;
    if (normalizedQuery.length > 2 && normalizedText.indexOf(normalizedQuery) !== -1) score += 1;
    return score;
  }

  function setupPortfolioToolSearch(nav, actions) {
    if (document.getElementById('portfolio-tools-search-panel')) return;
    function searchText(tag, className, en, ar) {
      var element = document.createElement(tag);
      if (className) element.className = className;
      element.setAttribute('data-en', en);
      element.setAttribute('data-ar', ar);
      element.textContent = currentLang === 'ar' ? ar : en;
      return element;
    }

    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'portfolio-tools-search-toggle';
    var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    var iconCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    iconCircle.setAttribute('cx', '10.8');
    iconCircle.setAttribute('cy', '10.8');
    iconCircle.setAttribute('r', '6.8');
    var iconHandle = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    iconHandle.setAttribute('d', 'm16 16 4.5 4.5');
    icon.appendChild(iconCircle);
    icon.appendChild(iconHandle);
    trigger.appendChild(icon);
    trigger.appendChild(searchText('span', 'portfolio-tools-search-toggle-label', 'Search', 'بحث'));
    trigger.setAttribute('aria-controls', 'portfolio-tools-search-panel');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('data-aria-en', 'Search all marketing tools');
    trigger.setAttribute('data-aria-ar', 'ابحث في كل الأدوات التسويقية');
    trigger.setAttribute('aria-label', currentLang === 'ar' ? 'ابحث في كل الأدوات التسويقية' : 'Search all marketing tools');
    actions.insertBefore(trigger, actions.firstChild);

    var panel = document.createElement('section');
    panel.className = 'portfolio-tools-search-panel';
    panel.id = 'portfolio-tools-search-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', currentLang === 'ar' ? 'البحث في الأدوات' : 'Search tools');
    var label = searchText('label', 'portfolio-tools-search-label', 'Describe what you need', 'اكتب ما تحتاجه بطريقتك');
    label.setAttribute('for', 'portfolio-tools-search-input');
    var input = document.createElement('input');
    input.type = 'search';
    input.id = 'portfolio-tools-search-input';
    input.className = 'portfolio-tools-search-input';
    input.autocomplete = 'off';
    input.setAttribute('data-placeholder-en', 'e.g. “I spend $500 on ads in Egypt. What will my card charge?”');
    input.setAttribute('data-placeholder-ar', 'مثال: «عايز أعرف هيتخصم كام من كارت البنك للإعلانات؟»');
    input.placeholder = input.getAttribute('data-placeholder-' + currentLang);
    input.setAttribute('aria-describedby', 'portfolio-tools-search-help');
    var help = searchText('p', 'portfolio-tools-search-help', 'Search across 100 tools in Arabic or English. Your query stays in this browser.', 'ابحث في 100 أداة بالعربية أو الإنجليزية. يظل بحثك داخل المتصفح.');
    help.id = 'portfolio-tools-search-help';
    var results = document.createElement('div');
    results.className = 'portfolio-tools-search-results';
    results.id = 'portfolio-tools-search-results';
    results.setAttribute('aria-live', 'polite');
    results.setAttribute('aria-label', currentLang === 'ar' ? 'نتائج البحث' : 'Search results');
    panel.appendChild(label);
    panel.appendChild(input);
    panel.appendChild(help);
    panel.appendChild(results);
    nav.appendChild(panel);

    var toolsPromise = null;
    function loadTools() {
      if (!toolsPromise) {
        var indexUrl = new URL('tools-index.json', sharedScriptSrc || window.location.href);
        if (sharedScriptSrc) {
          var assetVersion = new URL(sharedScriptSrc).searchParams.get('v');
          if (assetVersion) indexUrl.searchParams.set('v', assetVersion);
        }
        toolsPromise = fetch(indexUrl.href).then(function (response) {
          if (!response.ok) throw new Error('Search index request failed');
          return response.json();
        }).catch(function (error) {
          toolsPromise = null;
          throw error;
        });
      }
      return toolsPromise;
    }
    function renderResults() {
      var query = input.value.trim();
      input.placeholder = input.getAttribute('data-placeholder-' + currentLang);
      panel.setAttribute('aria-label', currentLang === 'ar' ? 'البحث في الأدوات' : 'Search tools');
      results.setAttribute('aria-label', currentLang === 'ar' ? 'نتائج البحث' : 'Search results');
      results.replaceChildren();
      if (query.length < 2) return;
      var loading = document.createElement('p');
      loading.className = 'portfolio-tools-search-empty';
      loading.textContent = currentLang === 'ar' ? 'أبحث عن الأدوات المناسبة…' : 'Finding relevant tools…';
      results.appendChild(loading);
      loadTools().then(function (tools) {
        if (!panel.isConnected || !input.value.trim() || query !== input.value.trim()) return;
        var matches = tools.map(function (tool) {
          var searchable = [tool.href, tool.id, tool.category, tool.titleEn, tool.titleAr, tool.descriptionEn, tool.descriptionAr].join(' ');
          return { tool: tool, score: searchScore(query, searchable) };
        }).filter(function (item) { return item.score > 0; })
          .sort(function (a, b) { return b.score - a.score; }).slice(0, 6);
        results.replaceChildren();
        if (!matches.length) {
          var empty = document.createElement('p');
          empty.className = 'portfolio-tools-search-empty';
          empty.textContent = currentLang === 'ar' ? 'لم أجد أداة مطابقة. جرّب وصف المشكلة بكلمات أبسط.' : 'No close match yet. Try describing the problem in simpler words.';
          results.appendChild(empty);
          return;
        }
        matches.forEach(function (match) {
          var tool = match.tool;
          var link = document.createElement('a');
          link.className = 'portfolio-tools-search-result';
          link.href = new URL('/apps/' + tool.href, window.location.origin).href;
          var meta = document.createElement('span');
          meta.className = 'portfolio-tools-search-result-meta';
          meta.textContent = tool.id + ' · ' + (currentLang === 'ar' ? (searchCategoryLabels[tool.category] || tool.category) : tool.category);
          var title = document.createElement('strong');
          title.textContent = currentLang === 'ar' ? tool.titleAr : tool.titleEn;
          var description = document.createElement('span');
          description.className = 'portfolio-tools-search-result-description';
          description.textContent = currentLang === 'ar' ? tool.descriptionAr : tool.descriptionEn;
          link.appendChild(meta);
          link.appendChild(title);
          if (currentLang !== 'ar' || tool.descriptionAr !== tool.descriptionEn) {
            link.appendChild(description);
          }
          results.appendChild(link);
        });
      }).catch(function () {
        if (query !== input.value.trim()) return;
        var error = document.createElement('p');
        error.className = 'portfolio-tools-search-empty';
        error.textContent = currentLang === 'ar' ? 'تعذر تحميل فهرس البحث. أعد المحاولة بعد لحظة.' : 'Search could not load. Please try again in a moment.';
        results.replaceChildren(error);
      });
    }
    trigger.addEventListener('click', function () {
      var open = panel.hidden;
      panel.hidden = !open;
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) input.focus();
    });
    input.addEventListener('input', renderResults);
    document.addEventListener('click', function (event) {
      if (!panel.contains(event.target) && event.target !== trigger) {
        panel.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !panel.hidden) {
        panel.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      }
    });
    window.refreshPortfolioToolSearch = renderResults;
  }

  // Toast Notification
  function showToast(message) {
    var toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 2800);
  }

  // Copy to Clipboard
  function copyToClipboard(text, successMsg) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast(successMsg || (currentLang === 'ar' ? 'تم النسخ للحافظة بنجاح' : 'Copied to clipboard successfully'));
      }).catch(function () {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast(successMsg || (currentLang === 'ar' ? 'تم النسخ للحافظة بنجاح' : 'Copied to clipboard successfully'));
    } catch (err) {
      showToast(currentLang === 'ar' ? 'فشل النسخ التلقائي' : 'Failed to copy');
    }
    document.body.removeChild(textarea);
  }

  // Formatting Utilities
  function formatNumber(val, decimals) {
    if (val === null || val === undefined || isNaN(val)) return '0';
    var d = (decimals !== undefined) ? decimals : 2;
    return Number(val).toLocaleString(currentLang === 'ar' ? 'ar-EG' : 'en-US', {
      minimumFractionDigits: d,
      maximumFractionDigits: d
    });
  }

  function formatCurrency(val, currencyCode) {
    if (val === null || val === undefined || isNaN(val)) return '0';
    var formattedNum = formatNumber(val, 2);
    var symbols = {
      'EGP': { ar: 'ج.م', en: 'EGP' },
      'SAR': { ar: 'ر.س', en: 'SAR' },
      'AED': { ar: 'د.إ', en: 'AED' },
      'KWD': { ar: 'د.ك', en: 'KWD' },
      'QAR': { ar: 'ر.ق', en: 'QAR' },
      'USD': { ar: '$', en: '$' }
    };
    var curr = symbols[currencyCode] || { ar: currencyCode, en: currencyCode };
    var sym = (currentLang === 'ar') ? curr.ar : curr.en;
    return formattedNum + ' ' + sym;
  }

  function formatPercent(val, decimals) {
    if (val === null || val === undefined || isNaN(val)) return '0%';
    var d = (decimals !== undefined) ? decimals : 1;
    return formatNumber(val, d) + '%';
  }

  // Safe Local Storage Wrapper (Strictly Device-Only)
  function saveAppState(appId, data) {
    try {
      localStorage.setItem('dm_state_' + appId, JSON.stringify(data));
      showToast(currentLang === 'ar' ? 'تم الحفظ في المتصفح محلياً (لا يتم رفعه لأي خادم)' : 'Saved to browser local storage (never uploaded)');
    } catch (e) {
      showToast(currentLang === 'ar' ? 'تعذر الحفظ في المتصفح' : 'Could not access local storage');
    }
  }

  function loadAppState(appId) {
    try {
      var item = localStorage.getItem('dm_state_' + appId);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  }

  function clearAppState(appId) {
    try {
      localStorage.removeItem('dm_state_' + appId);
      showToast(currentLang === 'ar' ? 'تم مسح البيانات المحفوظة من المتصفح' : 'Cleared saved browser data');
    } catch (e) {}
  }

  // Initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function () {
    setupPortfolioNavigation();
    applyLanguage(currentLang);

    var toggleBtn = document.getElementById('lang-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function (e) {
        e.preventDefault();
        applyLanguage(currentLang === 'ar' ? 'en' : 'ar');
      });
    }
  });

  // Export public API
  window.DMApp = {
    getLanguage: function () { return currentLang; },
    setLanguage: applyLanguage,
    showToast: showToast,
    copyToClipboard: copyToClipboard,
    formatNumber: formatNumber,
    formatCurrency: formatCurrency,
    formatPercent: formatPercent,
    saveAppState: saveAppState,
    loadAppState: loadAppState,
    clearAppState: clearAppState,
    searchScore: searchScore
  };

})();
