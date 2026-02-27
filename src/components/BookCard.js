
import { getCoverUrl } from '../api/openLibrary.js';
import { isFavorite } from '../services/favorites.js';
/**
 * @param {BookResult} book
 * @param {object} handlers
 * @param {Function} handlers.onFavoriteToggle - Called with (book) when fav button clicked
 * @param {Function} [handlers.onRemove]       - Called with (book.key) when remove button clicked
 * @returns {HTMLElement}
 */
export function createBookCard(book, { onFavoriteToggle, onRemove } = {}) {
    const card = document.createElement('article');
    card.classList.add('book-card', 'fade-in');
    card.dataset.key = book.key;

    // ----- Cover -----
    const coverSection = buildCover(book.coverId, book.title);
    card.appendChild(coverSection);

    // ----- Body -----
    const body = document.createElement('div');
    body.classList.add('book-card__body');

    const title = document.createElement('h3');
    title.classList.add('book-card__title');
    title.textContent = book.title;
    title.title = book.title; // tooltip for truncated titles

    const author = document.createElement('p');
    author.classList.add('book-card__author');
    author.textContent = book.authors.length
        ? book.authors.join(', ')
        : 'Unknown author';

    const year = document.createElement('p');
    year.classList.add('book-card__year');
    year.textContent = book.year ? book.year : 'Year unknown';

    body.append(title, author, year);
    card.appendChild(body);

    // ----- Actions -----
    const actions = document.createElement('div');
    actions.classList.add('book-card__actions');

    // Favorite button
    const favBtn = buildFavButton(book);
    favBtn.addEventListener('click', () => {
        onFavoriteToggle?.(book, favBtn);
    });
    actions.appendChild(favBtn);

    // Remove button (only shown in favorites panel)
    if (onRemove) {
        const removeBtn = document.createElement('button');
        removeBtn.classList.add('btn', 'btn--icon');
        removeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="var(--color-danger)" stroke="var(--color-danger)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
        removeBtn.setAttribute('title', 'Remove from favorites');
        removeBtn.addEventListener('click', () => onRemove(book.key));
        actions.appendChild(removeBtn);
    }

    card.appendChild(actions);
    return card;
}

/**
 * Build cover image or placeholder.
 * @param {number|null} coverId
 * @param {string} title
 * @returns {HTMLElement}
 */
function buildCover(coverId, title) {
    if (coverId) {
        const img = document.createElement('img');
        img.classList.add('book-card__cover');
        img.src = getCoverUrl(coverId, 'M');
        img.alt = `Cover of ${title}`;
        img.loading = 'lazy';
        // Fall back to placeholder if image fails to load
        img.addEventListener('error', () => {
            img.replaceWith(buildPlaceholder());
        });
        return img;
    }
    return buildPlaceholder();
}

/**
 * Build a gray placeholder for books without covers.
 * @returns {HTMLElement}
 */
function buildPlaceholder() {
    const div = document.createElement('div');
    div.classList.add('book-card__cover-placeholder');
    div.innerHTML = `
    <img src="/assets/icons/book-open.svg" alt="" aria-hidden="true" />
    <span>No cover</span>
  `;
    return div;
}

/**
 * Build the favorite toggle button with the correct initial state.
 * @param {BookResult} book
 * @returns {HTMLButtonElement}
 */
function buildFavButton(book) {
    const btn = document.createElement('button');
    btn.classList.add('btn', 'btn--fav');
    const active = isFavorite(book.key);
    updateFavoriteButtonState(btn, active);
    return btn;
}

/**
 * Updates the visual state of the favorite button.
 * @param {HTMLButtonElement} btn
 * @param {boolean} isActive
 */
export function updateFavoriteButtonState(btn, isActive) {
    if (isActive) {
        btn.classList.add('btn--fav-active');
        btn.textContent = '★ Saved';
    } else {
        btn.classList.remove('btn--fav-active');
        btn.textContent = '☆ Favorite';
    }
}

/**
 * Create skeleton placeholder cards for the loading state.
 * @param {number} [count=6]
 * @returns {DocumentFragment}
 */
export function createSkeletonCards(count = 6) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
        const card = document.createElement('article');
        card.classList.add('book-card', 'book-card--skeleton');

        const cover = document.createElement('div');
        cover.classList.add('book-card__cover', 'skeleton');

        const body = document.createElement('div');
        body.classList.add('book-card__body');
        body.innerHTML = `
      <div class="skeleton-line skeleton"></div>
      <div class="skeleton-line skeleton skeleton-line--short"></div>
      <div class="skeleton-line skeleton skeleton-line--short"></div>
    `;

        card.append(cover, body);
        fragment.appendChild(card);
    }
    return fragment;
}