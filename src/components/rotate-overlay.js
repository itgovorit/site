// Reusable "please rotate your device" overlay. Visibility is controlled purely
// by CSS (see .rotate-overlay in style.css): it only shows on portrait phones.
// Drop the returned markup anywhere on a page that needs landscape.
export function RotateOverlay(message = "Поверни телефон 🔄") {
  return `
    <div class="rotate-overlay fixed inset-0 z-50 flex-col items-center justify-center gap-6 bg-base-100 p-8 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-20 w-20 text-primary" aria-hidden="true">
        <rect x="7" y="3" width="10" height="18" rx="2" />
        <path d="M12 18h.01" />
        <path d="M3.5 9a9 9 0 0 1 3-3.5" stroke-linecap="round" />
        <path d="M20.5 15a9 9 0 0 1-3 3.5" stroke-linecap="round" />
      </svg>
      <div class="max-w-xs space-y-2">
        <p class="text-2xl font-bold">${message}</p>
        <p class="text-base-content/70">
          Это упражнение удобнее проходить в горизонтальном режиме.
        </p>
      </div>
    </div>
  `;
}
