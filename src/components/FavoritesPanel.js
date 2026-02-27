import { getFavorites, removeFavorite } from '../services/favorites.js';
import { createBookCard } from './BookCard.js';
import { $ } from '../utils/dom.js';

/**
 * Render (or re-render) the favorites grid.
 * Called on initial load and whenever favorites change.
 * @param {Function} onFavoritesChange - Callback to update badge count etc.
 */
export function renderFavoritesPanel(onFavoritesChange) {
    const grid = $('#favorites-grid');
    const favorites = getFavorites();

    grid.innerHTML = '';

    const fragment = document.createDocumentFragment();

    favorites.forEach((book, index) => {
        const handleRemove = (key) => {
            const el = document.querySelector(`#favorites-grid .book-card[data-key="${key}"]`);
            if (el) {
                el.classList.remove('fade-in');
                el.classList.add('fade-out');
                el.addEventListener('animationend', () => {
                    removeFavorite(key);
                    onFavoritesChange();
                    document.dispatchEvent(new Event('favorites:sync'));
                }, { once: true });
            } else {
                removeFavorite(key);
                onFavoritesChange();
                document.dispatchEvent(new Event('favorites:sync'));
            }
        };

        const card = createBookCard(book, {
            onFavoriteToggle: (b) => {
                handleRemove(b.key);
            },
            onRemove: (key) => {
                handleRemove(key);
            },
        });

        // Add zero delay so they pop right away but still use the fade-in keyframes 
        // to avoid restarting animation for the entire grid with huge delays on add
        card.style.animationDelay = `0.0s`;

        fragment.appendChild(card);
    });

    grid.appendChild(fragment);
}