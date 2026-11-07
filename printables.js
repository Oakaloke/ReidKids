/* Progressive enhancement: every PDF also has a plain link in All Genesis downloads. */
(function () {
  'use strict';
  var choices = document.querySelectorAll('.design-option');
  var front = document.getElementById('preview-front');
  var back = document.getElementById('preview-back');
  var download = document.getElementById('selected-download');
  if (!front || !back || !download) return;
  choices.forEach(function (choice) {
    choice.addEventListener('click', function () {
      var theme = choice.dataset.theme;
      var title = choice.dataset.title;
      choices.forEach(function (button) { button.setAttribute('aria-pressed', String(button === choice)); });
      front.src = 'printables/genesis/' + theme + '-front.png';
      front.alt = title + ' design, Genesis 1:1 reference front';
      back.src = 'printables/genesis/' + theme + '-back.png';
      back.alt = title + ' design, Genesis 1:1 verse back: In the beginning, God created the heavens and the earth.';
      document.getElementById('selected-title').textContent = title;
      document.getElementById('selected-description').textContent = choice.dataset.description;
      download.href = 'printables/genesis/' + choice.dataset.pdf;
      download.textContent = 'Download ' + title + ' PDF ↓';
      document.getElementById('design-status').textContent = title + ' selected. Preview and download updated.';
    });
  });
}());
