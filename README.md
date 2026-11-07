# Reid Kids

A warm, faith-filled website for **Reid Kids** — a Christian children's & family brand
offering beautifully illustrated books, coloring books, and resources that help little
hearts grow in God's love.

🌐 **Live site:** [reidkids.com](https://reidkids.com)

## Brand colors
Defined once as CSS variables in `styles.css` and used everywhere:

| Variable | Color | Value |
|----------|-------|-------|
| `--rams-royal` | Rams Royal blue | `#003594` |
| `--rams-sol`   | Rams Sol yellow | `#FFD100` |
| `--white`      | White           | `#FFFFFF` |

The logo has a **white eagle**, so it always sits on a Rams Royal header/footer band.

## Pages & sections
- **Home** (`index.html`) — hero, shop links, About, newsletter, Contact
- **Coloring Books** (`coloring.html`) — grid of coloring books (data-driven, see below)
- **Worship** (`worship.html`) — "Worship for Little Ones" hymn list
- **Song** (`song.html`) — a single hymn page ("Jesus Loves Me", "O Store Gud")

## Tech
Plain static site — no build step.

| File | Purpose |
|------|---------|
| `index.html` | Home page |
| `coloring.html` | Coloring Books page |
| `worship.html` / `song.html` | Hymn list & single hymn |
| `styles.css` | Styling (Rams Royal, Sol & white; neutral grays; mobile-first) |
| `script.js` | Scroll reveal, signup, current year, coloring-book cards |
| `books.js` | Coloring-book data (edit this to add a book) |
| `worship.json` | Hymn data |
| `images/assets/` | Logo |
| `images/books/` | Coloring-book covers |
| `CNAME` | Custom domain for GitHub Pages |
| `.nojekyll` | Serve files as-is on GitHub Pages |

## How to add a coloring book
1. Drop the cover image into `images/books/` (portrait, e.g. 600 × 800).
2. Open **`books.js`** and copy an existing `{ ... }` block inside the list.
3. Fill in `title`, `subtitle`, `cover`, `ageRange`, `description`, `amazon` link,
   optional `stores`, and `featured` (true shows it on the homepage preview).
4. Save — the Coloring Books page and homepage preview update automatically.

## Deploy to GitHub Pages
1. Push to GitHub (`origin` → `main`).
2. **Settings → Pages** → Source: **Deploy from a branch**, Branch: **main** `/ (root)`.
3. Custom domain `reidkids.com` is already set via `CNAME`.
4. DNS for `reidkids.com` → GitHub Pages:
   - `A` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` for `www` → `<username>.github.io`
5. Enable **Enforce HTTPS** once the certificate is issued.

## Local preview
```bash
python3 -m http.server 8000
```
Then visit <http://localhost:8000>.

## Digital coloring studio

`/studio/` contains the 30 original Be Strong and Courageous pages, optimized from the supplied digital coloring package. The original source artwork is retained separately and unchanged. The studio is a static app, with fill, brush, nondestructive eraser, undo, PNG export, gallery and a numbered challenge based on larger enclosed spaces. The drawing page and maze use free drawing. Small or open regions can be finished in free color.

Color layers are stored per page in IndexedDB on the visitor's device only. There are no accounts, uploads, analytics or external services in the studio. Download PNG is the backup if browser storage is blocked or cleared.

Preview with `python3 -m http.server 8000` and open `/studio/`. Check all pages, number mode, wrong-color feedback, undo, reset cancel/accept, gallery navigation, rapid page changes, per-page persistence, PNG export and narrow touch layouts before publishing.

## Bible printables

`printables.html` is a progressively enhanced collection library. `printables/collections.json` lists only completed, reviewed collections. Each has eight complete WEB Classic verses in five color designs plus ink-saving black and white. Real PDFs and previews live under `printables/<collection>/`. Keep existing published asset URLs stable.

The collection chooser uses ordinary fragment links, grouped into Books and Themes. JavaScript shows the selected collection and remembers each collection's selected design while the page is open. Without JavaScript all collection sections, PDF links, and guides remain available. Bare `/printables.html` defaults to Genesis; `#genesis`, `#spiritual-armor`, `#fruit-of-the-spirit`, and `#exodus` link to individual collections when present.

To add a collection, first finish and review its assets and exact verse text, then add its public metadata to `printables/collections.json` and run `python3 tools/build_printables.py`. This generator checks for all required real PDFs and front/back images before writing the checked-in HTML. It is an authoring helper, not a new deployment build step. Never add placeholder collections or internal production paths to the public catalog. Preserve the first two Fruit of the Spirit cards together as all nine qualities; Exodus is a selection, not the entire Ten Commandments.

Check `node --check printables.js`, `node qa-printables/chooser.test.cjs`, and `python3 qa-printables/validate.py` (requires lxml and PyMuPDF). Verify desktop, 320px and 375px screens, keyboard, touch, repeated selection, Back/Forward, direct fragment links, no-JavaScript access, and download behavior. Source-file checksums must match the frozen reviewed artifacts. Physical printer alignment and holder assembly have not been tested; families are prompted to test plain paper first. GitHub Pages continues to serve the repository root with no new workflow.
