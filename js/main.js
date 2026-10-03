/* ==========================================================================
   Site behaviour: footer year, overlay menu, contact reveal, reactions toggle.

   Loaded with `defer`, so the document is already parsed by the time this runs
   and no DOMContentLoaded wrapper is needed.
   ========================================================================== */
(function () {
  'use strict';

  /* --- Footer ------------------------------------------------------------ */

  // The footer is real markup on every page, so it renders without JS and
  // costs no layout shift; this only keeps the year from going stale.
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* --- Overlay menu ------------------------------------------------------ */

  var overlayNav = document.querySelector('.has-overlay-menu nav');
  var hamburger = overlayNav && overlayNav.querySelector('.hamburger');
  var menu = overlayNav && overlayNav.querySelector('.menu');

  if (overlayNav && hamburger && menu) {
    var FIRST_VISIT_KEY = 'menuShownThisSession';
    var menuLinks = Array.prototype.slice.call(menu.querySelectorAll('a'));

    function setMenuState(isOpen) {
      overlayNav.classList.toggle('menu-open', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      // `inert` takes the closed panel out of the tab order and the
      // accessibility tree at once, and — because the panel covers the page
      // even when transparent — stops its links swallowing clicks meant for
      // the content underneath.
      menu.inert = !isOpen;
    }

    function closeMenu() {
      // Focus moves first: making the panel inert while focus is still inside
      // it would drop focus to the document body.
      hamburger.focus();
      setMenuState(false);
    }

    function isOpen() {
      return overlayNav.classList.contains('menu-open');
    }

    // sessionStorage throws when site data is blocked. Failing just means the
    // menu greets the visitor again, which is harmless.
    function readFlag(key) {
      try { return window.sessionStorage.getItem(key); } catch (err) { return null; }
    }

    function writeFlag(key, value) {
      try { window.sessionStorage.setItem(key, value); } catch (err) { /* ignore */ }
    }

    var forceClosed = new URLSearchParams(location.search).has('nomenu');
    var openByDefault = document.body.classList.contains('home') &&
      !forceClosed && !readFlag(FIRST_VISIT_KEY);

    setMenuState(openByDefault);
    if (openByDefault) writeFlag(FIRST_VISIT_KEY, 'true');

    hamburger.addEventListener('click', function () {
      var willOpen = !isOpen();
      setMenuState(willOpen);
      if (willOpen && menuLinks[0]) menuLinks[0].focus();
    });

    document.addEventListener('click', function (event) {
      if (!isOpen()) return;
      if (overlayNav.contains(event.target)) return;
      // The consent banner sits above the menu rather than behind it, so
      // answering it is not a click "outside" — on the home page the menu and
      // the banner come up together on a first visit, and dismissing the menu
      // to accept or decline would hide the nav the visitor had not used yet.
      if (event.target.closest('.consent-banner')) return;
      closeMenu();
    });

    // Guarded on menu-open: closeMenu() moves focus to the hamburger, so firing
    // it for every Escape would yank focus to the top of the page when
    // something else (the consent banner) was what Escape dismissed.
    document.addEventListener('keydown', function (event) {
      if (!isOpen()) return;

      if (event.key === 'Escape') {
        closeMenu();
        return;
      }

      // The open panel covers the whole page, so Tab cycles within it rather
      // than wandering through content the visitor cannot see. This matters on
      // the home page, where the menu opens by itself on the first visit.
      if (event.key !== 'Tab') return;

      // ...but the consent banner sits *above* the panel, so trapping Tab while
      // it is up would leave a keyboard visitor unable to reach Accept/Decline
      // at all — exactly the first-visit case on the home page, where menu and
      // banner appear together. Consent has to stay reachable, so the trap
      // stands down until the banner is answered or dismissed.
      if (document.querySelector('.consent-banner:not([hidden])')) return;

      var stops = [hamburger].concat(menuLinks);
      var last = stops[stops.length - 1];

      if (!overlayNav.contains(document.activeElement)) {
        event.preventDefault();
        stops[0].focus();
        return;
      }

      var edge = event.shiftKey ? stops[0] : last;
      if (document.activeElement !== edge) return;
      event.preventDefault();
      (event.shiftKey ? last : stops[0]).focus();
    });
  }

  /* --- Contact reveal ----------------------------------------------------- */

  // Addresses are assembled here rather than written into the markup, so a
  // scraper reading the page source finds nothing to harvest.
  var ADDRESSES = {
    general: ['contact', 'jessesherwood.com'],
    agent: ['jenniferlyonsagency', 'gmail.com'],
    media: ['Rebecca.Malzahn', 'BlackstonePublishing.com']
  };

  document.querySelectorAll('[data-reveal]').forEach(function (btn) {
    var parts = ADDRESSES[btn.dataset.reveal];
    var target = btn.parentElement.querySelector('.reveal-target');
    if (!parts || !target) return;

    btn.addEventListener('click', function () {
      var address = parts.join('@');
      var heading = document.createElement('h4');
      var link = document.createElement('a');
      link.href = 'mailto:' + address;
      link.textContent = address;
      heading.appendChild(link);

      target.replaceChildren(heading);
      btn.hidden = true;
      // The control that was focused has just been removed from the page, so
      // focus has to be placed deliberately or it falls back to <body>.
      link.focus();
    });
  });

  /* --- Reactions -------------------------------------------------------- */

  // The blurbs collapse behind this button at every width: there are enough of
  // them that leaving them open pushes the pre-order links off a desktop screen
  // too, not just a phone.
  var reactionsToggle = document.getElementById('reactions-toggle');
  var reactionsContent = document.getElementById('reactions-content');

  if (reactionsToggle && reactionsContent) {
    reactionsToggle.addEventListener('click', function () {
      var expanded = reactionsContent.classList.toggle('is-open');
      reactionsToggle.setAttribute('aria-expanded', String(expanded));
    });
  }
}());
