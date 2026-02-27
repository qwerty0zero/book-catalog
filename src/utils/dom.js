/**
 * Shorthand for document.querySelector.
 * @param {string} selector
 * @param {Element} [root=document]
 * @returns {Element|null}
 */
export const $ = (selector, root = document) => root.querySelector(selector);

/**
 * Shorthand for document.querySelectorAll (returns array).
 * @param {string} selector
 * @param {Element} [root=document]
 * @returns {Element[]}
 */
export const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

/**
 * Create an element with optional class names and inner HTML.
 * @param {string} tag
 * @param {string[]} [classes=[]]
 * @param {string} [html='']
 * @returns {HTMLElement}
 */
export function createElement(tag, classes = [], html = '') {
    const el = document.createElement(tag);
    if (classes.length) el.classList.add(...classes);
    if (html) el.innerHTML = html;
    return el;
}

/**
 * Show/hide an element with a CSS class toggle.
 * @param {Element} el
 * @param {boolean} visible
 */
export function toggleVisible(el, visible) {
    el.style.display = visible ? '' : 'none';
}