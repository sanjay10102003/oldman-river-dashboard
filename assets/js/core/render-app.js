/**
 * Renders the app shell into the page. Runs before core/dom.js so every
 * element the app looks up already exists.
 */

document.body.insertAdjacentHTML("afterbegin", AppShell());
