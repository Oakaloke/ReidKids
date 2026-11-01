/* Noninteractive, screen-reader-hidden artwork around the page, not a banner. */
(() => {
  document.documentElement.classList.add('thanksgiving-season');
  if (document.querySelector('.thanksgiving-frame')) return;
  const frame = document.createElement('div');
  frame.className = 'thanksgiving-frame';
  frame.setAttribute('aria-hidden', 'true');
  document.body.appendChild(frame);
})();
