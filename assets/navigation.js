/* Native details handles the library popover; this closes menus on outside click or Escape. */
const primaryNav = document.querySelector('.nav');
const primaryNavToggle = document.querySelector('.nav-mobile-toggle');

document.addEventListener('click', event => {
  document.querySelectorAll('.nav-library-menu[open]').forEach(menu => {
    if (!menu.contains(event.target)) menu.open = false;
  });
  if (primaryNav?.classList.contains('is-open') && !primaryNav.contains(event.target)) {
    primaryNav.classList.remove('is-open');
    primaryNavToggle?.setAttribute('aria-expanded', 'false');
  }
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const openMenu = document.querySelector('.nav-library-menu[open]');
  if (!openMenu) return;
  openMenu.open = false;
  openMenu.querySelector('summary')?.focus();
  event.preventDefault();
  event.stopImmediatePropagation();
}, true);
