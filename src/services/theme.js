const STORAGE_KEY = 'book_catalog_theme';

/** Available themes */
export const THEMES = [
    { id: 'light', label: 'Light', dotColor: '#f5f5f5' },
    { id: 'dark',  label: 'Dark',  dotColor: '#1e293b' },
];

/**
 * Load the saved theme and apply it to the document.
 * Falls back to 'light'.
 */
export function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY) || 'light';
    applyTheme(saved);
}

/**
 * Switch to a theme by id and persist the choice.
 * @param {string} themeId
 */
export function setTheme(themeId) {
    applyTheme(themeId);
    localStorage.setItem(STORAGE_KEY, themeId);
}

/**
 * Get the currently active theme id.
 * @returns {string}
 */
export function getTheme() {
    return document.body.classList.contains('dark') ? 'dark' : 'light';
}

/**
 * Apply a theme by setting class on <body>.
 * @param {string} themeId
 */
function applyTheme(themeId) {
    const isDark = themeId === 'dark';
    document.body.classList.toggle('dark', isDark);
}