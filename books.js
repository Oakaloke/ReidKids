/* =========================================================
   Reid Kids — Coloring Books data
   =========================================================

   HOW TO ADD A NEW COLORING BOOK
   ------------------------------
   1. Add your cover image to the  images/books/  folder
      (a tall "portrait" image works best, e.g. 600 x 800).
   2. Copy one { ... } block below, paste it inside the [ ] list,
      and fill in your book's details. Separate each block with a comma.
   3. Save the file. The Coloring Books page and the homepage
      preview update automatically — no other changes needed.

   Fields for each book:
     title       – the book's name (required)
     subtitle    – a short line under the title (optional, use "" to skip)
     cover       – path to the cover image, e.g. "images/books/my-book.png"
     alt         – alt text describing the cover image (for screen readers)
     ageRange    – e.g. "Ages 3–7"
     description – one or two friendly sentences
     amazon      – full Amazon link. Leave as "#" until the book is live:
                   the buy button then shows "Coming soon to Amazon" (disabled).
                   A real link shows "Buy on Amazon" and opens in a new tab.
     stores      – optional extra buy links: [{ "label": "Barnes & Noble", "url": "https://..." }]
                   leave as [] if there are none
     featured    – true to show it in the homepage preview, false to hide it there
   ========================================================= */

window.REIDKIDS_BOOKS = [
  {
    title: "The Lion of Judah",
    subtitle: "A Christian Coloring Book for Little Hearts",
    cover: "images/books/lion-of-judah.svg",
    alt: "Cover of The Lion of Judah coloring book",
    ageRange: "Ages 3–7",
    description:
      "A gentle coloring book for little ones that celebrates Jesus, the Lion of Judah, one page at a time.",
    amazon: "#",
    stores: [],
    featured: true
  }
];
