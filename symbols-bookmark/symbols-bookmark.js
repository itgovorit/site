import "../src/style.css";
import { Header } from "../src/components/header.js";

import symbols from "../src/data/symbols/symbol-list.json";

// Symbol name clips (lowercase, non-alphanumerics collapsed to dashes). Only URL
// strings are imported; .mp3 bytes load on demand when a control is clicked.
const audioModules = import.meta.glob("../src/audio/symbols/*.mp3", {
  eager: true,
  import: "default",
});
const audioByKey = Object.fromEntries(
  Object.entries(audioModules).map(([path, url]) => [
    path.split("/").pop().replace(".mp3", ""),
    url,
  ]),
);

// Turn a spoken name into its audio-file key.
function soundKey(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// American English transcription for each symbol's primary name.
const IPA = {
  "%": "/pərˈsɛnt/",
  ".": "/dɑːt/",
  $: "/ˈdɑːlər saɪn/",
  "X X": "/speɪs/",
  "@": "/æt/",
  "&": "/ˈæmpərˌsænd/",
  "X_X": "/ˈʌndərˌskɔːr/",
  "X-X": "/ˈhaɪfən/",
  "/": "/ˈfɔːrwərd slæʃ/",
  "*": "/ˈæstərɪsk/",
  "#": "/hæʃ/",
  "!": "/ˌɛkskləˈmeɪʃən mɑːrk/",
  "?": "/ˈkwɛstʃən mɑːrk/",
  ":": "/ˈkoʊlən/",
  ";": "/ˈsɛmiˌkoʊlən/",
  "X,": "/ˈkɑːmə/",
  "=": "/ˈiːkwəlz saɪn/",
  "X'": "/ˈsɪŋɡəl kwoʊt/",
  '"': "/ˈdʌbəl kwoʊt/",
  "\\": "/ˈbækˌslæʃ/",
  "( )": "/raʊnd ˈbrækɪts/",
  "[ ]": "/skwɛr ˈbrækɪts/",
  "{ }": "/ˈkɜːrli ˈbreɪsɪz/",
  "|": "/paɪp/",
};

// The circle should show the actual glyph, not the "X" placeholder letters that
// the matching game uses to mark surrounding characters.
function displaySymbol(symbol) {
  const glyph = symbol.replace(/X/g, "").trim();
  return glyph === "" ? "␣" : glyph;
}

const speakerIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5" aria-hidden="true">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
    <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
  </svg>
`;

// h-11 w-11 is a 44px target, the smallest comfortable size for a thumb (and the
// WCAG 2.5.5 minimum). min-h-0 and p-0 stop DaisyUI's own button sizing from
// fighting it.
function SoundButton(key, label) {
  if (!audioByKey[key]) return "";
  return `
    <button type="button" data-audio="${key}"
      class="btn btn-circle btn-ghost h-11 min-h-0 w-11 p-0 border border-base-content/30 text-base-content/60 hover:border-base-content/60 hover:text-base-content"
      aria-label="${label}">${speakerIcon}</button>
  `;
}

// One line per name: the word on the left, its sound button pushed to the right
// edge. min-w-0 lets a long name wrap instead of pushing the button out.
function NamePlay(name, extraClass = "") {
  return `
    <span class="flex w-full items-center justify-between gap-2 ${extraClass}">
      <span class="min-w-0">${name}</span>
      ${SoundButton(soundKey(name), `Прослушать «${name}»`)}
    </span>
  `;
}

function Cell({ symbol, names }) {
  const [primary, ...rest] = names;
  const ipa = IPA[symbol] ?? "";

  // Alternative names stack, so each one gets its own line with the name at the
  // left and its button at the right, matching the primary name above.
  const restRow = rest.length
    ? `<div class="flex flex-col gap-2 text-base text-base-content/80">
        ${rest.map((n) => NamePlay(n)).join("")}
      </div>`
    : "";

  return `
    <div class="w-[calc(50%-0.375rem)] rounded-box bg-base-100 shadow sm:w-52">
      <div class="flex flex-col gap-2 p-4">
        <span class="badge badge-warning flex h-14 w-14 items-center justify-center self-center rounded-full text-2xl font-bold">${displaySymbol(symbol)}</span>
        ${NamePlay(primary, "text-lg font-medium")}
        ${ipa ? `<span class="font-mono text-sm text-base-content/70">${ipa}</span>` : ""}
        ${restRow}
      </div>
    </div>
  `;
}

function Grid() {
  return `
    <section class="mx-auto max-w-4xl px-4 py-8">
      <h1 class="mb-2 text-2xl font-bold">Шпаргалка: символы ⌨️</h1>
      <p class="mb-6 text-base-content/70">
        Символ, его название и транскрипция (американский вариант). У некоторых
        символов есть несколько названий. Жми 🔊, чтобы послушать.
      </p>
      <div class="flex flex-wrap justify-center gap-3">
        ${symbols.map(Cell).join("")}
      </div>
    </section>
  `;
}

function App() {
  return `
    ${Header({ backHref: "/symbols/" })}
    <main>
      ${Grid()}
    </main>
  `;
}

// --- On-demand audio playback (one clip at a time) ---
let currentAudio = null;

function setButtonLoading(button, loading) {
  if (loading) {
    if (button.dataset.originalHtml === undefined) {
      button.dataset.originalHtml = button.innerHTML;
    }
    button.innerHTML = '<span class="loading loading-spinner loading-sm"></span>';
    button.classList.add("pointer-events-none");
    button.setAttribute("aria-busy", "true");
  } else {
    if (button.dataset.originalHtml !== undefined) {
      button.innerHTML = button.dataset.originalHtml;
      delete button.dataset.originalHtml;
    }
    button.classList.remove("pointer-events-none");
    button.removeAttribute("aria-busy");
  }
}

function playSound(button) {
  const url = audioByKey[button.dataset.audio];
  if (!url) return;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  setButtonLoading(button, true);
  const audio = new Audio(url);
  currentAudio = audio;

  const clearLoading = () => setButtonLoading(button, false);
  audio.addEventListener("playing", clearLoading, { once: true });
  audio.addEventListener("ended", () => {
    if (currentAudio === audio) currentAudio = null;
  });
  audio.addEventListener(
    "error",
    () => {
      clearLoading();
      if (currentAudio === audio) currentAudio = null;
    },
    { once: true },
  );

  audio.play().catch(() => clearLoading());
}

document.querySelector("#app").innerHTML = App();

document.querySelector("#app").addEventListener("click", (event) => {
  const button = event.target.closest("[data-audio]");
  if (button) playSound(button);
});
