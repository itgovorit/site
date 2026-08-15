import "../src/style.css";
import { Header } from "../src/components/header.js";

// Abbreviation data for the carousel cards.
import items from "../src/data/abc/abbr.json";

// Eagerly resolve every task image to its hashed build URL. Importing the glob
// only pulls in URL strings (not the image bytes), so this is cheap. The actual
// image download is deferred by the lazy-loading observer below.
const imageModules = import.meta.glob("../src/img/abc/abc-task1/*.png", {
  eager: true,
  import: "default",
});
const imagesByLetter = Object.fromEntries(
  Object.entries(imageModules).map(([path, url]) => [
    path.split("/").pop().replace(".png", "").toLowerCase(),
    url,
  ]),
);

// Resolve audio URLs the same way. This only imports tiny URL strings — the
// actual .mp3 bytes are NOT fetched here. Audio is downloaded on demand, when
// the user clicks a sound control (see playSound), so nothing loads up front.
const audioModules = import.meta.glob("../src/audio/abc-task1/*.mp3", {
  eager: true,
  import: "default",
});
const audioByName = Object.fromEntries(
  Object.entries(audioModules).map(([path, url]) => [
    path.split("/").pop().replace(".mp3", "").toLowerCase(),
    url,
  ]),
);

// Inline speaker icon for the sound controls.
const speakerIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5" aria-hidden="true">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
    <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
  </svg>
`;

// Render a sound control only when a matching audio file exists. The control is
// wrapped in an absolutely-positioned span by the caller so it does not affect
// the horizontal centering of the text next to it.
function SoundButton(key, label) {
  if (!audioByName[key]) return "";
  return `
    <button
      type="button"
      data-audio="${key}"
      class="btn btn-circle btn-sm btn-ghost border border-base-content/30 text-base-content/50 hover:border-base-content/50 hover:text-base-content"
      aria-label="${label}"
    >${speakerIcon}</button>
  `;
}

function Explanation() {
  return `
    <section class="mx-auto max-w-3xl space-y-4 px-4 py-10 leading-relaxed">
      <h1 class="text-3xl font-bold">Task #1: Алфавит в аббревиатурах 🔤</h1>
      <p
        Листай карточки, слушай и
        повторяй. Обрати особое внимание на «красную» группу букв.
      </p>
    </section>
  `;
}

// Map a letter's difficulty group to a DaisyUI badge color.
const badgeColorByGroup = {
  green: "badge-success",
  yellow: "badge-warning",
  red: "badge-error",
};

function Card({ letter, color, abbreviation, full, translation, comment }) {
  // Image is set via data-src and swapped to src by the lazy-load observer.
  const imageUrl = imagesByLetter[letter.toLowerCase()];
  const badgeColor = badgeColorByGroup[color] ?? "badge-primary";
  const commentLine = comment
    ? `<div class="divider my-1 before:bg-base-300 after:bg-base-300"></div>
       <p class="text-sm italic text-base-content/70">${comment}</p>`
    : "";

  // Audio keys follow the file naming: letter, abbreviation, abbreviation-full.
  const letterKey = letter.toLowerCase();
  const abbrKey = abbreviation.toLowerCase();
  const fullKey = `${abbrKey}-full`;

  return `
    <div class="carousel-item w-full justify-center">
      <div class="card w-full max-w-sm bg-base-100 shadow-md">
        <figure class="h-36 w-full bg-base-100 sm:h-40">
          <img
            data-src="${imageUrl}"
            alt="Иллюстрация для буквы ${letter} и аббревиатуры ${abbreviation}"
            width="320"
            height="160"
            decoding="async"
            class="h-full w-full object-contain"
          />
        </figure>
        <div class="card-body">
          <div class="divider my-0 before:bg-base-300 after:bg-base-300"></div>
          <button
            type="button"
            data-audio="${letterKey}"
            class="badge ${badgeColor} mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl font-bold"
            aria-label="Прослушать букву ${letter}"
          >${letter}</button>
          <h2 class="card-title mt-3 justify-center">
            <span class="relative inline-block">
              ${abbreviation}
              <span class="absolute left-full top-1/2 ml-2 -translate-y-1/2">
                ${SoundButton(abbrKey, `Прослушать аббревиатуру ${abbreviation} по буквам`)}
              </span>
            </span>
          </h2>
          <p class="mt-3 text-center font-medium">
            <span class="relative inline-block">
              ${full}
              <span class="absolute left-full top-1/2 ml-2 -translate-y-1/2">
                ${SoundButton(fullKey, `Прослушать ${full}`)}
              </span>
            </span>
          </p>
          <p class="mt-3 text-center text-base-content/80">${translation}</p>
          ${commentLine}
        </div>
      </div>
    </div>
  `;
}

function Carousel() {
  return `
    <section class="bg-base-200">
      <div class="mx-auto max-w-3xl px-4 py-16">
        <div
          id="abbr-carousel"
          class="carousel carousel-center w-full space-x-4 rounded-box"
        >
          ${items.map(Card).join("")}
        </div>
        <div class="mt-4 flex items-center justify-center gap-4">
          <button id="carousel-prev" class="btn btn-circle" aria-label="Предыдущая карточка">❮</button>
          <button id="carousel-next" class="btn btn-circle" aria-label="Следующая карточка">❯</button>
        </div>
      </div>
    </section>
  `;
}

function App() {
  return `
    ${Header({ backHref: "/abc/#task1" })}
    <main>
      ${Explanation()}
      ${Carousel()}
    </main>
  `;
}

// Lazy-load images as their slide approaches the visible area of the carousel.
// This prevents all images from downloading at once on page open.
function setupLazyImages() {
  const carousel = document.querySelector("#abbr-carousel");
  if (!carousel) return;

  const images = carousel.querySelectorAll("img[data-src]");

  // Fallback: if IntersectionObserver is unavailable, load everything.
  if (!("IntersectionObserver" in window)) {
    images.forEach((img) => {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        obs.unobserve(img);
      }
    },
    // Root is the horizontal scroll container; preload slightly ahead.
    { root: carousel, rootMargin: "300px" },
  );

  images.forEach((img) => observer.observe(img));
}

// Cyclic navigation. The current card is derived from the actual scroll
// position on every click, so the arrows stay in sync with swipe gestures.
function setupCarouselNav() {
  const carousel = document.querySelector("#abbr-carousel");
  const prev = document.querySelector("#carousel-prev");
  const next = document.querySelector("#carousel-next");
  if (!carousel || !prev || !next) return;

  const slides = carousel.children;
  const count = slides.length;
  if (count === 0) return;

  // Find the slide whose center is closest to the carousel's center.
  const currentIndex = () => {
    const viewCenter =
      carousel.getBoundingClientRect().left + carousel.clientWidth / 2;
    let closest = 0;
    let minDistance = Infinity;
    for (let i = 0; i < count; i++) {
      const rect = slides[i].getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - viewCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closest = i;
      }
    }
    return closest;
  };

  const goTo = (target) => {
    const index = (target + count) % count;
    slides[index].scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  prev.addEventListener("click", () => goTo(currentIndex() - 1));
  next.addEventListener("click", () => goTo(currentIndex() + 1));
}

// Only one sound plays at a time; starting a new one stops the previous.
let currentAudio = null;

// Swap a control's icon for a spinner while its audio loads.
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

// Load (on demand) and play the audio for a clicked control.
function playSound(button) {
  const key = button.dataset.audio;
  const url = audioByName[key];
  if (!url) return;

  // Stop whatever is currently playing before starting the new clip.
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  setButtonLoading(button, true);

  // Creating the Audio here is what triggers the network request — nothing is
  // fetched until this point.
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

// Delegate clicks so a single listener handles every sound control.
function setupAudio() {
  const carousel = document.querySelector("#abbr-carousel");
  if (!carousel) return;
  carousel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-audio]");
    if (button && carousel.contains(button)) playSound(button);
  });
}

document.querySelector("#app").innerHTML = App();
setupLazyImages();
setupCarouselNav();
setupAudio();
