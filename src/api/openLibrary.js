const BASE_URL = 'https://openlibrary.org';
const COVER_URL = 'https://covers.openlibrary.org/b/id';

/** Max results to fetch per query */
const LIMIT = 20;

/**
 * Search books by query string.
 * @param {string} query - Search term (title, author, keyword)
 * @returns {Promise<BookResult[]>}
 */
export async function searchBooks(query, page = 1) {
    if (!query.trim()) {
        throw new Error('EMPTY_QUERY');
    }

    const url = new URL(`${BASE_URL}/search.json`);
    url.searchParams.set('q', query.trim());
    url.searchParams.set('limit', LIMIT);
    url.searchParams.set('page', page);
    url.searchParams.set('fields', 'key,title,author_name,first_publish_year,cover_i');

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error(`NETWORK_ERROR: ${response.status}`);
    }

    const data = await response.json();

    // Normalize raw API docs into a consistent shape
    return (data.docs || []).map(normalizeBook);
}

/**
 * Build the cover image URL for a given cover ID.
 * @param {number} coverId
 * @param {'S'|'M'|'L'} [size='M']
 * @returns {string}
 */
export function getCoverUrl(coverId, size = 'M') {
    return `${COVER_URL}/${coverId}-${size}.jpg`;
}

/**
 * Normalize a raw Open Library doc into a flat BookResult object.
 * @param {object} doc - Raw doc from API
 * @returns {BookResult}
 */
function normalizeBook(doc) {
    return {
        key: doc.key || '',          // e.g. "/works/OL82563W"
        title: doc.title || 'Unknown title',
        authors: doc.author_name || [],
        year: doc.first_publish_year || null,
        coverId: doc.cover_i || null,
    };
}

/**
 * Fetch popular books.
 * @returns {Promise<BookResult[]>}
 */
export async function getPopularBooks(page = 1) {
    const url = new URL(`${BASE_URL}/search.json`);
    url.searchParams.set('q', 'subject:fiction');
    url.searchParams.set('limit', LIMIT);
    url.searchParams.set('page', page);
    url.searchParams.set('sort', 'rating'); // sort by rating for popular
    url.searchParams.set('fields', 'key,title,author_name,first_publish_year,cover_i');

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error(`NETWORK_ERROR: ${response.status}`);
    }

    const data = await response.json();
    return (data.docs || []).map(normalizeBook);
}