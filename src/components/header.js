// Importing the asset lets Vite hash and bundle it (self-contained output).
import logoUrl from "../logo.png";

// Shared site header used across all pages so the navbar stays consistent.
// Pass a `backHref` to show a red back button in the left corner.
export function Header({ backHref } = {}) {
  const backButton = backHref
    ? `
      <a href="${backHref}" class="btn btn-ghost btn-circle text-2xl text-error" aria-label="Назад">
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
