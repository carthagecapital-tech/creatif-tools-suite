# SEO foundation package

Adds 51 new landing pages + better homepage + complete sitemap to creatif.tools.

## What's in the package

**51 new pages:**
- 36 app landing pages (one per app in your manifest) at `creatif.tools/<app-id>/`
- 15 niche landing pages (one per niche) at `creatif.tools/<niche>/`

**3 modified files:**
- `creatif-tools/index.html` (better title, meta description, keywords, Schema.org JSON-LD, internal cross-links)
- `creatif-tools/sitemap.xml` (now has 52 URLs, was 1)
- `creatif-tools/robot.txt` (unchanged but included for completeness)

## What each new page has

**App pages:**
- Unique H1, meta description targeting "[app name] + [niche]" keywords
- Schema.org SoftwareApplication JSON-LD (price, description, etc.)
- 200-300 word description
- Key features (from manifest)
- "How it works" 3-step section
- Embedded demo iframe (loads apps/<id>/index.html)
- Buy on Etsy button
- FAQ section (3 questions)
- Related apps in same niche

**Niche pages:**
- Unique H1, meta description targeting "[niche] apps" keywords
- Schema.org CollectionPage + ItemList JSON-LD
- 200-300 word intro
- All apps in the niche as cards (with links to app pages)
- "Why these apps" section
- "How to choose" tips list
- FAQ section
- Other niches (internal cross-links)

## Apply

Extract the `creatif-tools/` folder over your existing creatif-tools repo root. The new folders/files will be added; the modified `index.html` and `sitemap.xml` will replace existing.

Commit + push. Vercel auto-deploys.

## After deploy

1. **Google Search Console** -> Sitemaps -> resubmit `https://creatif.tools/sitemap.xml`
2. **Request indexing** for your top pages: GSC -> URL Inspection -> paste URL -> Request Indexing
3. **Wait 2-4 weeks** for Google to crawl and index the new pages
4. **Monitor** GSC -> Performance -> see which queries start showing your pages

## Expected timeline

- 0-2 weeks: Google discovers the new URLs via sitemap
- 2-6 weeks: Google starts indexing them, you see impressions in GSC
- 6-12 weeks: You start ranking for long-tail queries, clicks begin
- 3-6 months: Compounding effect as Google sees your site as authoritative

## Notes

- The 3 coming-soon apps (carwash-pro, pestpro, poolpro) get landing pages with "coming soon" messaging
- The original `apps/<id>/index.html` files (iframe content) are unchanged - they still load in the modal
- All new pages have unique content (not just templated placeholders)
- Cross-linking between pages helps Google understand your site structure
