(() => {
  'use strict';
  const form = document.getElementById('cp-form');
  if (!form) return;
  const locale = document.documentElement.lang === 'ar' ? 'ar' : 'en';
  const copy = locale === 'ar' ? {
    invalid: 'أدخل عددًا صحيحًا لصنّاع المحتوى، وأجرًا ثابتًا غير سالب، وسيناريوهات مشاهدات صالحة.',
    pair: 'أدخل معدل المكافأة والسقف معًا، أو اتركهما فارغين لإلغاء المكافأة.',
    order: 'رتّب المشاهدات من الأقل إلى الأعلى: المنخفض ثم التخطيطي ثم المرتفع.',
    scenario: ['منخفض', 'تخطيطي', 'مرتفع'],
    views: 'مشاهدة تقديرية لكل مشارك', payout: 'الإجمالي التقديري للحملة', base: 'الأجر الثابت والتكاليف الأخرى', bonus: 'إجمالي المكافآت المتغيرة', perCreator: 'التكلفة لكل مشارك', ecpm: 'التكلفة لكل 1,000 مشاهدة تقديرية',
    note: 'كل قيمة هنا تعتمد على المدخلات التي أدخلتها. استخدم مشاهدات مؤهلة ومصدر قياس متفقًا عليه عند تسوية المكافأة؛ لا تمثل هذه الأرقام سعرًا سوقيًا أو توقعًا للأداء.', copied: 'تم نسخ الملخص.', failed: 'تعذر النسخ تلقائيًا؛ يمكنك تحديد النتائج ونسخها.'
  } : {
    invalid: 'Enter a whole creator count, a non-negative fixed fee, and valid view scenarios.',
    pair: 'Enter both a bonus rate and cap, or leave both blank to omit the bonus.',
    order: 'Order view scenarios from low to high: low, planning, then high.',
    scenario: ['Low', 'Planning', 'High'],
    views: 'estimated views per creator', payout: 'estimated campaign total', base: 'fixed fees and other costs', bonus: 'total variable bonuses', perCreator: 'cost per creator', ecpm: 'cost per 1,000 estimated views',
    note: 'Every value depends on the inputs you supplied. Use eligible views and an agreed measurement source when settling any bonus; these figures are not market rates or performance forecasts.', copied: 'Summary copied.', failed: 'Could not copy automatically; select and copy the results.'
  };
  const el = (id) => document.getElementById(id);
  const number = (id, optional = false) => {
    const raw = el(id).value.trim();
    if (!raw && optional) return null;
    if (!raw) return NaN;
    const value = Number(raw);
    return Number.isFinite(value) ? value : NaN;
  };
  const money = (value, currency) => new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
  const formatNumber = (value) => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
  const calculate = (views, count, fixed, extra, rate, floor, cap) => {
    const eligible = Math.max(0, views - floor);
    const bonusPerCreator = rate === null ? 0 : Math.min(cap, (eligible / 1000) * rate);
    const perCreator = fixed + extra + bonusPerCreator;
    const total = perCreator * count;
    return { eligibleTotal: eligible * count, bonusTotal: bonusPerCreator * count, perCreator, total, effectiveCpm: views > 0 ? total / ((views * count) / 1000) : null };
  };
  const esc = (text) => String(text);
  const render = (event) => {
    event.preventDefault();
    el('cp-error').textContent = '';
    const count = number('cp-count');
    const fixed = number('cp-fixed');
    const extra = number('cp-extra', true) ?? 0;
    const rate = number('cp-rate', true);
    const cap = number('cp-cap', true);
    const floor = number('cp-floor', true) ?? 0;
    const views = [number('cp-low'), number('cp-mid'), number('cp-high')];
    const max = Number.MAX_SAFE_INTEGER;
    const validCore = Number.isSafeInteger(count) && count > 0 && Number.isFinite(fixed) && fixed >= 0 && fixed <= max && Number.isFinite(extra) && extra >= 0 && extra <= max && Number.isFinite(floor) && floor >= 0 && floor <= max && views.every((v) => Number.isFinite(v) && v >= 0 && v <= max);
    if (!validCore) { el('cp-error').textContent = copy.invalid; return; }
    const hasRate = rate !== null;
    const hasCap = cap !== null;
    if (hasRate !== hasCap || (hasRate && (rate < 0 || cap < 0 || rate > max || cap > max))) { el('cp-error').textContent = copy.pair; return; }
    if (!(views[0] <= views[1] && views[1] <= views[2])) { el('cp-error').textContent = copy.order; return; }
    const currency = el('cp-currency').value;
    const scenarios = views.map((v, i) => ({ label: copy.scenario[i], views: v, result: calculate(v, count, fixed, extra, hasRate ? rate : null, floor, hasRate ? cap : 0) }));
    const cards = scenarios.map(({ label, views: v, result }) => `<article class="cp-result-card"><h3>${esc(label)}</h3><p class="cp-views">${formatNumber(v)} ${copy.views}</p><p class="cp-total-label">${copy.payout}</p><p class="cp-total">${money(result.total, currency)}</p><dl class="cp-breakdown"><dt>${copy.perCreator}</dt><dd>${money(result.perCreator, currency)}</dd><dt>${copy.base}</dt><dd>${money((fixed + extra) * count, currency)}</dd><dt>${copy.bonus}</dt><dd>${money(result.bonusTotal, currency)}</dd><dt>${copy.ecpm}</dt><dd>${result.effectiveCpm === null ? '—' : money(result.effectiveCpm, currency)}</dd></dl></article>`).join('');
    el('cp-result-grid').innerHTML = cards;
    el('cp-result-note').textContent = copy.note;
    el('cp-copy-status').textContent = '';
    el('cp-results').hidden = false;
    el('cp-results').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    el('cp-copy').dataset.summary = scenarios.map(({ label, views: v, result }) => `${label}: ${formatNumber(v)} views; ${copy.payout}: ${money(result.total, currency)}; ${copy.bonus}: ${money(result.bonusTotal, currency)}`).join('\n');
  };
  form.addEventListener('submit', render);
  form.addEventListener('reset', () => { el('cp-error').textContent = ''; el('cp-results').hidden = true; el('cp-copy-status').textContent = ''; });
  el('cp-copy').addEventListener('click', async () => {
    const summary = el('cp-copy').dataset.summary || '';
    try { await navigator.clipboard.writeText(summary); el('cp-copy-status').textContent = copy.copied; }
    catch { el('cp-copy-status').textContent = copy.failed; }
  });
})();
