(() => {
  const input = document.querySelector("#labs-search");
  const filterButtons = [...document.querySelectorAll(".lab-filter")];
  const rows = [...document.querySelectorAll(".lab-row")];
  const visibleCount = document.querySelector("#labs-visible-count");
  const emptyMessage = document.querySelector(".labs-empty");
  if (!input || !filterButtons.length || !rows.length || !visibleCount || !emptyMessage) return;

  let selectedArea = "all";
  const update = () => {
    const query = input.value.trim().toLocaleLowerCase();
    let visible = 0;
    rows.forEach((row) => {
      const matchesArea = selectedArea === "all" || row.dataset.channels.split(" ").includes(selectedArea);
      const matchesText = !query || row.dataset.search.includes(query);
      const show = matchesArea && matchesText;
      row.hidden = !show;
      if (show) visible += 1;
    });
    visibleCount.textContent = String(visible);
    emptyMessage.hidden = visible !== 0;
  };

  input.addEventListener("input", update);
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedArea = button.dataset.filter;
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      update();
    });
  });
})();
