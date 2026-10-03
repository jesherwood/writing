/* ==========================================================================
   Consent gate for Google Analytics.

   Loaded with `defer` on every page, ahead of main.js. Nothing here races a
   network call: gtag.js is only ever injected from loadAnalytics(), so no
   request reaches Google until a visitor has opted in. Declining (or
   ignoring the banner) means googletagmanager.com is never contacted at all,
   which is what keeps the site compliant with GDPR Art. 6 and the ePrivacy
   Directive Art. 5(3): analytics cookies are not "strictly necessary", so they
   need prior, informed, freely given consent.

   The consent record itself lives in localStorage. Storing a visitor's own
   privacy choice is exempt from the consent requirement — it exists only to
   honour what they asked for.
   ========================================================================== */
(function () {
  'use strict';

  var GA_ID = 'G-TTQDJHLJR8';
  var STORAGE_KEY = 'consent.v1';
  var analyticsLoaded = false;
  var banner = null;
  var lastFocused = null;

  /* --- Consent record ---------------------------------------------------- */

  // localStorage throws in Safari private mode and when site data is blocked,
  // so every access is guarded. A failure just means "no record": the banner
  // shows again and nothing is tracked, which is the safe direction to fail.
  function readConsent() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed.analytics === 'boolean' ? parsed : null;
    } catch (err) {
      return null;
    }
  }

  function writeConsent(analytics) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        analytics: analytics,
        date: new Date().toISOString()
      }));
    } catch (err) {
      /* Choice still applies to this page view; it just won't be remembered. */
    }
  }

  /* --- Google Consent Mode v2 -------------------------------------------- */

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted'
  });

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;

    gtag('consent', 'update', { analytics_storage: 'granted' });

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(script);

    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  // Withdrawal has to be as easy as giving consent (GDPR Art. 7(3)), and it has
  // to actually clear what was set. Cookies are written against a few possible
  // domain scopes, so expire each candidate rather than guessing.
  function clearAnalyticsCookies() {
    var host = window.location.hostname;
    var scopes = ['', host, '.' + host];
    var bare = host.replace(/^www\./, '');
    if (bare !== host) scopes.push(bare, '.' + bare);

    document.cookie.split(';').forEach(function (pair) {
      var name = pair.split('=')[0].trim();
      if (!/^_ga|^_gid|^_gat/.test(name)) return;
      scopes.forEach(function (domain) {
        document.cookie = name + '=; Max-Age=0; path=/' +
          (domain ? '; domain=' + domain : '');
      });
    });
  }

  /* --- Banner ------------------------------------------------------------ */

  function buildBanner() {
    var el = document.createElement('section');
    el.className = 'consent-banner';
    el.id = 'consent-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-labelledby', 'consent-banner-title');
    el.setAttribute('aria-describedby', 'consent-banner-text');
    el.hidden = true;

    el.innerHTML =
      '<h2 class="consent-banner__title" id="consent-banner-title">Cookies</h2>' +
      '<p class="consent-banner__text" id="consent-banner-text">' +
        'This site uses Google Analytics to count visits, but only if you say yes. ' +
        'Decline and nothing is sent to Google. ' +
        '<a href="privacy">Privacy &amp; Cookies</a>' +
      '</p>' +
      '<div class="consent-banner__actions">' +
        '<button type="button" class="consent-btn" data-consent="accept">Accept</button>' +
        '<button type="button" class="consent-btn" data-consent="decline">Decline</button>' +
      '</div>';

    el.addEventListener('click', function (event) {
      var choice = event.target.closest('[data-consent]');
      if (!choice) return;
      decide(choice.getAttribute('data-consent') === 'accept');
    });

    document.body.appendChild(el);
    return el;
  }

  function showBanner(moveFocus) {
    if (!banner) banner = buildBanner();
    banner.hidden = false;
    if (moveFocus) {
      lastFocused = document.activeElement;
      banner.querySelector('.consent-btn').focus();
    }
  }

  function hideBanner() {
    if (!banner) return;
    banner.hidden = true;
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
    lastFocused = null;
  }

  function decide(accepted) {
    writeConsent(accepted);
    hideBanner();

    if (accepted) {
      loadAnalytics();
      return;
    }

    gtag('consent', 'update', { analytics_storage: 'denied' });
    clearAnalyticsCookies();

    // Once gtag.js is in the page it can't be fully unloaded, so a withdrawal
    // mid-session needs a reload to take effect for real.
    if (analyticsLoaded) window.location.reload();
  }

  /* --- Wiring ------------------------------------------------------------ */

  var stored = readConsent();
  if (stored && stored.analytics) loadAnalytics();

  function ready() {
    if (!stored) showBanner(false);

    // Delegated so one listener covers every reopen control: the footer button
    // on all pages and the inline one in privacy.html.
    document.addEventListener('click', function (event) {
      if (!event.target.closest('[data-consent-open]')) return;
      event.preventDefault();
      showBanner(true);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      if (!banner || banner.hidden) return;
      // The banner is the topmost layer, so it takes the Escape rather than
      // letting the overlay menu close underneath it at the same time. This
      // listener is registered before main.js's because consent.js runs in
      // <head>; main.js is independently guarded on menu-open, so the order
      // is an optimisation, not a correctness dependency.
      event.stopImmediatePropagation();
      // Escape dismisses the banner without recording a choice, so nothing
      // loads and the banner returns on the next visit.
      hideBanner();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }

  window.siteConsent = {
    open: function () { showBanner(true); },
    get: readConsent
  };
}());
