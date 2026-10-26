(() => {
  const input = document.querySelector("#labs-search");
  const filterButtons = [...document.querySelectorAll(".lab-filter")];
  const rows = [...document.querySelectorAll(".lab-row")];
  const visibleCount = document.querySelector("#labs-visible-count");
  const emptyMessage = document.querySelector(".labs-empty");
  const dialog = document.querySelector("#lab-detail-dialog");
  const dialogTitle = document.querySelector("#lab-dialog-title");
  const dialogTags = document.querySelector("#lab-dialog-tags");
  const dialogClose = document.querySelector(".lab-dialog-close");
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

  if (!dialog || !dialogTitle || !dialogTags || !dialogClose) return;

  const rowForHash = () => rows.find((row) => row.id === decodeURIComponent(location.hash.slice(1)));
  const openRow = (row) => {
    dialogTitle.textContent = row.querySelector(".lab-title").textContent.trim();
    dialogTags.replaceChildren(...[...row.querySelectorAll(".lab-tag")].map((tag) => tag.cloneNode(true)));
    if (!dialog.open) dialog.showModal();
  };
  const syncDialogToHash = () => {
    const row = rowForHash();
    if (row) openRow(row);
    else if (dialog.open) dialog.close();
  };

  rows.forEach((row) => {
    const link = row.querySelector(".lab-open");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      if (location.hash !== `#${row.id}`) history.pushState(null, "", `#${row.id}`);
      openRow(row);
    });
  });

  dialogClose.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (rowForHash()) history.replaceState(null, "", `${location.pathname}${location.search}`);
  });
  window.addEventListener("popstate", syncDialogToHash);
  syncDialogToHash();
})();
