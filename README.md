# Bearly Kyler — complete site handoff

Start with **GUIDE.md** for the full technical and editing manual.

## Run it

1. Extract this ZIP completely.
2. Open a terminal in the extracted `bearly-kyler-complete` folder.
3. Run `python3 serve.py` (Windows: `py serve.py`).
4. Open http://localhost:8000 in your browser.
5. Stop the server with Ctrl+C.

Python 3 is the only requirement for this local server. The deployed site needs no Python, Node, React, database, API keys, or build step. Upload the **contents of site/** to a static host. Do not upload this outer documentation folder as the website root.

## What you are getting

- Complete editable HTML, CSS and JavaScript, all site assets, local fonts and video.
- Original illustrated interactive bear and the 1.5-second wave opening.
- Windblown leaves, card tilt, gallery filters and component demos.
- Name badge, pixel loader, closing door, loading button, segmented control and toggle.
- Wave source with embedded artwork, copy-code controls and HTML downloads.
- Light mode only. Falling honey has been removed; the bear's clickable honey jar remains.
- Historical animation source and exact timing data in source/.
- Detailed instructions, a local server and a SHA-256 inventory.

## Publication status

This is the latest local snapshot, including fixes that failed to publish because the source server returned HTTP 500. The hosted preview may still show dark mode and honey. Packaging this ZIP does not update that deployment.

The last known preview is https://bear-loading-preview.barrett426398.chatgpt.site and is owner-private. The custom domain bearlykyler.com was registered for connection, but DNS activation and public access were not completed. No Cloudflare credentials are included or required to preview locally.

## Folder overview

- `site/`: deployable website, including editable implementation.
- `source/`: historical canvas loader implementation and wave timeline.
- `GUIDE.md`: detailed implementation, maintenance and launch instructions.
- `serve.py`: local HTTP server, bound to your own machine.
- `SHA256SUMS.txt`: file integrity inventory.

The exact existing site tree is preserved, including unused experiments. See the guide before removing archived assets. This package is not a validated realistic 3D bear implementation.
