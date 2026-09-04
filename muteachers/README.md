# Teacher's Day Cards — μlearn ASI

A student picks a card, drops in a photo of them and their teacher, writes on the
card itself, turns it over for a private note, and sends a link. The teacher opens
the link and gets the finished card — nothing else.

```bash
npm install
npm run dev        # app only            → http://localhost:5173
npm run dev:full   # app + short-link API (reuses an API already on :8787)
npm start          # production build + server on :8787
```

The API port comes from `PORT` — `PORT=8788 npm start` if 8787 is taken. To find
and stop a server already holding it:

```bash
kill $(lsof -t -iTCP:8787 -sTCP:LISTEN)
```

Without the API the app still works end to end; share links simply carry the whole
card in the URL fragment instead of pointing at a stored one.

## The flow

`/` landing → `/pick` choose a design → `/photo` upload or shoot a selfie →
`/create` write on the card → `/preview` check both sides → `/share` get the link.
The teacher lands on `/c/<id>` (or `/c#<packed-card>`), sees the front, and taps to flip.

## How it is put together

```
src/
  lib/
    types.ts        the card data model (templates, elements, documents)
    templates.ts    the seven card designs — artwork, slots, fonts, constraints
    store.ts        zustand store: elements, selection, undo/redo, persistence
    share.ts        packs a card into a link, or posts it for a short one
    image.ts        photo downscaling, camera frame capture
    decoMeta.ts     sticker catalogue and proportions
  components/
    card/           CardCanvas · CardFlip · PhotoFrame · TextPlate · ElementChrome
    art/            all artwork as SVG — decorations, doodles, template backgrounds
    camera/         the inline camera (preview, flip, flash, timer, grid, retake)
    editor/         tool panels for text, handwriting, stickers, colour, photo
    shell/          nav, step bar, footer, mobile tab bar
  routes/           one file + one stylesheet per screen
server/index.mjs    optional zero-dependency short-link API + static host
```

### The card is a design space, not a layout

Every template is authored inside a box `DESIGN_W = 1000` units wide and
`1000 / aspect` tall. Element positions are percentages of that box, and sizes are
multiples of `--u`, a container-query unit equal to 0.1% of the card's width. One
set of numbers therefore renders identically in a 120px grid thumbnail, a 430px
editor canvas and a 2000px PNG export — no transforms, no re-layout, native text
rendering and a real caret inside `contenteditable`.

Adding a template means adding one entry to `TEMPLATES` (artwork key, aspect,
elements) and one artwork branch in `TemplateArt`. Nothing else needs to know.

### Editing happens on the card

There is no message field anywhere. Tapping a text block selects it; tapping again
puts a caret in it. Handles for delete, move, rotate and resize appear at the
corners at a constant screen size regardless of how large the card is drawn, and
two-finger pinch scales and rotates together. Arrow keys nudge a selected element,
Enter edits it, ⌘Z / ⌘⇧Z undo and redo.

### Photos

`getUserMedia` with a front-facing default on touch devices, plus rear/front
switching, torch where the hardware exposes it, a 3-second timer, grid lines,
retake, and a clear message when permission is denied. Captured frames are
un-mirrored, downscaled and re-encoded before they reach the card.

### Sharing

`buildShareLink` POSTs the card to `/api/cards` and returns `/c/<id>` when the
companion server is reachable. When it isn't — opened from a file, a static host,
or offline — it deflates the card with `CompressionStream` and packs it into the
URL fragment instead, so the link still carries the whole card and still works.
Either way nothing about a card leaves the device unless the link is sent.

## Checks

```bash
node tools/flow.mjs             # full journey, desktop
node tools/flow.mjs --mobile    # full journey, 390×844
node tools/audit.mjs            # overflow + tap targets at six widths
node tools/export.mjs           # PNG download
node tools/shot.mjs '[{"name":"x","path":"/","w":1440,"h":900,"full":true}]'
```

Fonts are self-hosted in `public/fonts`, so the app has no third-party runtime
dependency and PNG export embeds the real typefaces.
