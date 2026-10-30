# writing-2025
Personal website 2025

## Privacy

- **Google Analytics** is gated by [`js/consent.js`](js/consent.js). If the
  visitor declines or ignores the banner, `googletagmanager.com` is never
  contacted. The consent control in the footer reopens the banner so a choice
  can be withdrawn.
- **Fonts are all self-hosted** under [`fonts/`](fonts/). Do not add
  `fonts.googleapis.com` links; they leak visitor IPs to Google before consent.
- [`privacy.html`](privacy.html) is the GDPR Art. 13 notice. Update it whenever
  a new third party, cookie or form is added.

No third-party request fires before opt-in.

## Fonts

Bungee Shade (wordmark and nav), Anton (display) and Rubik (body) ship as
`.woff2` with a `.ttf` fallback listed second in each `@font-face`; browsers
fetch only the first format they understand, so the TTFs cost nothing. To add a weight, drop the TTF in and
convert it:

    python3 -c "from fontTools.ttLib import TTFont; f=TTFont('in.ttf'); f.flavor='woff2'; f.save('out.woff2')"

(needs `pip install fonttools brotli`)

### Bungee Shade

`--font-display-alt` — the "JESSE SHERWOOD" wordmark and the nav links — is
`"Bungee Shade", "Anton", sans-serif`. It is preloaded on every page so the
wordmark doesn't flash in Anton first.

The desktop home page sizes its content to the wordmark's width in CSS
(`.home .container` in the ≥1025px block), using the measured width of
"JESSE SHERWOOD" in Bungee Shade: 11.81em. If the title text, font or
letter-spacing changes, re-measure that number.

History, so this is not undone by accident: the font used to come from a
Google Fonts `@import`. That `@import` was removed on 2026-08-10 (`f71f641`)
without a self-hosted replacement, which silently dropped the wordmark to Anton
for six weeks; it was restored, then replaced by the self-hosted copy on
2026-10-30.

## Images

`images/*-1000.jpg` files are the sizes actually rendered in the page; the
full-resolution originals stay because `og:image` needs them for social cards.
Both are wired up through `srcset`, so keep the pairs in sync.
