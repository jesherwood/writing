// Main JavaScript file
document.addEventListener('DOMContentLoaded', function() {
    // Add current year to footer
    const footer = document.querySelector('footer');
    const currentYear = new Date().getFullYear();
    if (footer) {
        footer.innerHTML = `&copy; ${currentYear} Jesse Sherwood`;
    }

    // Add reading time estimate to articles
    const articles = document.querySelectorAll('article');
    articles.forEach(article => {
        const text = article.textContent;
        const wordCount = text.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute
        
        const meta = article.querySelector('.article-meta');
        if (meta) {
            meta.innerHTML += ` · ${readingTime} min read`;
        }
    });
});
// Sync --content-width with rendered hero heading width.
// Measures the width of `.hero-heading h1` and writes it to :root as --content-width.
// Runs after DOM content is ready and after fonts load (if available), and on window resize (debounced).
(function() {
    function debounce(fn, wait) {
        let t;
        return function(...args) {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    function updateContentWidth() {
        const hero = document.querySelector('.hero-heading h1');
        if (!hero) return;

        // Measure rendered width of the hero heading
        const rect = hero.getBoundingClientRect();
        let width = rect.width;

        // Clamp so it never exceeds viewport minus a small margin
        const margin = 32; // px
        const maxAllowed = Math.max(window.innerWidth - margin, 0);
        const finalWidth = Math.min(width, maxAllowed);

        // Write CSS variable on :root
        document.documentElement.style.setProperty('--content-width', Math.floor(finalWidth) + 'px');
    }

    function updateAfterFonts() {
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(updateContentWidth).catch(updateContentWidth);
        } else {
            // If Font Loading API not available, just run immediately
            updateContentWidth();
        }
    }

    const debouncedUpdate = debounce(updateAfterFonts, 100);
    window.addEventListener('resize', debouncedUpdate);

    // Run on DOM ready (or immediately if already ready)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateAfterFonts);
    } else {
        updateAfterFonts();
    }
})();