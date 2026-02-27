import { initTheme } from './services/theme.js';
import { getFavorites } from './services/favorites.js';
import { mountThemeSwitcher } from './components/ThemeSwitcher.js';
import { initSearchPanel } from './components/SearchPanel.js';
import { renderFavoritesPanel } from './components/FavoritesPanel.js';
import { $ } from './utils/dom.js';


/** Apply saved theme before first paint */
initTheme();

/** Mount theme switcher dropdown into header controls */
mountThemeSwitcher($('.header__controls'));

/** Update the favorites badge count */
function updateBadge() {
    const badge = $('#favorites-count');
    if (badge) badge.textContent = getFavorites().length;
}

/**
 * Called whenever the favorites list changes.
 * Re-renders the badge and the favorites panel.
 */
function onFavoritesChange() {
    updateBadge();
    renderFavoritesPanel(onFavoritesChange);
}


/** Initialize search panel with favorite-change callback */
initSearchPanel(onFavoritesChange);

/** Render initial favorites badge and panel */
onFavoritesChange();

/** Initialize Scroll Arrows logic */
function initScrollArrows() {
    const upBtn = $('#scroll-up-btn');
    const downBtn = $('#scroll-down-btn');

    if (!upBtn || !downBtn) return;

    upBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    downBtn.addEventListener('click', () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        // Block up button if already at top
        upBtn.disabled = scrollTop <= 0;

        // Block down button if already at bottom 
        // using a 5px threshold to deal with subpixel rendering bugs
        downBtn.disabled = scrollTop >= maxScroll - 5;
    }, { passive: true });
}
initScrollArrows();