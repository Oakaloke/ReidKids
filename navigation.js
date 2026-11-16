/* Keep every destination available without crowding small screens. */
(() => {
  const nav = document.querySelector('.site-header .site-nav');
  if (!nav) return;
  nav.id = 'primary-navigation';
  const button = document.createElement('button');
  button.className = 'menu-toggle';
  button.type = 'button';
  button.setAttribute('aria-controls', nav.id);
  button.setAttribute('aria-expanded', 'false');
  button.textContent = 'Menu ☰';
  nav.before(button);
  nav.closest('.site-header').classList.add('navigation-ready');
  const close = () => { button.setAttribute('aria-expanded', 'false'); button.textContent = 'Menu ☰'; };
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    button.textContent = open ? 'Close ×' : 'Menu ☰';
  });
  nav.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') { close(); button.focus(); }
  });
  document.addEventListener('click', e => { if (!e.target.closest('.site-header')) close(); });
  window.addEventListener('pageshow', close);
})();
