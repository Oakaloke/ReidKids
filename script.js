/* =========================================================
   Reid Kids — script.js
   Current year · scroll reveal · signup · coloring-book cards
   ========================================================= */
(function () {
  "use strict";

  /* ---- Current year in footer(s) ---- */
  var year = new Date().getFullYear();
  document.querySelectorAll("#year, .js-year").forEach(function (el) {
    el.textContent = year;
  });

  /* ---- Scroll reveal ---- */
  function watch(el) {
    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      obs.observe(el);
    } else {
      el.classList.add("is-visible");
    }
  }
  document.querySelectorAll(".reveal").forEach(watch);

  /* ---- Coming Soon signup ---- */
  var form = document.getElementById("signup");
  var note = document.getElementById("signup-note");
  if (form && note) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("email");
      var value = (input.value || "").trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!valid) {
        note.style.color = "#ffd0d0";
        note.textContent = "Please enter a valid email address.";
        input.focus();
        return;
      }
      note.style.color = "";
      note.textContent = "Thank you! We'll let you know when Reid Kids launches. 💛";
      form.reset();
    });
  }

  /* ---- Coloring books (homepage preview + full page) ---- */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function bookCard(book) {
    var card = el("article", "cbook reveal");

    var img = el("img", "cbook__cover");
    img.src = book.cover || "images/books/placeholder.svg";
    img.alt = "Cover of " + (book.title || "coloring book");
    img.loading = "lazy";
    card.appendChild(img);

    var body = el("div", "cbook__body");
    body.appendChild(el("h3", "cbook__title", book.title || "Untitled"));
    if (book.subtitle) body.appendChild(el("p", "cbook__subtitle", book.subtitle));
    if (book.ageRange) body.appendChild(el("span", "tag cbook__age", book.ageRange));
    if (book.description) body.appendChild(el("p", "cbook__desc", book.description));

    var actions = el("div", "cbook__actions");
    var buy = el("a", "btn btn--primary cbook__buy", "Buy on Amazon");
    buy.href = book.amazon || "#";
    buy.target = "_blank";
    buy.rel = "noopener noreferrer";
    actions.appendChild(buy);

    if (book.stores && book.stores.length) {
      var stores = el("div", "cbook__stores");
      book.stores.forEach(function (s) {
        if (!s || !s.label) return;
        var link = el("a", null, s.label);
        link.href = s.url || "#";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        stores.appendChild(link);
      });
      actions.appendChild(stores);
    }

    body.appendChild(actions);
    card.appendChild(body);
    watch(card);
    return card;
  }

  function renderBooks(grid, books, emptyEl) {
    if (!books.length) {
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    books.forEach(function (book) { grid.appendChild(bookCard(book)); });
  }

  var allBooks = window.REIDKIDS_BOOKS || [];

  var fullGrid = document.getElementById("cbooks-grid");
  if (fullGrid) {
    renderBooks(fullGrid, allBooks, document.getElementById("cbooks-empty"));
  }

  /* ---- Featured coloring book (homepage) ---- */
  var featuredBox = document.getElementById("cbook-featured");
  if (featuredBox) {
    var featured = allBooks.filter(function (b) { return b.featured; });
    if (!featured.length) featured = allBooks.slice(0, 1);
    var book = featured[0];
    if (!book) {
      featuredBox.innerHTML = '<p class="books-note">New coloring books are on the way — launching 2026.</p>';
    } else {
      var media = el("div", "featured__media");
      var img = el("img", "featured__cover");
      img.src = book.cover || "images/books/placeholder.svg";
      img.alt = "Cover of " + (book.title || "coloring book");
      img.loading = "lazy";
      media.appendChild(el("span", "featured__badge", "New"));
      media.appendChild(img);

      var body = el("div", "featured__body");
      body.appendChild(el("h3", "featured__title", book.title || "Untitled"));
      if (book.subtitle) body.appendChild(el("p", "featured__subtitle", book.subtitle));
      if (book.ageRange) body.appendChild(el("span", "tag cbook__age", book.ageRange));
      if (book.description) body.appendChild(el("p", "featured__desc", book.description));

      var actions = el("div", "featured__actions");
      var buy = el("a", "btn btn--primary", "Buy on Amazon");
      buy.href = book.amazon || "#";
      buy.target = "_blank";
      buy.rel = "noopener noreferrer";
      actions.appendChild(buy);
      var more = el("a", "btn btn--outline", "All coloring books");
      more.href = "coloring.html";
      actions.appendChild(more);
      body.appendChild(actions);

      featuredBox.appendChild(media);
      featuredBox.appendChild(body);
    }
  }
})();
