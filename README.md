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

The site is a static-assets-only Cloudflare Worker. Cloudflare builds from the
`main` branch, so a push to `main` publishes. There is no build step.

**The web root is `site/`, not the repository root.** `index.html` lives at
`site/index.html`; `GUIDE.md`, `source/` and `serve.py` are documentation and
tooling and are never served.

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
- `source/`: historical canvas loader implementation and wave timeline.
- `GUIDE.md`: detailed implementation, maintenance and launch instructions.
- `serve.py`: local HTTP server, bound to your own machine.

The original site tree is preserved, including unused experiments. See the guide
before removing archived assets. This is not a validated realistic 3D bear
implementation.

## Third-party licenses

- Nunito font: `site/fonts/OFL.txt`
- three.js: `site/bear-lab/THREE-LICENSE.txt`
