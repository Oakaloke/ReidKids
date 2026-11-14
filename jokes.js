(() => {
  const button = document.getElementById('surprise');
  const cards = [...document.querySelectorAll('.joke-card')];
  if (!button || !cards.length) return;
  let previous = -1;
  button.hidden = false;
  button.addEventListener('click', () => {
    let next;
    do { next = Math.floor(Math.random() * cards.length); } while (next === previous && cards.length > 1);
    previous = next;
    const card = cards[next];
    card.open = false;
    card.querySelector('summary').focus({preventScroll: true});
    card.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center'});
  });
})();
