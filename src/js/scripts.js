//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Only the one-page layout has a masthead and in-page anchor sections.
    const hasMasthead = !!document.body.querySelector('.masthead');

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0 && hasMasthead) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element.
    // Subpages are skipped: they have no anchor sections to spy on, and their relative
    // nav hrefs ('../blog/') make Bootstrap call document.querySelector with an invalid
    // selector, which throws and takes down everything below this line.
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav && hasMasthead) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Blog category filter (blog index only; without JS every post stays visible)
    const blogFilter = document.querySelector('.blog-filter');
    if (blogFilter) {
        const buttons = [].slice.call(blogFilter.querySelectorAll('.blog-filter__btn'));
        const items = [].slice.call(document.querySelectorAll('.blog-index__item'));

        blogFilter.addEventListener('click', event => {
            const clicked = event.target.closest('.blog-filter__btn');
            if (!clicked) {
                return;
            }

            buttons.forEach(button => {
                const active = button === clicked;
                button.classList.toggle('is-active', active);
                button.setAttribute('aria-pressed', String(active));
            });

            const filter = clicked.dataset.filter;
            items.forEach(item => {
                const categories = (item.dataset.categories || '').split(' ');
                item.hidden = filter !== 'ALL' && categories.indexOf(filter) === -1;
            });
        });
    }

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});