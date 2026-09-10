# Bearly Kyler: implementation and ownership guide

Snapshot: September 10, 2026. This manual describes the bundled code, not an idealized future implementation.

## 1. Architecture

This is a static site. The browser loads HTML, local CSS, JavaScript, images, fonts and an MP4. There is no backend, login system inside the code, CMS, analytics integration, package install, transpiler or build pipeline. Hosting access restrictions are separate from the application.

The page structure is header → interactive bear hero → work/playground gallery → about → footer. The opening overlay covers the page until the short greeting finishes. The components use native DOM APIs and Canvas; there is no React runtime. The supplied React tilt concept was adapted into vanilla JavaScript for this architecture.

### Files you will edit most

| File inside site/ | Responsibility |
| --- | --- |
| index.html | Navigation, copy, hero markup, gallery cards, iframes, source dialog and script loading |
| brand.css | Typography, palette, layout, responsive rules, overlays and focus styling |
| opening.js | Opening MP4 playback, page reveal and replay |
| brand.js | Gallery filtering, button/tabs/toggle demos, source dialog, clipboard and downloads |
| seasonal.js | Leaves only; no honey creation or animation |
| site-motion.js | Pointer-responsive card tilt and decorative glare |
| bear-story/story.js | Hero bear drawing, click regions, pose timing and smile patch |
| components/ | Standalone downloadable component examples |
| fonts/ | Locally hosted Nunito and its OFL license |
| bear.mp4 | Opening and gallery video |
| bear.png | Bear fallback and about illustration |

Keep script order in index.html unless you understand its dependencies. The hero script is a module; the other scripts run at the end of the body. Wrappers around seasonal.js and site-motion.js isolate their variables. Removing those wrappers can cause global-name collisions with opening.js.

## 2. Local setup, step by step

Extract the ZIP, preserving folder names and capitalization. Run `python3 serve.py` from the outer folder. If port 8000 is busy, stop the other server or change the port in serve.py and the URL you open. Windows may use `py` instead of `python3`.

Use HTTP even though index.html is a file. Opening it with a file:// URL can block module imports and fetch-based source loading. A local web server makes those requests behave like the hosted site. Clipboard APIs work on localhost in supporting browsers, but clipboard permissions can still be denied; the source dialog is the fallback.

Edit a file, save it, then reload the browser. This package has no automatic hot reload. Use a hard refresh when cached files obscure changes. Browser developer tools → Console and Network are useful for identifying an error or missing asset.

## 3. Brand, copy and layout

The intended palette is soft white #fcfdfd, charcoal #29343c, sky blue #48a8ee, link blue #247ab6 and honey yellow #ffc33d. Nunito supplies the rounded character. There is no theme switch or theme-preference script in this snapshot.

In index.html, edit the page title and description in the head, the hero heading and supporting paragraph, the about paragraph, and gallery titles/descriptions. Keep the existing IDs when changing text; scripts depend on #stage, #replay, #bear-demo, #play-bear and source-dialog controls.

brand.css contains successive design revisions. Later selectors override earlier selectors. Search for the final Sky + honey design rules and inspect computed styles before editing an earlier declaration. Do not assume the first occurrence of a color or selector controls the result. Old dark-mode declarations were removed from the active implementation, but other unused historical CSS remains.

For hero sizing, inspect .bear-hero-main, .bear-introduction and #stage. For cards, inspect .gallery, .card and .preview. Desktop uses a six-column gallery; cards span two, three or four columns. Small screens collapse to one column. Source controls should remain outside the tilting preview for comfortable clicking.

## 4. The opening animation

opening.js controls the overlay MP4. The page begins inert and aria-hidden. On successful playback, the script checks video.currentTime and reveals at 1.5 seconds. reveal() marks the body ready, restores page interaction, fades the overlay and pauses the video. Ended, video error and playback rejection also reveal the page. Reduced motion bypasses the greeting. The header replay control restarts it.

To replace the greeting, replace bear.mp4 and adjust the threshold in opening.js to match the new finishing gesture. The same MP4 is used by the gallery. Preserve muted and playsinline for mobile playback. A different filename requires changing both source references in index.html.

Known limitation: a media request that stalls without firing an error has no explicit timeout fallback in this snapshot. If you add one, clear it on reveal and restart it on replay so an old timer cannot interrupt a new playback.

## 5. Hero bear interactions

The hero is an illustrated canvas animation, not a rigged 3D character. It loads twelve PNG poses from bear-story/. Its normal state is wave8. A transparent button over the viewer-right paw triggers the wave; the viewer-left paw brings out honey; the head triggers a smile. Buttons have accessible labels and can be activated by keyboard.

The scene draws each complete pose onto the same 444 × 444 coordinate system. bounds() chooses the on-screen scale and centers it. layout() applies the same bounds to the hit targets. Altering canvas placement without changing hit-target calculations will misalign clicks.

Wave sequence: wave1 0.18s, wave2 0.12s, wave3 0.13s, wave4 0.14s, wave5 0.17s, wave6 0.14s, wave3 0.10s, wave7 0.12s, wave8 0.40s. Total: 1.5 seconds. New clicks are ignored while a sequence is running. Honey uses honey-low followed by honey-held. The smile uses a small masked mouth patch, with a honey-smile pose when a jar is held.

The frame loop pauses when the hero is offscreen, the browser tab is hidden, motion is reduced, or no action/lean remains. Canvas resolution is capped at twice CSS resolution. That improves sharpness on high-density displays without making the artwork vector.

When replacing artwork, keep its registration, canvas dimensions and ground position consistent across every pose. Do not scale or flip a paw independently to fake a 3D turn; that is the cause of earlier detached/inverted-paw failures. The realistic furry experiments were rejected and are not active here.

Removing falling honey did not remove the bear's honey-jar interaction. Those are separate features.

## 6. Copyable wave code

components/bear-wave.html is a standalone canvas example with its PNG artwork embedded as data URIs. Copying the full document includes the assets; no external image folder is needed. The Play wave button creates a fresh custom element. The wave stops scheduling frames after the sequence completes.

source/animation-source.js is the historical full loader implementation, including extra unused assets and loading-completion APIs. source/animation-timeline.json records the exact wave timings. The trimmed standalone example is the practical sharing version; the historical source is included for provenance and deeper editing.

The gallery preview continues to play the MP4. The copied example renders a canvas sequence using the original artwork and timing; it is not a video embed. Browser rendering and MP4 compression can differ slightly.

## 7. Leaves and card motion

seasonal.js creates six leaves: maple and oak assets. Four remain visible on mobile. Their horizontal positions run from -130 to viewport width +130, making resets occur outside the viewport. Sine-based vertical drift and rotation imply wind. Change `length:6` and the distribution denominators together if changing the number of leaves; otherwise spacing will be uneven. Change speed values to alter crossing time, and widths to adjust prominence.

The seasonal scene spans the viewport rather than the page's content grid. It is clipped to the hero and cannot intercept clicks. Visibility observers stop unnecessary animation. Reduced motion leaves a still arrangement.

site-motion.js tilts each preview, using the stationary card bounds to calculate pointer position. The maximum rotation is roughly ±3 degrees. The spring uses stiffness 170 and damping 25, and a capped delta time. Set the multiplier 6 lower for gentler motion. Touch/coarse-pointer and reduced-motion users skip tilt. The glare is decorative and cannot capture pointer events.

Known limitation: pointer events inside embedded iframe documents do not bubble into the parent card. Tilt responds over the surrounding parent surface, but may stop updating while the pointer is inside a component iframe. A future refinement could forward normalized pointer coordinates from trusted same-origin demo documents.

## 8. Gallery and component source

Filtering uses data-category on cards and data-filter on the filter buttons. Valid categories currently are animation and component. All cards remain in the DOM; nonmatching cards receive hidden.

brand.js builds standalone source for the loading button, segmented control and toggle. Each has a prototype entry containing HTML, CSS and JavaScript. The uploaded examples and wave instead use a `file` entry pointing to a complete HTML document. View source loads the document into a native dialog. Copy code sends it to the clipboard; if unavailable, the source dialog opens for manual selection. Download HTML uses a Blob or direct downloadable link.

The Copy code payload is the entire runnable document. The MP4 is separately downloadable. Names and values entered into demos stay in the browser; there is no data submission endpoint.

### Adding another component

1. Create a standalone HTML document inside site/components/ with a title, viewport metadata, styles and its implementation.
2. Open that URL locally and check it independently.
3. Add a card to index.html with the existing card/component-preview structure and a titled iframe.
4. Add its category and a unique data-source key to the source buttons.
5. Add a matching prototypes entry in brand.js: `{title:'Example', file:'components/example.html'}`.
6. Add its downloadable HTML link.
7. Verify the demo, filtering, copying and downloaded document independently.

Do not add a source button without an entry: the current event handler expects every key to resolve.

### Name tag

nametag.js defines <name-tag>. Use `for="input-id"` to bind an input, or `value="Ada Lovelace"` for a fixed value. It displays first name and last initial, shrinks to fit, then truncates at the minimum size. It measures real SVG text and remeasures after fonts are ready. `--name-tag-color` and `--name-tag-font` are customization points. Unicode truncation preserves code points, but does not fully segment combined grapheme clusters.

### Pixel loader

pixelloader.js defines <pixel-loader>. `value` runs from 0 to 100; states are loading, failed and done. The example exposes a range input and a replay button. The source supports an optional horizontal sprite sheet through sheet, frames, frame-width, frame-height and fps attributes. No sprite was supplied with the upload, so this demo intentionally shows the bar alone.

Segment count is limited to available width to prevent overflow. A ResizeObserver handles container changes. Reduced motion snaps progress rather than easing it. The current loop continues while mounted, including idle frames; pausing it when settled would be a further performance improvement.

### Closing door

closingdoor.html contains the supplied SVG house and CSS door motion. The hinge transform applies to the panel and handle as a group. It plays once, holds closed, and the replay button restarts it. Reduced motion shows the closed state. Edit --door-fill, --door-line and --door-speed for color and timing.

### Keeping shared versions synchronized

nametag.js and pixelloader.js exist both as separate reusable scripts and embedded in their standalone HTML downloads. Editing one does not automatically update the other. Apply matching changes to both, or adopt a build script later. The current site needs no build step.

## 9. Hosting and bearlykyler.com

Choose one hosting destination before editing DNS. The existing Sites preview and a new Cloudflare Pages project are different destinations. Do not point the same hostname at both.

### Cloudflare Pages upload

In Cloudflare, open Workers & Pages, create a Pages application using Direct Upload, and upload the site folder's contents. index.html must be at the deployed root. No build is needed. Check the supplied pages.dev address before attaching the domain. For repeat deployments, upload the updated site files. A Direct Upload project cannot later switch to Git integration; create a Git-integrated project from the start if that is your desired workflow. These steps follow [Cloudflare Direct Upload documentation](https://developers.cloudflare.com/pages/get-started/direct-upload/).

### Attach your domain

Open the Pages project's Custom domains section and add bearlykyler.com. Follow its zone and DNS setup prompts. An apex domain on Pages requires the zone in the same Cloudflare account; a subdomain can use an external DNS provider. Register the domain on the Pages project before manually creating a CNAME. Confirm certificate activation and HTTPS. See [Cloudflare custom-domain documentation](https://developers.cloudflare.com/pages/configuration/custom-domains/).

### If keeping the existing Sites host

The domain connection was previously created but was not confirmed active. Retrieve the current validation and routing records from Sites rather than reusing potentially stale values from chat. Add those exact records at the authoritative DNS provider. Then verify domain/certificate status. The existing site is owner-private; domain connection alone does not grant public access. Public portfolio access still needs to be enabled deliberately.

No domain transfer, nameserver update, public-access change or Cloudflare deployment is performed by opening this package. Keep mail-related DNS records intact when making web-hosting changes.

## 10. Release checklist and troubleshooting

Before public launch, open desktop and mobile widths and verify the opening reveals, all three bear buttons work, leaves stay within the hero, navigation anchors work, filters retain the correct cards, all demos replay, clipboard works over HTTPS, downloads open independently, and keyboard focus stays visible. Enable reduced motion and repeat the main flows. Test on a real phone as well as a resized desktop browser.

This bundle received source syntax and file-integrity checks; it has not received a fresh browser visual QA pass. Do not treat packaging as evidence that every animation is visually polished.

If the page is empty: verify you are serving site/, inspect Console, and check opening.js and bear.mp4 requests. If the bear is missing: verify the PNG paths and module response. If source copying fails: use HTTPS or localhost, allow clipboard access, or select text in View source. If the old design persists: confirm your hosting destination and hard-refresh. If honey appears: you are likely viewing the earlier deployed version, because the bundled seasonal.js does not instantiate honey.

## 11. Archives, attribution and handoff boundaries

The full site tree preserves bear-lab/ (an earlier inflated-image 3D experiment), unused coffee poses, and historical honey image assets/CSS. The homepage does not load bear-lab or instantiate falling honey. For a later cleanup, remove unused files only after checking all references; keep backups if you want to retain development history.

Nunito's OFL license is in site/fonts/OFL.txt. The three user-uploaded component headers identify MIT licensing. The tilt implementation credits the beui.dev snippet supplied by the owner. The old bear-lab includes its Three.js notice. This package does not assert a blanket license over all artwork, branding and third-party code. Before publishing an open-source repository, retain notices and explicitly choose licensing for your own code and assets.

A future maintainer should preserve the approved light palette, illustrated bear and short greeting. The realistic 3D candidate was rejected. The current work should not be described as a realistic rig, fur simulation or production 3D character.
