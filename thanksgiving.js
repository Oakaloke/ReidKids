/* Legacy entry point retained so existing pages need no HTML changes.
   Annual dates are inclusive and always use America/New_York, not device time. */
(function () {
  'use strict';
  const TIME_ZONE = 'America/New_York';
  // First matching range wins. Add future seasons here with their CSS/artwork.
  const CALENDAR = Object.freeze([
    { id: 'new-year', start: '01-01', end: '01-07' },
    { id: 'st-patricks', start: '03-10', end: '03-17' },
    { id: 'thanksgiving', start: '11-01', end: '11-30' },
    { id: 'christmas', start: '12-01', end: '12-31' }
  ].map(Object.freeze));
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE, month: '2-digit', day: '2-digit'
  });
  function seasonForDate(date = new Date()) {
    const parts = formatter.formatToParts(date);
    const day = parts.find(p => p.type === 'month').value + '-' +
      parts.find(p => p.type === 'day').value;
    return CALENDAR.find(({ start, end }) => start <= end
      ? day >= start && day <= end : day >= start || day <= end)?.id || 'default';
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TIME_ZONE, CALENDAR, seasonForDate };
    return;
  }
  // Preview only on loopback: never a public override, cookie or saved preference.
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const requested = local && new URLSearchParams(location.search).get('season-preview');
  const preview = requested === 'default' || CALENDAR.some(s => s.id === requested)
    ? requested : null;
  const root = document.documentElement;
  let current;
  let timer;
  function update() {
    const season = preview || seasonForDate();
    if (season === current) return;
    root.classList.remove('thanksgiving-season', 'holiday-season',
      ...CALENDAR.map(s => 'season-' + s.id));
    document.querySelectorAll('.thanksgiving-frame, .holiday-frame').forEach(el => el.remove());
    if (season !== 'default') {
      const frame = document.createElement('div');
      frame.setAttribute('aria-hidden', 'true');
      if (season === 'thanksgiving') {
        // Preserve the approved November DOM and styling exactly.
        root.classList.add('thanksgiving-season');
        frame.className = 'thanksgiving-frame';
      } else {
        root.classList.add('holiday-season', 'season-' + season);
        frame.className = 'holiday-frame';
      }
      document.body.appendChild(frame);
    }
    current = season;
  }
  function refresh() {
    clearTimeout(timer);
    update();
    // Eastern midnight is a minute boundary. Align checks to it even on open tabs.
    // Visibility/pageshow also catch up after a device sleeps or restores a page.
    timer = setTimeout(refresh, 60000 - (Date.now() % 60000));
  }
  refresh();
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('pageshow', refresh);
})();
