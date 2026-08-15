// Confluence-style warning panel using muted theme colors. Shared across pages.
// Pass a custom `label` (e.g. "⚠️") or set it to "" for no label.
export function Warning(content, { label = "⚠️ Важно:" } = {}) {
  const labelHtml = label ? `<span class="font-semibold">${label}</span> ` : "";
  return `
    <aside class="rounded-lg border-l-4 border-warning/60 bg-base-200 px-4 py-3 text-base-content/80">
      ${labelHtml}${content}
    </aside>
  `;
}
