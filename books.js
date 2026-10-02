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
     ageRange    – e.g. "Ages 3–7"
     description – one or two friendly sentences
     amazon      – full Amazon link (use "#" until the book is live)
     stores      – optional extra buy links: [{ "label": "Barnes & Noble", "url": "https://..." }]
                   leave as [] if there are none
     featured    – true to show it in the homepage preview, false to hide it there
   ========================================================= */

window.REIDKIDS_BOOKS = [
  {
    title: "The Lion of Judah",
    subtitle: "A Christian Coloring Book for Little Hearts",
    cover: "images/books/lion-of-judah.svg",
    ageRange: "Ages 3–7",
    description:
      "Color your way through the wonder of God's Word with gentle, faith-filled pictures that help little hands and hearts celebrate Jesus, the Lion of Judah.",
    amazon: "#",
    stores: [],
    featured: true
  }
];
