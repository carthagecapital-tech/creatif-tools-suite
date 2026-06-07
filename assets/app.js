/* =============================================================
   creatif.tools — app loader
   Reads apps/manifest.json, renders cards, handles demos.
   Designed to grow: add an entry to the manifest, drop the
   app's HTML in apps/<id>/index.html, and the site updates
   itself.
   ============================================================= */

(() => {
  'use strict';

  /* ------------------------------------------------------------
     CONFIG
     ------------------------------------------------------------ */

  // Where to source apps from. The site is data-driven — this is
  // the ONLY file that needs editing to add/remove apps.
  const MANIFEST_URL = 'apps/manifest.json';

  // Where the demo iframe points to for an app with id "myapp":
  //   apps/myapp/index.html
  // If that file is missing, the modal shows a graceful "coming soon"
  // state instead of an error.
  const appDemoUrl = (id) => `apps/${encodeURIComponent(id)}/index.html`;

  // The Etsy shop URL — used by the nav "Etsy" link, the footer
  // "Etsy Shop" link, and the empty-state CTA.
  const ETSY_SHOP_URL = 'https://www.etsy.com/shop/CreatifTools';

  // The contact email shown in the footer.
  const CONTACT_EMAIL = 'hello@creatif.tools';

  // Purchase mode. Switches the Buy button between Etsy (default)
  // and Stripe (planned). See `buyApp()` below.
  const PURCHASE_MODE = 'etsy'; // 'etsy' | 'stripe'

  // Demo limit. After this many milliseconds of an open demo, an
  // overlay slides in asking the customer to buy on Etsy. Customer
  // can dismiss it once per session and keep exploring. Set to 0
  // to disable the limit entirely.
  const DEMO_LIMIT_MS = 90000; // 90 seconds

  // Stripe-ready config. Populated when PURCHASE_MODE === 'stripe'.
  // You can also add per-app Stripe price IDs to each manifest entry:
  //   "stripePriceId": "price_1AbC..."
  const STRIPE_CONFIG = {
    publishableKey: '',
    // When the user clicks Buy, we POST to this endpoint with
    // { appId } to create a Checkout Session, then redirect.
    // Implement as a small serverless function (Netlify / Vercel /
    // Cloudflare Worker) that uses the Stripe secret key.
    checkoutEndpoint: '/api/create-checkout-session',
  };

  /* ------------------------------------------------------------
     STATE
     ------------------------------------------------------------ */
  let APPS = [];
  let currentApp = null;
  let demoLimitTimer = null;

  /* ------------------------------------------------------------
     DOM
     ------------------------------------------------------------ */
  const $ = (sel) => document.querySelector(sel);

  const els = {
    grid:        $('#appGrid'),
    empty:       $('#emptyState'),
    modal:       $('#modal'),
    modalFrame:  $('#modalFrame'),
    modalLoader: $('#modalLoader'),
    modalEmpty:  $('#modalEmpty'),
    modalMono:   $('#modalMono'),
    modalTitle:  $('#modalTitle'),
    modalSub:    $('#modalSub'),
    modalBuy:    $('#modalBuy'),
    modalClose:  $('#modalClose'),
    modalBanner: $('#modalDemoBanner'),
    bannerBuy:   $('#bannerBuy'),
    modalOverlay:$('#modalDemoOverlay'),
    overlayBuy:  $('#overlayBuy'),
    overlayDismiss: $('#overlayDismiss'),
    toast:       $('#toast'),
    year:        $('#year'),
    etsyNav:     $('#etsyNavLink'),
    footShop:    $('#footShopLink'),
    footContact: $('#footContact'),
  };

  /* ------------------------------------------------------------
     HELPERS
     ------------------------------------------------------------ */
  const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  const isLiveApp = (app) => {
    // An app is "live" if it has an Etsy URL and a status of 'live'
    // (or no status, for backward-compat with old manifests).
    if (app.status && app.status !== 'live') return false;
    return Boolean(app.etsyUrl);
  };

  let toastTimer;
  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2400);
  }

  /* ------------------------------------------------------------
     PURCHASE FLOW
     ------------------------------------------------------------ */
  // The Buy button is a function call, never a hardcoded link. That
  // way switching from Etsy → Stripe is one config change later.
  function buyApp(app) {
    if (PURCHASE_MODE === 'stripe') {
      startStripeCheckout(app);
    } else {
      // Etsy mode: open the listing in a new tab.
      if (!app.etsyUrl) {
        showToast('This app is not on Etsy yet.');
        return;
      }
      window.open(app.etsyUrl, '_blank', 'noopener');
    }
  }

  function startStripeCheckout(app) {
    // Placeholder. When you flip PURCHASE_MODE to 'stripe', you'll
    // implement this to:
    //   1. POST { appId, priceId: app.stripePriceId } to STRIPE_CONFIG.checkoutEndpoint
    //   2. Get back { sessionId } from your serverless function
    //   3. Load Stripe.js with STRIPE_CONFIG.publishableKey
    //   4. stripe.redirectToCheckout({ sessionId })
    // The function is wired and ready — only the Stripe SDK call is missing.
    showToast('Stripe checkout coming soon — ' + (app.name || 'this app') + ' not yet wired up.');
  }

  /* ------------------------------------------------------------
     RENDER — cards
     ------------------------------------------------------------ */
  function renderCard(app) {
    const live = isLiveApp(app);
    const demoLabel = live ? 'Try Demo' : 'Coming Soon';
    const demoDisabled = !live ? 'disabled' : '';
    const buyDisabled = !live ? 'disabled aria-disabled="true"' : '';
    const buyHref = live ? escapeHtml(app.etsyUrl) : '#';
    const cardClass = live ? 'card' : 'card coming-soon';

    return `
      <article class="${cardClass}"
               data-app="${escapeHtml(app.id)}"
               data-status="${live ? 'live' : 'coming-soon'}"
               style="--app-color: ${escapeHtml(app.color || '#00d4aa')}">
        <div class="card-head">
          <div class="monogram" style="background: ${escapeHtml(app.color || '#00d4aa')}">
            ${escapeHtml(app.monogram || (app.name || '?').charAt(0).toUpperCase())}
          </div>
          <div class="card-title-block">
            <h3 class="card-title">${escapeHtml(app.name || 'Untitled')}</h3>
            <div class="card-tag">${escapeHtml(app.tagline || '')}</div>
          </div>
        </div>
        <p class="card-desc">${escapeHtml(app.description || '')}</p>
        <ul class="card-features">
          ${(app.features || []).slice(0, 4).map((f) => `<li>${escapeHtml(f)}</li>`).join('')}
        </ul>
        <div class="card-footer">
          <div class="price"><strong>${escapeHtml(app.price || '$0')}</strong> one-time</div>
          <span class="status-badge ${live ? 'live' : 'coming'}">${live ? 'Available' : 'Coming Soon'}</span>
        </div>
        <div class="card-actions">
          <button class="btn btn-accent" data-action="demo" ${demoDisabled}>
            ${demoLabel}
          </button>
          <a class="btn btn-primary" data-action="buy" href="${buyHref}" target="_blank" rel="noopener" ${buyDisabled}>
            Buy on Etsy
            <svg class="btn-icon" viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg>
          </a>
        </div>
      </article>
    `;
  }

  function renderGrid() {
    if (!APPS.length) {
      els.grid.innerHTML = '';
      els.empty.style.display = 'block';
      return;
    }
    els.empty.style.display = 'none';
    els.grid.innerHTML = APPS.map(renderCard).join('');
  }

  /* ------------------------------------------------------------
     RENDER — modal
     ------------------------------------------------------------ */
  function openDemo(app) {
    currentApp = app;
    const live = isLiveApp(app);

    els.modalTitle.textContent = app.name || 'App Demo';
    els.modalSub.textContent = app.tagline || 'Live demo';
    els.modalMono.textContent = app.monogram || (app.name || '?').charAt(0).toUpperCase();
    els.modalMono.style.background = app.color || '#00d4aa';
    els.modal.style.setProperty('--app-color', app.color || '#00d4aa');

    // The Buy button in the modal header — always visible, always
    // triggers the same buyApp() function for consistency.
    els.modalBuy.onclick = (e) => {
      e.preventDefault();
      if (live) buyApp(app);
      else showToast('This app is not on Etsy yet.');
    };

    // Reset states
    els.modalFrame.style.display = 'none';
    els.modalEmpty.classList.remove('show');
    els.modalLoader.style.display = 'grid';
    els.modalOverlay.classList.remove('show');

    // Try to load the demo file. If it 404s (file doesn't exist
    // yet), show the "coming soon" state instead of a broken page.
    let loaded = false;
    const onLoad = () => {
      if (loaded) return;
      loaded = true;
      els.modalLoader.style.display = 'none';
      els.modalFrame.style.display = 'block';
      // Start the demo limit timer once the app is actually visible.
      // If we started it earlier, customers with slow connections
      // would see the overlay before the app finished loading.
      startDemoLimitTimer();
    };
    const onError = () => {
      if (loaded) return;
      loaded = true;
      els.modalLoader.style.display = 'none';
      els.modalEmpty.classList.add('show');
    };

    els.modalFrame.onload = onLoad;
    els.modalFrame.onerror = onError;

    els.modalFrame.src = appDemoUrl(app.id);

    // Safety net: if neither load nor error fires within 8s (some
    // hosts don't fire error for cached-but-missing files), fall back.
    setTimeout(() => { if (!loaded) onLoad(); }, 8000);

    els.modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDemo() {
    // Always clear the timer so the next demo opens with a fresh window.
    if (demoLimitTimer) {
      clearTimeout(demoLimitTimer);
      demoLimitTimer = null;
    }
    els.modal.classList.remove('open');
    document.body.style.overflow = '';
    // give the iframe a moment to unload before clearing, to avoid flash
    setTimeout(() => {
      els.modalFrame.src = 'about:blank';
      els.modalFrame.onload = null;
      els.modalFrame.onerror = null;
    }, 200);
    currentApp = null;
  }

  // The demo limit gate. After DEMO_LIMIT_MS of an open demo,
  // an overlay slides in asking the customer to buy. One dismiss
  // per session — they can keep exploring after they close it.
  function startDemoLimitTimer() {
    if (demoLimitTimer) clearTimeout(demoLimitTimer);
    if (DEMO_LIMIT_MS <= 0) return; // disabled
    demoLimitTimer = setTimeout(showDemoLimitOverlay, DEMO_LIMIT_MS);
  }

  function showDemoLimitOverlay() {
    if (!currentApp) return;
    if (!els.modalBuy) return;
    // Mirror the buy href to the overlay's buy button (it's an <a>).
    els.overlayBuy.href = currentApp.etsyUrl || '#';
    els.modalOverlay.classList.add('show');
  }

  /* ------------------------------------------------------------
     EVENTS
     ------------------------------------------------------------ */
  function wireEvents() {
    // Card clicks (delegated)
    els.grid.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (!card) return;
      const appId = card.dataset.app;
      const app = APPS.find((a) => a.id === appId);
      if (!app) return;

      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action === 'demo') {
        if (!isLiveApp(app)) { showToast("This app isn't out yet — check back soon!"); return; }
        openDemo(app);
      } else if (action === 'buy') {
        if (!isLiveApp(app)) { e.preventDefault(); showToast('Listing not live yet.'); }
        // If live, the <a href> handles it, but we route through buyApp
        // for consistency with the modal's Buy button.
        if (isLiveApp(app)) {
          e.preventDefault();
          buyApp(app);
        }
      }
    });

    // Modal
    els.modalClose.addEventListener('click', closeDemo);
    els.modal.addEventListener('click', (e) => {
      if (e.target === els.modal) closeDemo();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && els.modal.classList.contains('open')) closeDemo();
    });

    // Demo limit — banner buy, overlay buy, overlay dismiss
    els.bannerBuy.addEventListener('click', () => {
      if (currentApp) buyApp(currentApp);
    });
    els.overlayBuy.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentApp) buyApp(currentApp);
    });
    els.overlayDismiss.addEventListener('click', () => {
      els.modalOverlay.classList.remove('show');
      // Cancel the timer so it doesn't pop up again mid-explore.
      if (demoLimitTimer) { clearTimeout(demoLimitTimer); demoLimitTimer = null; }
    });

    // Filters
    document.querySelectorAll('.filter-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.dataset.filter;
        document.querySelectorAll('.card').forEach((card) => {
          card.style.display =
            filter === 'all' || card.dataset.status === filter ? '' : 'none';
        });
      });
    });
  }

  /* ------------------------------------------------------------
     BOOT
     ------------------------------------------------------------ */
  async function loadManifest() {
    try {
      const res = await fetch(MANIFEST_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Manifest HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Manifest must be a JSON array');
      return data;
    } catch (err) {
      console.error('Failed to load manifest:', err);
      showToast('Could not load app catalog. Check apps/manifest.json.');
      return [];
    }
  }

  function applyConfig() {
    els.year.textContent = new Date().getFullYear();
    if (els.etsyNav && ETSY_SHOP_URL) els.etsyNav.href = ETSY_SHOP_URL;
    if (els.footShop && ETSY_SHOP_URL) els.footShop.href = ETSY_SHOP_URL;
    if (els.footContact && CONTACT_EMAIL) els.footContact.href = `mailto:${CONTACT_EMAIL}`;
  }

  async function init() {
    applyConfig();
    wireEvents();
    APPS = await loadManifest();
    renderGrid();
  }

  // Expose buyApp for inline `onclick` use in the modal Buy button.
  // (The modal's Buy is wired via JS above; this is just a safety
  // hook in case the modal HTML is ever authored to call it directly.)
  window.creatifTools = { buyApp };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
