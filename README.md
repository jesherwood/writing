# writing-2025
Personal website 2025

## Privacy

- **Google Analytics** is gated by [`js/consent.js`](js/consent.js). If the
  visitor declines or ignores the banner, `googletagmanager.com` is never
  contacted. The consent control in the footer reopens the banner so a choice
  can be withdrawn.
- **Fonts are self-hosted** under [`fonts/`](fonts/) — with one exception,
  Bungee Shade, which still loads from `fonts.googleapis.com` on every page
  view, before any consent (see below). Do not add further
  `fonts.googleapis.com` links; they leak visitor IPs to Google before consent.
- [`privacy.html`](privacy.html) is the GDPR Art. 13 notice. Update it whenever
  a new third party, cookie or form is added.

So one third-party request *does* fire before opt-in. It is disclosed in
`privacy.html` under legitimate interests, and closing it is the single biggest
remaining privacy win — see "Bungee Shade is the one exception" below.

## Fonts

Anton (display) and Rubik (body) ship as `.woff2` with a `.ttf` fallback listed
second in each `@font-face`; browsers fetch only the first format they
understand, so the TTFs cost nothing. To add a weight, drop the TTF in and
convert it:

    python3 -c "from fontTools.ttLib import TTFont; f=TTFont('in.ttf'); f.flavor='woff2'; f.save('out.woff2')"

(needs `pip install fonttools brotli`)

### Bungee Shade is the one exception

`--font-display-alt` — the "JESSE SHERWOOD" wordmark and the nav links — is
`"Bungee Shade", "Anton", sans-serif`. Bungee Shade is **not** self-hosted; it
comes from the `@import` on line 5 of `css/styles.css`, which is a deliberate,
known exception to the rule above: it contacts `fonts.googleapis.com` on every
page load, before any consent.

To close that gap, self-host it and delete the `@import` (SIL Open Font
License):

    mkdir -p fonts/bungee-shade
    curl -L -o fonts/bungee-shade/BungeeShade-Regular.ttf \
      https://raw.githubusercontent.com/google/fonts/main/ofl/bungeeshade/BungeeShade-Regular.ttf
    python3 -c "from fontTools.ttLib import TTFont; f=TTFont('fonts/bungee-shade/BungeeShade-Regular.ttf'); f.flavor='woff2'; f.save('fonts/bungee-shade/BungeeShade-Regular.woff2')"

Then add an `@font-face` for it beside the Anton one, and the preload alongside
the Anton preload in each page's `<head>`:

    <link rel="preload" href="fonts/bungee-shade/BungeeShade-Regular.woff2" as="font" type="font/woff2" crossorigin>

History, so this is not undone by accident: the `@import` was removed on
2026-08-10 (`f71f641`) without a self-hosted replacement, which silently
dropped the wordmark to Anton for six weeks.

## Images

`images/*-800.jpg` and `images/*-1000.jpg` are the sizes actually rendered in
the page; the full-resolution originals stay because `og:image` needs them for
social cards. Both are wired up through `srcset`, so keep the pairs in sync.
