/* Progressive enhancement. Every collection, PDF, and guide exists in the HTML. */
(function () {
  'use strict';
  var sections = Array.from(document.querySelectorAll('[data-collection]'));
  var links = Array.from(document.querySelectorAll('[data-select-collection]'));
  if (!sections.length || !links.length) return;
  var selected = sections[0];

  function selectCollection(section, announce) {
    selected = section;
    sections.forEach(function (item) { item.hidden = item !== section; });
    links.forEach(function (link) {
      if (link.dataset.selectCollection === section.id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    if (announce) {
      var link = links.find(function (item) { return item.dataset.selectCollection === section.id; });
      document.getElementById('collection-status').textContent = link.querySelector('span').textContent + ' selected. Choose a design below.';
    }
  }

  function followHash(announce) {
    var hash;
    try { hash = decodeURIComponent(window.location.hash.slice(1)); } catch (_) { return; }
    // Unknown and general-purpose anchors retain the current collection.
    var target = document.getElementById(hash);
    var section = target && target.closest('[data-collection]');
    if (!hash) section = sections[0];
    if (section) {
      selectCollection(section, announce);
      if (hash && announce) target.scrollIntoView({ block: 'start' });
    }
  }

  sections.forEach(function (section) {
    var choices = Array.from(section.querySelectorAll('.design-option'));
    choices.forEach(function (choice) {
      choice.addEventListener('click', function () {
        choices.forEach(function (button) { button.setAttribute('aria-pressed', String(button === choice)); });
        var front = section.querySelector('.preview-front');
        var back = section.querySelector('.preview-back');
        front.src = choice.dataset.front;
        front.alt = choice.dataset.frontAlt;
        back.src = choice.dataset.back;
        back.alt = choice.dataset.backAlt;
        section.querySelector('.selected-title').textContent = choice.dataset.title;
        section.querySelector('.selected-description').textContent = choice.dataset.description;
        var download = section.querySelector('.selected-download');
        download.href = choice.dataset.pdf;
        download.textContent = 'Download ' + choice.dataset.title + ' PDF ↓';
        section.querySelector('.download-filename').textContent = choice.dataset.pdf.split('/').pop();
        section.querySelector('.design-status').textContent = choice.dataset.title + ' selected. Preview and download updated.';
      });
    });
  });
  document.documentElement.classList.add('printables-enhanced');
  selectCollection(selected, false);
  followHash(false);
  window.addEventListener('hashchange', function () { followHash(true); });
}());
