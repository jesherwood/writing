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
    const revealButton = document.getElementById('reveal');
    const emailTarget = document.getElementById('email');

    if (revealButton && emailTarget) {
        revealButton.addEventListener('click', function() {
            revealButton.hidden = true;
            revealButton.setAttribute('aria-expanded', 'true');
            const email = ['jenniferlyonsagency', 'gmail.com'].join('@');
            emailTarget.innerHTML = `<a href="mailto:${email}">${email}</a>`;
            emailTarget.querySelector('a')?.focus();
        });
    }
});
