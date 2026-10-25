(() => {
  const input = document.querySelector('#directory-search');
  const entries = [...document.querySelectorAll('.directory-entry')];
  const entryGrid = entries[0]?.parentElement;
  const buttons = [...document.querySelectorAll('.directory-filter')];
  const examples = [...document.querySelectorAll('[data-search-example]')];
  const count = document.querySelector('#directory-result-count');
  const empty = document.querySelector('.directory-empty');
  const language = document.documentElement.lang === 'ar' ? 'ar' : 'en';
  const search = window.AssistantSearch;
  let selected = '';

  function update() {
    const query = search?.normalize(input?.value || '') || (input?.value || '').trim().toLocaleLowerCase();
    const ranked = [];
    entries.forEach((entry, index) => {
      const relevance = query ? (search?.score(query, entry.dataset.search || '') || 0) : 0;
      const visible = (!selected || entry.dataset.category === selected) && (!query || relevance > 0);
      entry.hidden = !visible;
      if (visible) ranked.push({ entry, index, relevance });
    });

    if (query) ranked.sort((a, b) => b.relevance - a.relevance || a.index - b.index);
    // The list is a CSS Grid, so CSS `order` has no effect on ranking.
    if (entryGrid) {
      const ordered = query
        ? [...ranked.map(item => item.entry), ...entries.filter(entry => !ranked.some(item => item.entry === entry))]
        : entries;
      const fragment = document.createDocumentFragment();
      ordered.forEach(entry => fragment.append(entry));
      entryGrid.append(fragment);
    }

    if (count) count.textContent = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en').format(ranked.length);
    if (empty) empty.hidden = ranked.length !== 0;
  }

  buttons.forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.filter || '';
    for (const item of buttons) {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    }
    update();
  }));
  input?.addEventListener('input', update);
  examples.forEach(button => button.addEventListener('click', () => {
    if (!input) return;
    input.value = button.dataset.searchExample || '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
  }));

  const initialQuery = new URLSearchParams(window.location.search).get('q');
  if (input && initialQuery) input.value = initialQuery;
  update();
})();
