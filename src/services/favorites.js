const STORAGE_KEY = 'book_catalog_favorites';

let favoritesCache = null;

/**
 * Read the full favorites array from localStorage.
 * @returns {BookResult[]}
 */
export function getFavorites() {
    if (favoritesCache === null) {
        try {
            favoritesCache = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch {
            favoritesCache = [];
        }
    }
    return favoritesCache;
}

/**
 * Check if a book (by key) is in favorites.
 * @param {string} key
 * @returns {boolean}
 */
export function isFavorite(key) {
    return getFavorites().some((b) => b.key === key);
}

/**
 * Add a book to favorites (no-op if already present).
 * @param {BookResult} book
 */
export function addFavorite(book) {
    const favorites = getFavorites();
    if (!favorites.some((b) => b.key === book.key)) {
        favorites.push(book);
        save(favorites);
    }
}

/**
 * Remove a book from favorites by key.
 * @param {string} key
 */
export function removeFavorite(key) {
    const updated = getFavorites().filter((b) => b.key !== key);
    save(updated);
}

/**
 * Persist favorites array to localStorage.
 * @param {BookResult[]} favorites
 */
function save(favorites) {
    favoritesCache = favorites;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}