# Reid Kids

A warm, faith-filled landing page for **Reid Kids** — a Christian children's & family brand
offering beautifully illustrated books and resources that help little hearts grow in God's love.

🌐 **Live site:** [reidkids.com](https://reidkids.com)

## Sections
- **Hero** — welcome + verse (Matthew 19:14)
- **About Reid Kids** — mission & values
- **Children's Books** — featured titles
- **Family Resources** — devotionals, prayer cards, activities
- **Coming Soon** — email signup
- **Contact** — email & social

## Tech
Plain static site — no build step.

| File | Purpose |
|------|---------|
| `index.html` | Page markup |
| `styles.css` | Styling (soft blues, golds & whites, mobile-first) |
| `script.js` | Mobile nav, scroll reveal, signup validation |
| `CNAME` | Custom domain for GitHub Pages |
| `.nojekyll` | Serve files as-is on GitHub Pages |

## Deploy to GitHub Pages
1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment** → Source: **Deploy from a branch**, Branch: **main** `/ (root)`.
3. Under **Custom domain**, confirm `reidkids.com` (already set via `CNAME`).
4. Point DNS for `reidkids.com` to GitHub Pages:
   - `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` for `www` → `<username>.github.io`
5. Enable **Enforce HTTPS** once the certificate is issued.

## Local preview
Open `index.html` directly, or run a simple server:
```bash
python3 -m http.server 8000
```
Then visit <http://localhost:8000>.
