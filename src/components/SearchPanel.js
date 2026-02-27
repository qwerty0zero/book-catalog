import { searchBooks, getPopularBooks } from '../api/openLibrary.js';
import { addFavorite, removeFavorite, isFavorite } from '../services/favorites.js';
import { createBookCard, createSkeletonCards, updateFavoriteButtonState } from './BookCard.js';
import { debounce } from '../utils/debounce.js';
import { $ } from '../utils/dom.js';

/** Debounce delay (ms) for live search */
const DEBOUNCE_DELAY = 500;

/** Cached search results for client-side author filtering */
let cachedResults = [];
let currentPage = 1;
let currentQuery = '';
let isLoadingMore = false;
let hasMore = true;

/**
 * Initialize all search panel interactions.
 * @param {Function} onFavoritesChange - Called after favorites are mutated
 */
export function initSearchPanel(onFavoritesChange) {
    const searchInput = $('#search-input');
    const searchBtn = $('#search-btn');
    const resultsGrid = $('#results-grid');
    const stateMsg = $('#state-message');
    const authorFilter = $('#author-filter');
    const resultsTitle = resultsGrid.previousElementSibling;

    // ----- Search button click -----
    searchBtn.addEventListener('click', () => {
        performSearch(searchInput.value, true);
    });

    // ----- Enter key in search input -----
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') performSearch(searchInput.value, true);
    });

    // ----- Live search with debounce (bonus feature) -----
    searchInput.addEventListener(
        'input',
        debounce(() => performSearch(searchInput.value, true), DEBOUNCE_DELAY),
    );

    // ----- Author Filter Change -----
    authorFilter.addEventListener('change', () => {
        applyLocalFilter();
    });

    // ----- Sync from external changes -----
    document.addEventListener('favorites:sync', () => {
        // Just update the buttons of existing cards instead of full re-render
        const cards = resultsGrid.querySelectorAll('.book-card');
        cards.forEach(card => {
            const key = card.dataset.key;
            const btn = card.querySelector('.btn--fav');
            if (btn) {
                updateFavoriteButtonState(btn, isFavorite(key));
            }
        });
    });

    // ----- Intersection Observer for infinite scroll -----
    const sentinel = $('#scroll-sentinel');
    let observer;
    if (sentinel) {
        observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isLoadingMore && hasMore && cachedResults.length > 0) {
                performSearch(currentQuery, false);
            }
        }, { rootMargin: '200px' });
        observer.observe(sentinel);
    }

    // ----- Initial load -----
    performSearch('', true);

    // ----- Helpers -----

    /**
     * Fetch books from the API and render results.
     * @param {string} query
     * @param {boolean} isNewSearch
     */
    async function performSearch(query, isNewSearch = true) {
        const trimmed = query.trim();

        if (isNewSearch) {
            currentPage = 1;
            hasMore = true;
            cachedResults = [];
            currentQuery = trimmed;
            resultsTitle.textContent = trimmed ? 'Search Results' : 'Popular Books';
            showState('Loading...', false);
            showSkeletons();
        }

        if (!hasMore || isLoadingMore) return;
        isLoadingMore = true;

        if (!isNewSearch) {
            showState('Loading more...', false);
        }

        try {
            const books = currentQuery ? await searchBooks(currentQuery, currentPage) : await getPopularBooks(currentPage);

            if (books.length < 20) {
                hasMore = false;
            }

            if (isNewSearch && !books.length) {
                showState('Nothing found. Try a different query.', false);
                clearGrid();
                updateAuthorFilter([]);
            } else if (books.length > 0) {
                clearState();
                cachedResults.push(...books);
                updateAuthorFilter(cachedResults);
                if (isNewSearch) {
                    renderResults(books, onFavoritesChange);
                } else {
                    appendResults(books, onFavoritesChange);
                }
            } else {
                clearState();
            }
            currentPage++;
        } catch (err) {
            const isNetwork = err.message.startsWith('NETWORK_ERROR');
            showState(
                isNetwork ? 'Network error. Please check your connection.' : 'An error occurred.',
                true,
            );
            if (isNewSearch) {
                clearGrid();
                updateAuthorFilter([]);
            }
            console.error('[SearchPanel]', err);
        } finally {
            isLoadingMore = false;
            if (!hasMore && cachedResults.length > 0) {
                // optionally show end of list
            }
        }
    }

    /**
     * Update the author filter dropdown.
     * @param {BookResult[]} books 
     */
    function updateAuthorFilter(books) {
        const currentSelection = authorFilter.value;
        const authors = new Set();
        books.forEach(b => b.authors.forEach(a => authors.add(a)));

        const sortedAuthors = Array.from(authors).sort();

        authorFilter.innerHTML = '<option value="">All Authors</option>';
        sortedAuthors.forEach(author => {
            const option = document.createElement('option');
            option.value = author;
            option.textContent = author;
            authorFilter.appendChild(option);
        });
        authorFilter.value = currentSelection;
    }

    /**
     * Render book cards, optionally filtered by author input.
     * @param {BookResult[]} books
     * @param {Function} onFavoritesChange
     */
    function renderResults(books, onFavoritesChange) {
        clearGrid();

        if (!books.length) {
            return;
        }

        clearState();

        const fragment = document.createDocumentFragment();
        books.forEach((book, index) => {
            const card = createBookCard(book, {
                onFavoriteToggle: (b, btn) => {
                    const isFav = isFavorite(b.key);
                    if (isFav) {
                        removeFavorite(b.key);
                    } else {
                        addFavorite(b);
                    }
                    updateFavoriteButtonState(btn, !isFav);
                    onFavoritesChange();
                },
            });
            // Delay staggered animation
            card.style.animationDelay = `${index * 0.05}s`;
            fragment.appendChild(card);
        });

        resultsGrid.appendChild(fragment);
        applyLocalFilter(); // Update visibility without re-rendering elements
    }

    /**
     * Append new book cards to grid.
     */
    function appendResults(books, onFavoritesChange) {
        if (!books.length) return;

        const fragment = document.createDocumentFragment();
        books.forEach((book, index) => {
            const card = createBookCard(book, {
                onFavoriteToggle: (b, btn) => {
                    const isFav = isFavorite(b.key);
                    if (isFav) {
                        removeFavorite(b.key);
                    } else {
                        addFavorite(b);
                    }
                    updateFavoriteButtonState(btn, !isFav);
                    onFavoritesChange();
                },
            });
            card.style.animationDelay = `${index * 0.05}s`;
            fragment.appendChild(card);
        });

        resultsGrid.appendChild(fragment);
        applyLocalFilter();
    }

    /**
     * Hide/show existing DOM elements based on author filter criteria.
     */
    function applyLocalFilter() {
        const filterValue = authorFilter.value;
        const cards = resultsGrid.querySelectorAll('.book-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const key = card.dataset.key;
            const book = cachedResults.find(b => b.key === key);
            if (!book) return;

            const isVisible = !filterValue || book.authors.includes(filterValue);
            card.style.display = isVisible ? '' : 'none';
            if (isVisible) visibleCount++;
        });

        if (visibleCount === 0 && cards.length > 0) {
            showState('No books match the author filter.', false);
        } else if (visibleCount > 0) {
            clearState();
        }
    }

    function showSkeletons() {
        clearGrid();
        resultsGrid.appendChild(createSkeletonCards(8));
    }

    function clearGrid() {
        resultsGrid.innerHTML = '';
    }

    function showState(message, isError) {
        stateMsg.textContent = message;
        stateMsg.classList.toggle('state-message--error', isError);
    }

    function clearState() {
        stateMsg.textContent = '';
        stateMsg.classList.remove('state-message--error');
    }
}