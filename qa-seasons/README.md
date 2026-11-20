# Annual seasonal frames

The legacy `thanksgiving.js` and `thanksgiving.css` entry points are retained so all eight existing themed pages gain scheduling without HTML changes. The homepage and its Joke of the Day are unchanged. Existing unthemed pages remain unthemed. The old Halloween look was replaced in repository history and is not active in the current site; no retired theme is restored.

Dates repeat every year in `America/New_York`, inclusive:

| Theme | Start | End |
| --- | --- | --- |
| New Year | January 1 | January 7 |
| St. Patrick's | March 10 | March 17 |
| Thanksgiving | November 1 | November 30 |
| Christmas | December 1 | December 31 |
| Existing default | All other dates | |

Christmas first starts at **2026-12-01 00:00 Eastern = 2026-12-01 05:00 UTC**. The date resolver ignores the visitor's timezone. Open tabs check on minute boundaries and again when restored or made visible. Device clocks must be reasonably accurate, as with other client-side calendars. Background browser throttling may delay a hidden tab, which updates when visible.

The approved Thanksgiving CSS remains an exact prefix of the stylesheet. November applies the same class and decorative element as before. New styles only match `.holiday-season`; artwork is static, hidden from assistive technology, has no pointer events, and occupies reserved side gutters. Print removes the framing. SVGs are original code-native art with no remote dependencies.

## Extend

Add an inclusive month/day range to `CALENDAR` in `thanksgiving.js`, and corresponding scoped CSS/artwork. First matching range wins; ranges crossing December/January are supported. Extend date and browser tests with the new season. No annual deployment is needed.

## Private preview

Run a localhost-only server from the repository root:

```
python3 -m http.server 8126 --bind 127.0.0.1
```

Open `http://127.0.0.1:8126/?season-preview=christmas`, `new-year`, `st-patricks`, `thanksgiving`, or `default`. The parameter is ignored on all public hosts and is not persisted. No preview is deployed publicly.

## Tests

```
node --test qa-seasons/calendar.test.cjs qa-seasons/runtime.test.cjs
node --check thanksgiving.js
BASE_URL=http://127.0.0.1:8126 node qa-seasons/browser.cjs
```

Browser tests require Playwright and Chromium (`CHROMIUM_PATH` defaults to `/usr/bin/chromium`). The suite checks eight themed pages × five seasons × four widths (320/375/768/1440), reduced-motion mode, a Tokyo device timezone, November screenshot equality with the approved baseline, open-tab midnight transitions, and disabled public preview overrides. Screenshots go to `/tmp/reid-seasons-qa`.

**Current validation:** calendar and mocked DOM/runtime tests pass; syntax passes. Production was inspected and still shows Thanksgiving plus the published daily joke. Browser suite is prepared but could not run in the delegated sandbox: Chromium's process singleton socket was denied (`Operation not permitted`); cloud browser could not connect to the localhost server. Visual review and browser regression checks remain required before publication. No seasonal changes have been published.
