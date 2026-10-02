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
- **Home** (`index.html`) — hero, About, Children's Books, Coloring Books preview, Family Resources, Coming Soon, Contact
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
