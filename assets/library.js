(() => {
  const input = document.querySelector('#search');
  const category = document.querySelector('#category');
  const cards = [...document.querySelectorAll('.bot')];
  const cardGrid = cards[0]?.parentElement;
  const count = document.querySelector('#result-count');
  const filters = [...document.querySelectorAll('.task-filter')];
  const totalMark = document.querySelector('[data-assistant-total]');
  const emptyState = document.querySelector('[data-library-empty]');
  const emptyLink = emptyState?.querySelector('[data-full-directory-link]');
  const search = window.AssistantSearch;
  const isArabic = document.documentElement.lang === 'ar';
  const format = new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en');
  const library = document.querySelector('.library');
  const more = document.querySelector('#show-all');
  let selectedCategory = '';

  function syncTaskFilters(value = category?.value || '') {
    for (const filter of filters) {
      const active = (filter.dataset.categoryFilter || '') === value;
      filter.classList.toggle('is-active', active);
      filter.setAttribute('aria-pressed', String(active));
    }
  }

  function expandForSelection(value) {
    if (value && library && !library.classList.contains('expanded')) {
      library.classList.add('expanded');
      more?.setAttribute('aria-expanded', 'true');
      if (more?.firstChild) more.firstChild.textContent = more.dataset.close;
    }
  }

  function updateCounts() {
    if (totalMark) totalMark.textContent = format.format(cards.length);
    for (const filter of filters) {
      const selected = filter.dataset.categoryFilter || '';
      const total = cards.reduce((sum, card) => sum + (!selected || card.dataset.category === selected ? 1 : 0), 0);
      let badge = filter.querySelector('small');
      if (!badge) {
        badge = document.createElement('small');
        badge.setAttribute('aria-hidden', 'true');
        filter.append(badge);
      }
      badge.textContent = format.format(total);
    }
  }

  function update() {
    const rawQuery = input?.value.trim() || '';
    const query = search?.normalize(rawQuery) || rawQuery.toLocaleLowerCase();
    const selected = category?.value || selectedCategory;
    const ranked = [];

    cards.forEach((card, index) => {
      const relevance = query
        ? (search?.score(query, card.dataset.search || '') || 0)
        : 0;
      const matches = (!selected || card.dataset.category === selected) && (!query || relevance > 0);
      card.hidden = !matches;
      if (matches) ranked.push({ card, index, relevance });
    });

    if (query) ranked.sort((a, b) => b.relevance - a.relevance || a.index - b.index);
    // These cards use CSS Grid, where `order` does not change visual order.
    // Reinsert them in relevance order so the best matches actually appear first.
    if (cardGrid && query) {
      const matchingCards = new Set(ranked.map(item => item.card));
      const ordered = [...ranked.map(item => item.card), ...cards.filter(card => !matchingCards.has(card))];
      const fragment = document.createDocumentFragment();
      ordered.forEach(card => fragment.append(card));
      cardGrid.append(fragment);
    }

    const visible = ranked.length;
    if (count) {
      const label = isArabic
        ? (visible === 0 ? 'لا يوجد مساعدون' : visible === 1 ? 'مساعد واحد' : visible === 2 ? 'مساعدان' : visible <= 10 ? `${format.format(visible)} مساعدين` : `${format.format(visible)} مساعدًا`)
        : `${format.format(visible)} ${count.dataset.label || 'assistants'}`;
      count.textContent = `${label} ${count.dataset.after || ''}`.trim();
    }

    const showEmpty = Boolean(query && visible === 0);
    if (emptyState) emptyState.hidden = !showEmpty;
    if (emptyLink) {
      const directory = isArabic ? '/ar/assistants/library/' : '/assistants/library/';
      emptyLink.href = `${directory}?q=${encodeURIComponent(rawQuery)}`;
    }
  }

  updateCounts();
  update();
  syncTaskFilters();
  input?.addEventListener('input', () => {
    if (input.value.trim()) library?.classList.add('expanded');
    update();
  });
  category?.addEventListener('change', () => {
    selectedCategory = category.value;
    syncTaskFilters(selectedCategory);
    expandForSelection(selectedCategory);
    update();
  });
  filters.forEach(filter => filter.addEventListener('click', () => {
    selectedCategory = filter.dataset.categoryFilter || '';
    if (category) category.value = selectedCategory;
    syncTaskFilters(selectedCategory);
    expandForSelection(selectedCategory);
    update();
  }));
  document.querySelectorAll('[data-search-example]').forEach(button => button.addEventListener('click', () => {
    if (!input) return;
    input.value = button.dataset.searchExample || '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
  }));
  more?.addEventListener('click', () => {
    const expanded = library.classList.toggle('expanded');
    more.setAttribute('aria-expanded', String(expanded));
    if (more.firstChild) more.firstChild.textContent = expanded ? more.dataset.close : more.dataset.open;
  });

  document.querySelectorAll('[data-copy-target]').forEach(button => button.addEventListener('click', async () => {
    const target = document.querySelector(button.dataset.copyTarget);
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target.textContent);
      const oldText = button.textContent;
      button.textContent = button.dataset.done || 'Copied';
      setTimeout(() => { button.textContent = oldText; }, 1600);
    } catch {
      button.textContent = isArabic ? 'انسخ النص يدويًا' : 'Select and copy manually';
    }
  }));

  const revealElements = [...document.querySelectorAll('.hero,.detail-head,.bot')];
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(items => items.forEach(item => {
      if (!item.isIntersecting) return;
      item.target.classList.add('is-visible');
      observer.unobserve(item.target);
    }), { threshold: .08 });
    revealElements.forEach((element, index) => {
      element.classList.add('reveal');
      if (element.classList.contains('bot')) element.style.setProperty('--reveal-index', String(index % 9));
      observer.observe(element);
    });
  } else revealElements.forEach(element => element.classList.add('is-visible'));
})();
