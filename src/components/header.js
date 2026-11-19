// Importing the asset lets Vite hash and bundle it (self-contained output).
import logoUrl from "../logo.svg";

// The back button returns to the page the user actually came from, when that
// was another page of this site: a lesson opened from the checkpoint goes back
// to the checkpoint, not to the home page. `backHref` is the fallback for when
// there is no such page — opened from a bookmark, an outside link, or a new tab.
function cameFromThisSite() {
  if (!document.referrer || history.length < 2) return false;
  try {
    const from = new URL(document.referrer);
    return from.origin === location.origin && from.pathname !== location.pathname;
  } catch {
    return false;
  }
}

// One listener for the whole page, so it works whatever renders the header.
document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-back]");
  if (!link) return;
  // Ctrl/Cmd/middle-click keep their normal "open in new tab" behaviour.
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (!cameFromThisSite()) return;
  event.preventDefault();
  history.back();
});

// Shared site header used across all pages so the navbar stays consistent.
// Pass a `backHref` to show a green back button in the left corner.
export function Header({ backHref } = {}) {
  const backButton = backHref
    ? `
      <a href="${backHref}" data-back class="btn btn-ghost btn-circle text-2xl text-secondary" aria-label="Назад">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </a>
    `
    : "";

  return `
    <header class="navbar bg-base-200 shadow-sm">
      <div class="navbar-start">
        ${backButton}
      </div>
      <div class="navbar-center">
        <a class="btn btn-ghost gap-2 text-xl" href="/">
          <img src="${logoUrl}" alt="IT Govorit logo " class="h-8 w-auto" />
        </a>
      </div>
      <div class="navbar-end"></div>
    </header>
  `;
}
