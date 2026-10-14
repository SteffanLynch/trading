# Brand assets

The brand files live in `static/img/`:

| File | Used for |
| --- | --- |
| `logo.svg`, `favicon.svg` | Navbar logo, structured data, modern browser tab icon (same artwork) |
| `favicon.ico` | Older browsers (16, 32 and 48 px) |
| `apple-touch-icon.png` | iOS home-screen icon (180 px, full-bleed square) |
| `social-card.png` | Link previews (Open Graph and Twitter), 1200 x 630 |

The mark is a bold "T" on the lime highlight block used in the site's headings, tilted over a violet tile.

## Regenerating the social card

`social-card.html` is the source. It loads the site fonts from Google Fonts, so it needs a network connection. With Google Chrome installed (macOS path shown):

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --virtual-time-budget=8000 --window-size=1200,630 --screenshot=static/img/social-card.png "file://$PWD/scripts/brand/social-card.html"
```

Run it from the repository root, then check the image before committing.

## Regenerating the icons

Edit `static/img/favicon.svg`, then render PNGs at 16, 32, 48 and 180 px (use a copy with `rx="0"` for the 180 px Apple icon) and combine the first three into `favicon.ico` with ImageMagick: `magick icon16.png icon32.png icon48.png favicon.ico`.
