/* A removable Thanksgiving welcome. Decorative artwork never covers controls. */
(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  if (!header || document.getElementById('thanksgiving-welcome')) return;
  const welcome = document.createElement('section');
  welcome.id = 'thanksgiving-welcome';
  welcome.className = 'thanksgiving-welcome';
  welcome.setAttribute('aria-label', 'Thanksgiving welcome');
  welcome.innerHTML = `
    <div class="thanksgiving-leaves" aria-hidden="true">🍂 &nbsp; 🍁 &nbsp; 🍂 &nbsp; 🍁 &nbsp; 🍂 &nbsp; 🍁 &nbsp; 🍂</div>
    <div class="thanksgiving-welcome__inner">
      <img class="thanksgiving-turkey" src="assets/thanksgiving-turkey.svg" width="240" height="220" alt="" aria-hidden="true">
      <div class="thanksgiving-welcome__message">
        <p class="thanksgiving-welcome__eyebrow">Grateful hearts, happy little harvests</p>
        <p class="thanksgiving-welcome__title">Happy Thanksgiving!</p>
        <p class="thanksgiving-welcome__text">Giving thanks to God for family, love, and you.</p>
      </div>
      <img class="thanksgiving-turkey thanksgiving-turkey--right" src="assets/thanksgiving-turkey.svg" width="240" height="220" alt="" aria-hidden="true">
    </div>`;
  header.after(welcome);
  document.documentElement.classList.add('thanksgiving-season');
})();
