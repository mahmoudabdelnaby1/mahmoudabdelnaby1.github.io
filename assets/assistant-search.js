(() => {
  const normalize = value => (value || '')
    .toLocaleLowerCase()
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    // Normalize a common informal spelling without collapsing real Arabic
    // doubled letters or prefixes such as the lam in "للسوشيال".
    .replace(/هو{2,}ك/g, 'هوك')
    .replace(/[’‘`]/g, "'")
    .replace(/[^\p{L}\p{N}+#.\s'-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const stop = new Set((
    'i me my we you your our a an the to for of on in and with please help need want make write create give find show get can could would something about from ad ads advertisement advertising content plan purchase purchases buy ' +
    'عايز عاوزه عاوز محتاج محتاجة اريد اعمل اعملي اكتب اكتبلي لي لنا انا عندي مشكلة مشكلتي في من عن على اي حاجة شيء شي ابغى ابي لو سمحت ممكن عايزلي اعلان اعلانات خطة محتوي الشراء مشتريات المشتريات'
  ).split(/\s+/).map(normalize));

  const intents = [
    { keys: ['hook', 'hooks', 'headline', 'opening line', 'ad hook', 'هوك', 'افتتاحية', 'بداية الاعلان', 'خطاف'], terms: ['hook', 'headline', 'opening line', 'opening hook', 'هوك', 'افتتاح', 'خطاف'] },
    { keys: ['conversion', 'checkout', 'cart', 'sales are low', 'low sales', 'تحويل', 'مبيعات', 'السلة', 'الدفع'], terms: ['conversion rate', 'checkout', 'cro', 'funnel', 'cart abandonment', 'cart', 'تحويل', 'السلة', 'الدفع', 'مبيعات'] },
    { keys: ['social media', 'content plan', 'content calendar', 'post ideas', 'social posts', 'السوشيال', 'تقويم محتوى', 'افكار محتوى', 'منشورات'], terms: ['social media', 'content calendar', 'social content', 'content plan', 'content strategy', 'سوشيال', 'تقويم محتوى', 'محتوي اجتماعي'] },
    { keys: ['seo', 'google ranking', 'search visibility', 'ai search', 'ظهور في جوجل', 'محركات البحث', 'السيو'], terms: ['seo', 'search visibility', 'search engine', 'keyword', 'serp', 'aeo', 'geo', 'محركات البحث', 'السيو', 'كلمات مفتاحية'] },
    { keys: ['purchase tracking', 'track purchases', 'tracking', 'analytics', 'pixel', 'conversion api', 'capi', 'قياس', 'تتبع', 'البيانات', 'التحليلات', 'بيكسل', 'الشراء لا يسجل', 'الشراء بيتسجل', 'المشتريات مش بتتسجل', 'تسجيل الشراء'], terms: ['tracking', 'event tracking', 'purchase event', 'pixel', 'gtm', 'capi', 'measurement', 'تتبع', 'قياس', 'بيكسل'] },
    { keys: ['email', 'crm', 'whatsapp', 'follow up', 'رسالة واتساب', 'واتساب', 'بريد الكتروني', 'متابعة العملاء'], terms: ['email', 'crm', 'whatsapp', 'lifecycle', 'automation', 'follow-up', 'رسائل', 'واتساب', 'بريد', 'عملاء'] },
    { keys: ['campaign', 'campaign plan', 'media plan', 'paid media', 'حملة', 'خطة اعلانية', 'الحملات الاعلانية'], terms: ['campaign', 'media plan', 'media buying', 'paid media', 'ad campaign', 'حملة', 'خطة اعلانية'] },
    { keys: ['product description', 'product page', 'product listing', 'وصف منتج', 'صفحة منتج', 'المنتج'], terms: ['product description', 'product page', 'product listing', 'e-commerce', 'commerce', 'وصف المنتج', 'صفحة المنتج', 'متجر'] },
    { keys: ['brand strategy', 'positioning', 'brand voice', 'هوية العلامة', 'تموضع', 'صوت العلامة'], terms: ['brand strategy', 'positioning', 'brand voice', 'messaging', 'branding', 'العلامة التجارية', 'تموضع', 'هوية'] },
    { keys: ['research', 'competitor', 'market analysis', 'بحث السوق', 'المنافسين', 'تحليل السوق'], terms: ['research', 'competitor', 'market analysis', 'researcher', 'benchmark', 'بحث', 'منافس', 'السوق', 'تحليل'] },
    { keys: ['cv', 'resume', 'linkedin profile', 'سيرة ذاتية', 'السي في', 'لينكدان', 'لينكد ان'], terms: ['resume', 'cv', 'linkedin', 'career', 'job search', 'سيرة ذاتية', 'لينكدان', 'وظيفة'] },
    { keys: ['image', 'visual', 'logo', 'design', 'صورة', 'تصميم', 'شعار'], terms: ['image', 'visual', 'design', 'illustration', 'logo', 'midjourney', 'صورة', 'تصميم', 'شعار', 'رسم'] },
    { keys: ['video', 'reel', 'script', 'فيديو', 'ريلز', 'سيناريو', 'سكريبت'], terms: ['video', 'reel', 'script', 'storyboard', 'tiktok', 'youtube', 'فيديو', 'ريلز', 'سيناريو'] },
    { keys: ['prompt', 'generative ai', 'ذكاء اصطناعي', 'برومبت', 'موجه', 'مساعد ذكاء'], terms: ['prompt', 'generative ai', 'ai assistant', 'llm', 'chatbot', 'ذكاء اصطناعي', 'برومبت', 'موجه'] },
    { keys: ['pricing', 'profit', 'unit economics', 'سعر', 'تسعير', 'ربحية', 'هامش الربح', 'تكلفة المنتج'], terms: ['pricing', 'profit', 'unit economics', 'margin', 'cost', 'economics', 'تسعير', 'ربح', 'هامش', 'تكلفة'] },
    { keys: ['localize', 'translation', 'dialect', 'لهجة', 'ترجمة', 'توطين', 'مصري', 'خليجي'], terms: ['localizer', 'localization', 'translation', 'dialect', 'arabic', 'لهجة', 'ترجمة', 'توطين', 'مصري', 'خليجي'] },
    { keys: ['website', 'landing page', 'store', 'موقع', 'صفحة هبوط', 'متجر الكتروني'], terms: ['website', 'landing page', 'e-commerce', 'storefront', 'shopify', 'wordpress', 'موقع', 'صفحة هبوط', 'متجر'] },
    { keys: ['teach me', 'learn', 'study', 'explain', 'علمني', 'شرح', 'اتعلم', 'مذاكرة', 'تعليم'], terms: ['tutor', 'learning', 'study', 'education', 'explain', 'teacher', 'تعليم', 'شرح', 'تعلم', 'دراسة'] },
    { keys: ['code', 'coding', 'debug', 'bug', 'programming', 'كود', 'برمجة', 'خطأ في الموقع', 'مشكلة تقنية'], terms: ['code', 'coding', 'debug', 'developer', 'programming', 'software', 'برمجة', 'كود', 'تقنية', 'خطأ'] },
    { keys: ['data analysis', 'spreadsheet', 'dashboard', 'تحليل بيانات', 'جدول بيانات', 'لوحة بيانات'], terms: ['data analysis', 'analytics', 'spreadsheet', 'dashboard', 'excel', 'تحليل بيانات', 'بيانات', 'إحصاء'] }
  ].map(item => ({ keys: item.keys.map(normalize), terms: item.terms.map(normalize) }));

  function hasTerm(text, term) {
    if (!term) return false;
    if (term.includes(' ')) return text.includes(term);
    if (/[\u0600-\u06FF]/.test(term)) {
      const foldAttachedArticle = value => value.replace(/(^|\s)لل(?=[\u0600-\u06FF])/g, '$1ال');
      return text.includes(term) || foldAttachedArticle(text).includes(term) || text.includes(foldAttachedArticle(term));
    }
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}(?:s|es|ed|ing)?(?=$|[^\\p{L}\\p{N}])`, 'u').test(text);
  }

  function score(queryValue, searchableValue) {
    const query = normalize(queryValue);
    if (!query) return 0;
    const text = normalize(searchableValue);
    let points = text.includes(query) ? 100 : 0;
    const tokens = query.split(' ').filter(token => token.length > 1 && !stop.has(token));
    const matchedIntents = intents.filter(intent => intent.keys.some(key => hasTerm(query, key)));
    let intentPoints = 0;
    for (const intent of matchedIntents) {
      const hits = intent.terms.filter(term => hasTerm(text, term));
      if (hits.length) intentPoints += Math.min(58, 30 + hits.length * 10);
    }
    for (const token of tokens) if (hasTerm(text, token)) points += 8;
    // Once a task intent is recognized, keep results anchored to assistants that
    // explicitly describe that task instead of matching incidental query words.
    if (matchedIntents.length && !intentPoints && !text.includes(query)) return 0;
    return points + intentPoints;
  }

  window.AssistantSearch = Object.freeze({ normalize, score });
})();
