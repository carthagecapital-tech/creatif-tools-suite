# Creatif.tools

The marketing site for the Creatif.tools app suite. Customers land here from
Etsy, try the demo in the browser, then get sent back to Etsy to buy.

The site is data-driven: adding a new app is one entry in `apps/manifest.json`
and one HTML file in `apps/<id>/index.html`. No HTML editing required.

## File structure

```
creatif-tools-suite/
├── index.html              ← the showcase (don't edit by hand; it loads the manifest)
├── assets/
│   ├── style.css           ← design system (only edit for design changes)
│   └── app.js              ← loader, renderer, modal, Buy button
├── apps/
│   ├── manifest.json       ← THE source of truth — edit this to add/remove apps
│   └── <id>/
│       └── index.html      ← the demo file for that app
├── robot.txt
├── sitemap.xml
└── README.md
```

## How to add a new app

You don't need to touch any code. You just need:

1. **The app's HTML file** — the single-file HTML the customer will get on Etsy
2. **The Etsy listing URL** — where the Buy button should point
3. (Optional) a few small details — name, color, price, short description

Then:

1. **Drop the HTML file** in `apps/<your-app-id>/index.html`. The `<your-app-id>`
   is the short identifier you'll use everywhere. Use lowercase, dashes only,
   no spaces. Example: `poolpro`, `budgetflow`, `cleanquote-pro`.

2. **Edit `apps/manifest.json`** — add a new entry to the array. Copy-paste
   this template and fill it in:

   ```json
   {
     "id": "your-app-id",
     "name": "Your App Name",
     "tagline": "Short category, e.g. 'CRM Suite'",
     "description": "Two sentences. What does it do, and who is it for?",
     "features": [
       "Key feature one",
       "Key feature two",
       "Key feature three"
     ],
     "color": "#2C4A7C",
     "monogram": "Y",
     "price": "$29",
     "etsyUrl": "https://www.etsy.com/listing/000000000/your-app-name"
   }
   ```

   Field reference:
   - `id` — must match the folder name in `apps/<id>/index.html`
   - `name` — display name (e.g. "PoolPro Manager")
   - `tagline` — short category, shown under the name in small caps
   - `description` — one or two short sentences, shown on the card
   - `features` — 3 to 4 short bullets shown on the card
   - `color` — hex color used for the card's accent stripe and icon
   - `monogram` — 1-2 letter mark shown inside the colored icon block
   - `price` — display string, e.g. `"$29"` or `"$19 — Lifetime"`
   - `etsyUrl` — the full Etsy listing URL

3. **Commit and push.** That's it. The site is fully static, so
   GitHub Pages (or whatever host) picks up the new app automatically.

## To remove an app

1. Delete the entry from `apps/manifest.json`
2. Optionally delete the `apps/<id>/` folder (it won't be referenced anymore)

## Direct purchase (Stripe) — switching from Etsy later

The Buy button is routed through a function, not a hardcoded link, so flipping
from Etsy → Stripe is a config change, not a rewrite.

In `assets/app.js`, near the top:

```js
const PURCHASE_MODE = 'etsy';  // change to 'stripe' when ready
```

When you flip to Stripe, you'll also need to:

1. Add your Stripe publishable key and checkout endpoint to `STRIPE_CONFIG`
2. Add a `stripePriceId` to each entry in `apps/manifest.json` (e.g. `"stripePriceId": "price_1AbC..."`)
3. Implement the small serverless function that the JS calls to create a
   Checkout Session (Netlify Function / Vercel Function / Cloudflare Worker
   — 30 lines of code, the JS is already wired to call it)
4. Uncomment and complete `startStripeCheckout()` in `assets/app.js`

Until then, everything routes to Etsy as it does now.

## Local preview

```bash
# from the repo root
python3 -m http.server 8000
# then open http://localhost:8000
```

You can also just open `index.html` directly in a browser, but `fetch()` for
the manifest needs an HTTP server (it won't work via `file://`).
