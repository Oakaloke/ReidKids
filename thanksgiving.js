/* Thanksgiving decorative frame, separate from page content. */
(() => {
  document.documentElement.classList.add('thanksgiving-season');
  if (document.querySelector('.thanksgiving-frame')) return;
  const frame = document.createElement('div');
  frame.className = 'thanksgiving-frame';
  frame.setAttribute('aria-hidden', 'true');
  frame.innerHTML = '<div class="thanksgiving-frame__corner thanksgiving-frame__corner--tl">🍁</div><div class="thanksgiving-frame__corner thanksgiving-frame__corner--tr">🍂</div><div class="thanksgiving-frame__rail thanksgiving-frame__rail--left"><span>🍁</span><span>🍂</span><span>🎃</span><span>🦃</span><span>🍁</span></div><div class="thanksgiving-frame__rail thanksgiving-frame__rail--right"><span>🍂</span><span>🍁</span><span>🦃</span><span>🎃</span><span>🍂</span></div>';
  document.body.appendChild(frame);
})();
