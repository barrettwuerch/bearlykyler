# Bearly Kyler

Source for the Bearly Kyler website. Start with **GUIDE.md** for the full
technical and editing manual.

## Run it locally

1. Clone the repository.
2. Run `python3 serve.py` (Windows: `py serve.py`). It serves `site/` and
   resolves that path relative to the script, so your working directory does
   not matter.
3. Open http://localhost:8000 in your browser.
4. Stop the server with Ctrl+C.

Python 3 is the only requirement for this local server. The site itself needs
no Python, Node, React, database, API keys, or build step.

## Deployment

The site is a Cloudflare Worker. Cloudflare serves every file in `site/`
directly; `worker/index.js` only runs for other paths, where it serves the
Oware roadmap's password-protected API under `/api/roadmap/` and hands
everything else back to the static files. The roadmap page itself is no longer
hosted on this site; the API and its saved board remain so the board can be
moved to its new home. Cloudflare builds from the `main` branch, so a push to
`main` publishes. There is no build step.

**The web root is `site/`, not the repository root.** `index.html` lives at
`site/index.html`; `GUIDE.md`, `source/`, `serve.py` and `worker/` are
documentation, tooling and server code and are never served.

The roadmap's data lives in a Durable Object, not in this repository. Creating
it needs `wrangler deploy` (Cloudflare's default for the production branch);
`wrangler versions upload`, used for preview branches, cannot create it, so a
preview build fails until the first production deploy has run.

The roadmap is behind a team password, checked in `worker/index.js` against a
SHA-256 hash. To change the password without editing code, add a
`ROADMAP_PASSWORD` secret to the Worker in the Cloudflare dashboard; it replaces
the built-in one and keeps the saved board.

`wrangler.jsonc` holds the deploy configuration. Its `name` must keep matching
the Worker in the Cloudflare dashboard, or a deploy will target a different
Worker. Validate changes to it before pushing:

```
npx wrangler deploy --dry-run
```

## What is here

- Complete editable HTML, CSS and JavaScript, all site assets, local fonts and video.
- Original illustrated interactive bear and the 1.5-second wave opening.
- Windblown leaves, card tilt, gallery filters and component demos.
- Name badge, pixel loader, closing door, loading button, segmented control and toggle.
- Wave source with embedded artwork, copy-code controls and HTML downloads.
- Light mode only. Falling honey has been removed; the bear's clickable honey jar remains.
- Historical animation source and exact timing data in `source/`.

## Folder overview

- `site/`: the deployable website, including editable implementation.
- `worker/`: the Worker code, including the roadmap's password check and API.
- `source/`: historical canvas loader implementation and wave timeline.
- `GUIDE.md`: detailed implementation, maintenance and launch instructions.
- `serve.py`: local HTTP server, bound to your own machine.

The original site tree is preserved, including unused experiments. See the guide
before removing archived assets. This is not a validated realistic 3D bear
implementation.

## Third-party licenses

- Nunito font: `site/fonts/OFL.txt`
- three.js: `site/bear-lab/THREE-LICENSE.txt`
