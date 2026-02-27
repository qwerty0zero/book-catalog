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

        upBtn.disabled = scrollTop <= 0;
        downBtn.disabled = scrollTop >= maxScroll - 5;
    }, { passive: true });
}
initScrollArrows();

/** Initialize Mobile Favorites Drawer logic */
function initMobileDrawer() {
    const handle = $('#favorites-drawer-handle');
    const drawer = $('#favorites-drawer');

    if (handle && drawer) {
        handle.addEventListener('click', () => {
            if (window.innerWidth <= 760) {
                drawer.classList.toggle('is-expanded');
            }
        });
    }
}
initMobileDrawer();