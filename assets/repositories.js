(() => {
  const search = document.querySelector('#repo-search');
  const category = document.querySelector('#repo-category');
  const cards = [...document.querySelectorAll('.repo-card')];
  const count = document.querySelector('#repo-count');
  const empty = document.querySelector('#repo-empty');
  if (!search || !category || !count || !empty) return;
  const shownLabel = document.documentElement.lang === 'ar' ? 'مشروعًا ظاهرًا' : 'projects shown';
  const update = () => {
    const query = search.value.trim().toLocaleLowerCase();
    const selected = category.value;
    let visible = 0;
    for (const card of cards) {
      const matchesQuery = !query || card.dataset.search.includes(query);
      const matchesCategory = selected === 'all' || card.dataset.category === selected;
      const show = matchesQuery && matchesCategory;
      card.hidden = !show;
      if (show) visible += 1;
    }
    count.textContent = `${visible} ${shownLabel}`;
    empty.hidden = visible > 0;
  };
  search.addEventListener('input', update);
  category.addEventListener('change', update);
  update();
})();
