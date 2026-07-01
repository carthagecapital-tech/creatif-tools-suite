# DEFINITIVE blog fix package

This package fixes the blog cards + footer + breadcrumb issues. The build has been cache-busted with a unique timestamp (`1782915410`) so Vercel will treat it as new content.

## What's in the package (5 files)

- `blog/index.html` (REPLACE)
- `blog/cleaning-business-pricing-guide/index.html` (REPLACE)
- `blog/how-to-price-a-house-cleaning-job/index.html` (REPLACE)
- `blog/how-to-get-your-first-10-cleaning-clients/index.html` (REPLACE)
- `blog/google-business-profile-for-cleaning-companies/index.html` (REPLACE)

## What this package includes

1. **Horizontal blog card style** (`blog-card` class)
   - 4 cards in `.posts` div, each with the new horizontal layout
   - Border-left accent color per post
   - Distinctive from app/tool cards

2. **Robust footer** (flexbox + !important)
   - Brand mark + tagline + nav links (3-tier)
   - `display: flex; justify-content: center` forces centering
   - `!important` flags to override any conflicting CSS

3. **Always-visible breadcrumb links**
   - Default: accent color + underline (clearly clickable)
   - Hover: brighter color + brighter underline
   - Current page: bold white, no underline

## CRITICAL: Clear your cache!

If you've been seeing broken layouts after applying previous packages, the issue is most likely **browser or Vercel cache**.

**After applying this package, do BOTH:**

1. **Hard refresh your browser** to clear the browser cache:
   - Mac: `Cmd + Shift + R`
   - Windows/Linux: `Ctrl + Shift + R`
   - Or open in incognito/private window: `Cmd + Shift + N` (Mac) / `Ctrl + Shift + N` (Windows)

2. **Force a fresh Vercel deploy** (if hard refresh doesn't work):
   - Go to your Vercel project dashboard
   - Click "Deployments" tab
   - Click the 3-dot menu on the latest deployment
   - Click "Redeploy"
   - This forces Vercel to ignore its CDN cache and serve fresh content

## Apply

1. Extract `creatif-tools/` over your creatif-tools-suite repo root
2. Will replace 5 HTML files
3. Commit + push
4. **Wait for Vercel to deploy** (30-60 sec)
5. **Hard refresh** the blog page
6. If still broken, redeploy from Vercel dashboard
