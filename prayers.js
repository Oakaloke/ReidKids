/* Native details work without JavaScript; enhancement preserves shared links. */
(() => {
  const entries = [...document.querySelectorAll('.prayer-entry')];
  const library = document.querySelector('.prayer-library');
  function openHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    const target = id && document.getElementById(id);
    const entry = target && target.closest('.prayer-entry');
    if (entry) {
      entries.forEach(item => { item.open = item === entry; });
      requestAnimationFrame(() => entry.scrollIntoView({block: 'start'}));
    } else if (!id || id === 'prayer-library') {
      entries.forEach(item => { item.open = false; });
    }
  }
  entries.forEach(entry => {
    const summary = entry.querySelector('summary');
    entry.addEventListener('toggle', () => {
      if (!entry.open) return;
      entries.forEach(other => { if (other !== entry) other.open = false; });
    });
    summary.addEventListener('click', () => {
      if (!entry.open) history.replaceState(null, '', '#' + entry.querySelector('article').id);
      else history.replaceState(null, '', '#prayer-library');
    });
    const back = entry.querySelector('.prayer-back');
    back.hidden = false;
    back.addEventListener('click', () => {
      entry.open = false;
      history.replaceState(null, '', '#prayer-library');
      summary.focus({preventScroll: true});
      library.scrollIntoView({block: 'start'});
    });
  });
  window.addEventListener('hashchange', openHash);
  window.addEventListener('popstate', openHash);
  openHash();
})();
