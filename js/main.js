// Main JavaScript file
document.addEventListener('DOMContentLoaded', function() {
    const footer = document.querySelector('footer');
    if (footer) {
        footer.innerHTML = `&copy; ${new Date().getFullYear()} Jesse Sherwood`;
    }

    const overlayNav = document.querySelector('.has-overlay-menu nav');
    const hamburger = overlayNav?.querySelector('.hamburger');
    const menu = overlayNav?.querySelector('.menu');
    const menuLinks = menu ? Array.from(menu.querySelectorAll('a')) : [];

    if (overlayNav && hamburger) {
        const firstVisitKey = 'menuShownThisSession';
        const setMenuState = (isOpen) => {
            overlayNav.classList.toggle('menu-open', isOpen);
            document.body.classList.toggle('menu-open', isOpen);
            hamburger.setAttribute('aria-expanded', String(isOpen));
            hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
            menu?.setAttribute('aria-hidden', String(!isOpen));
        };
        const closeMenu = () => {
            setMenuState(false);
            hamburger.focus();
        };

        const shouldOpenByDefault = !sessionStorage.getItem(firstVisitKey);
        setMenuState(shouldOpenByDefault);

        if (shouldOpenByDefault) {
            sessionStorage.setItem(firstVisitKey, 'true');
        }

        hamburger.addEventListener('click', function() {
            const isOpen = overlayNav.classList.contains('menu-open');
            setMenuState(!isOpen);
            if (!isOpen) {
                menuLinks[0]?.focus();
            }
        });

        document.addEventListener('click', function(event) {
            if (!overlayNav.classList.contains('menu-open')) return;
            if (overlayNav.contains(event.target)) return;
            closeMenu();
        });

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeMenu();
            }
        });
    }
    function setupReveal(buttonId, targetId, emailParts) {
        const btn = document.getElementById(buttonId);
        const target = document.getElementById(targetId);
        if (!btn || !target) return;
        btn.addEventListener('click', function() {
            btn.hidden = true;
            btn.setAttribute('aria-expanded', 'true');
            const email = emailParts.join('@');
            target.innerHTML = `<h4><a href="mailto:${email}">${email}</a></h4>`;
            target.querySelector('a')?.focus();
        });
    }

    setupReveal('reveal',       'email',       ['jenniferlyonsagency', 'gmail.com']);
    setupReveal('reveal-media', 'email-media', ['Rebecca.Malzahn',     'BlackstonePublishing.com']);
});
