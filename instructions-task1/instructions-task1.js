import "../src/style.css";
import { Header } from "../src/components/header.js";

import items from "../src/data/instructions/task1.json";

// Section backdrop, tiled horizontally.
import bgUrl from "../src/img/instructions/task1/background.jpeg";

// Card illustrations, keyed by file name (e.g. "open.png").
const imageModules = import.meta.glob("../src/img/instructions/task1/*.png", {
  eager: true,
  import: "default",
});
const imageByFile = Object.fromEntries(
  Object.entries(imageModules).map(([path, url]) => [path.split("/").pop(), url]),
);

// Word pronunciation clips, keyed by file stem (e.g. "open"). Only URL strings
// are imported here; the .mp3 bytes load on demand when Play is pressed.
const audioModules = import.meta.glob("../src/audio/instructions/*.mp3", {
  eager: true,
  import: "default",
});
const audioByKey = Object.fromEntries(
  Object.entries(audioModules).map(([path, url]) => [
    path.split("/").pop().replace(".mp3", ""),
    url,
  ]),
);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const speakerIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5" aria-hidden="true">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
    <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
  </svg>
`;

// Rotate arrow: flipping the card is a rotation, so this reads as "turn it back".
const flipBackIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-7 w-7" aria-hidden="true">
    <path fill-rule="evenodd" d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z" clip-rule="evenodd" />
  </svg>
`;

function Explanation() {
  return `
    <section class="mx-auto max-w-3xl space-y-4 px-4 py-10 leading-relaxed">
      <h1 class="text-3xl font-bold">Экшены 🎬</h1>
      <p>
        Посмотри на картинку и попробуй вспомнить глагол. Нажми на карточку, чтобы
        проверить себя, и послушай, как это звучит. Перевод спрятан — кликни по
        нему, если нужно.
      </p>
    </section>
  `;
}

function Card(item) {
  const key = item.image.replace(".png", "");
  const image = imageByFile[item.image];
  const word = escapeHtml(item.word);

  const playButton = audioByKey[key]
    ? `<button type="button" class="play btn btn-circle btn-sm btn-ghost border border-base-content/30 text-base-content/60 hover:border-base-content/60 hover:text-base-content"
         data-audio="${key}" aria-label="Прослушать ${word}">${speakerIcon}</button>`
    : "";

  // Comments are authored content in our own data file and may contain simple
  // inline markup (<i>, <strong>, <em>…), so they are injected as HTML.
  const comment = item.comment
    ? `<p class="px-4 text-center text-sm text-base-content/70">${item.comment}</p>`
    : "";

  return `
    <div class="carousel-item w-full justify-center">
      <div class="flip-card h-80 w-full cursor-pointer">
        <div class="flip-card-inner">
          <div class="flip-card-front flex items-center justify-center rounded-box bg-base-100 p-4 shadow-md">
            ${
              image
                ? `<img src="${image}" alt="" class="max-h-full max-w-full object-contain" />`
                : `<span class="text-base-content/40">${escapeHtml(item.image)}</span>`
            }
          </div>
          <div class="flip-card-back flex flex-col items-center justify-center gap-2 rounded-box bg-base-100 px-6 pb-16 pt-6 shadow-md">
            <div class="flex items-center gap-2">
              <span class="text-3xl font-bold">${word}</span>
              ${playButton}
            </div>
            <span class="font-mono text-base text-base-content/50">${escapeHtml(item.transcription)}</span>
            <span class="spoiler text-sm">${escapeHtml(item.translation)}</span>
            ${comment}
            <button type="button"
              class="flip-back btn btn-circle btn-ghost absolute bottom-2 left-1/2 -translate-x-1/2 text-base-content/50 hover:text-base-content"
              aria-label="Показать картинку">${flipBackIcon}</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function Carousel() {
  return `
    <section class="bg-base-200 bg-repeat-x bg-center" style="background-image: url(${bgUrl});">
      <div class="mx-auto flex max-w-sm flex-col items-center gap-6 px-4 py-12">
        <div id="reel" class="carousel w-full rounded-box">
          ${items.map(Card).join("")}
        </div>
        <div class="flex items-center gap-4">
          <button type="button" class="nav btn btn-circle" data-dir="-1" aria-label="Назад">❮</button>
          <span id="counter" class="w-16 text-center text-sm font-medium text-base-content/70"></span>
          <button type="button" class="nav btn btn-circle" data-dir="1" aria-label="Вперёд">❯</button>
        </div>
      </div>
    </section>
  `;
}

function App() {
  return `
    ${Header({ backHref: "/instructions/#task1" })}
    <main>
      ${Explanation()}
      ${Carousel()}
    </main>
  `;
}

// --- Carousel: the visible card is tracked in JS, never derived from scrollLeft ---
let index = 0;

function show(next, behavior = "smooth") {
  const reel = document.querySelector("#reel");
  const cards = [...reel.children];
  index = Math.min(Math.max(next, 0), cards.length - 1);

  // Items are exactly one reel wide, so offsetLeft maps straight to scrollLeft.
  const left = cards[index].offsetLeft - cards[0].offsetLeft;
  reel.scrollTo({ left, behavior });

  document.querySelector("#counter").textContent = `${index + 1} / ${cards.length}`;
  document.querySelectorAll(".nav").forEach((btn) => {
    const dir = Number(btn.dataset.dir);
    btn.disabled = dir < 0 ? index === 0 : index === cards.length - 1;
  });
}

// --- On-demand audio playback (one clip at a time) ---
let currentAudio = null;

function playSound(key) {
  const url = audioByKey[key];
  if (!url) return;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  currentAudio = new Audio(url);
  currentAudio.play().catch(() => {});
}

function setup() {
  const root = document.querySelector("#app");
  if (!root) return;

  root.addEventListener("click", (event) => {
    // Play the word (must not also flip the card).
    const play = event.target.closest(".play");
    if (play) {
      event.stopPropagation();
      playSound(play.dataset.audio);
      return;
    }

    // Reveal the blurred translation.
    const spoiler = event.target.closest(".spoiler");
    if (spoiler) {
      event.stopPropagation();
      spoiler.classList.add("revealed");
      return;
    }

    // Carousel arrows.
    const nav = event.target.closest(".nav");
    if (nav) {
      show(index + Number(nav.dataset.dir));
      return;
    }

    // Turn the card back over to the image side.
    const flipBack = event.target.closest(".flip-back");
    if (flipBack) {
      event.stopPropagation();
      const target = flipBack.closest(".flip-card");
      target.classList.remove("flipped");
      target.classList.add("cursor-pointer");
      return;
    }

    // Flip a card to reveal the word.
    const card = event.target.closest(".flip-card");
    if (card && !card.classList.contains("flipped")) {
      card.classList.add("flipped");
      card.classList.remove("cursor-pointer");
    }
  });

  // Keep the tracked index in sync when the user swipes/scrolls by hand.
  const reel = document.querySelector("#reel");
  let syncTimer = null;
  reel.addEventListener("scroll", () => {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      const step = reel.clientWidth || 1;
      const nearest = Math.round(reel.scrollLeft / step);
      if (nearest !== index) show(nearest, "auto");
    }, 120);
  });

  show(0, "auto");
}

document.querySelector("#app").innerHTML = App();
setup();
