import "../src/style.css";
import { Header } from "../src/components/header.js";

// The same verbs as task 1; only the pictures are used here.
import items from "../src/data/instructions/task1.json";

// Verb pictures, keyed by file name (e.g. "open.png").
const verbModules = import.meta.glob("../src/img/instructions/task1/*.png", {
  eager: true,
  import: "default",
});
const verbByFile = Object.fromEntries(
  Object.entries(verbModules).map(([path, url]) => [path.split("/").pop(), url]),
);

// After the first form the verb follows another word, so it loses its capital:
// "Zoom in" -> "Don't zoom in".
function lowerFirst(verb) {
  return verb.charAt(0).toLowerCase() + verb.slice(1);
}

// One carousel per instruction form, in the order the lesson introduces them.
// `phrase` builds the caption for whichever verb is currently in the ring.
// The ring is drawn below rather than loaded as art, so it stays sharp at any
// size. `tone` names a colour variant in the stylesheet and defaults to green:
// red and struck through for the prohibition, which is the sign everyone
// already reads as "don't", and amber for the request, which is neither an
// instruction nor a ban but a question.
const FORMS = [
  { badge: "❗", phrase: (verb) => `${verb}!` },
  { tone: "forbidden", phrase: (verb) => `Don't ${lowerFirst(verb)}` },
  { badge: "🤝", phrase: (verb) => `Let's ${lowerFirst(verb)}` },
  { badge: "❓", tone: "question", phrase: (verb) => `Can you ${lowerFirst(verb)}?` },
];

// Ring geometry, in a 0–100 viewBox that doubles as a percentage of the stage.
// Stroke weights: the lip is the wider, darker pass and the body sits on top of
// it, so 1.25 of lip shows as an edge either side. The bar is stroked at the
// same two weights as the ring, which is how a prohibition sign is drawn.
const RING_RADIUS = 44;
const LIP_WIDTH = 7;
const BODY_WIDTH = 4.5;
// The bar runs at 45° and stops on the ring's centre line rather than short of
// it. The ring is painted afterwards and is wider than the bar, so it covers
// both ends: the bar reads as running inner edge to inner edge with no cap
// showing. Endpoints are the radius projected onto each axis, hence cos 45°.
const BAR_REACH = RING_RADIUS * Math.SQRT1_2;
const BAR_FROM = (50 - BAR_REACH).toFixed(2);
const BAR_TO = (50 + BAR_REACH).toFixed(2);

// Where the badge sits on the ring, in degrees counter-clockwise from 3
// o'clock. All three badges share it, so the four rings line up as a set. The
// diagonal is also the only direction with room to overhang: on a square stage
// a badge at 0° or 90° would be clipped.
const BADGE_ANGLE = -45;

function Badge(form) {
  if (!form.badge) return "";
  const rad = (BADGE_ANGLE * Math.PI) / 180;
  const left = 50 + RING_RADIUS * Math.cos(rad);
  const top = 50 - RING_RADIUS * Math.sin(rad);
  return `
    <span class="ring-badge" style="left: ${left.toFixed(1)}%; top: ${top.toFixed(1)}%">
      ${form.badge}
    </span>`;
}

// Each shape is stroked twice, lip then body: the darker edge left showing
// either side is what reads as an inked outline rather than a plain circle.
// Both colours come from the theme, via .ring-frame.
//
// The bar is drawn before the ring on purpose. Painting the ring last buries
// the bar's ends inside the ring's own stroke, so no end edge is ever visible —
// and since the ring's body covers the bar's body in the same colour, the two
// meet without a seam.
function Ring(form) {
  const bar = (color, width) =>
    form.tone === "forbidden"
      ? `<line
             x1="${BAR_FROM}" y1="${BAR_FROM}" x2="${BAR_TO}" y2="${BAR_TO}"
             stroke="${color}" stroke-width="${width}"
           />`
      : "";
  const ring = (color, width) =>
    `<circle cx="50" cy="50" r="${RING_RADIUS}" stroke="${color}" stroke-width="${width}" />`;

  return `
    <div
      class="ring-frame pointer-events-none absolute inset-0${form.tone ? ` is-${form.tone}` : ""}"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" fill="none" class="h-full w-full">
        ${bar("var(--ring-lip)", LIP_WIDTH)}
        ${bar("var(--ring-body)", BODY_WIDTH)}
        ${ring("var(--ring-lip)", LIP_WIDTH)}
        ${ring("var(--ring-body)", BODY_WIDTH)}
      </svg>
      ${Badge(form)}
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Fisher–Yates shuffle (returns a new array).
function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const arrows = {
  prev: "❮",
  next: "❯",
};

function Carousel(form, formIndex) {
  // Each row gets its own order, so the verbs do not line up across rows.
  const order = shuffle(items);
  const slides = order
    .map(
      (item) => `
        <div class="carousel-item flex h-full w-full items-center justify-center">
          <img
            src="${verbByFile[item.image]}"
            alt="${escapeHtml(item.word)}"
            class="h-[64%] w-[64%] object-contain"
          />
        </div>`,
    )
    .join("");

  // The card keeps the ring and its caption together as one unit.
  return `
    <div
      class="carousel-block card bg-base-100 shadow-sm"
      data-index="0"
      data-form="${formIndex}"
    >
      <div class="card-body items-center gap-3 py-5">
        <div class="flex items-center justify-center gap-3">
          <button type="button" class="nav btn btn-circle" data-dir="-1" aria-label="Назад">${arrows.prev}</button>

          <!-- The picture scrolls underneath; the ring stays put on top of
               whichever verb is in view. 64% keeps the artwork inside the ring. -->
          <div class="stage relative h-40 w-40 shrink-0 sm:h-48 sm:w-48">
            <div class="reel carousel h-full w-full rounded-box">
              ${slides}
            </div>
            ${Ring(form)}
          </div>

          <button type="button" class="nav btn btn-circle" data-dir="1" aria-label="Вперёд">${arrows.next}</button>
        </div>

        <p class="phrase text-center text-xl font-semibold" aria-live="polite">
          ${escapeHtml(form.phrase(order[0].word))}
        </p>
      </div>
    </div>
  `;
}

function Explanation() {
  return `
    <section class="mx-auto max-w-3xl space-y-4 px-4 py-10 leading-relaxed">
      <h1 class="text-3xl font-bold">Шпаргалка: инструкции 🔖</h1>
      <p>
        Четыре формы инструкции.
      </p>
    </section>
  `;
}

function App() {
  return `
    ${Header({ backHref: "/instructions/#bookmark" })}
    <main>
      ${Explanation()}
      <section class="bg-base-200 px-4 py-12">
        <div class="mx-auto flex max-w-3xl flex-col gap-8">
          ${FORMS.map(Carousel).join("")}
        </div>
      </section>
    </main>
  `;
}

// --- Carousels: the visible slide is tracked in JS, never read from scrollLeft -

// Caption for the verb now in the ring, in this row's form.
function setPhrase(block, index) {
  const form = FORMS[Number(block.dataset.form)];
  const verb = block.querySelectorAll(".carousel-item img")[index]?.alt;
  if (!form || !verb) return;
  block.querySelector(".phrase").textContent = form.phrase(verb);
}

function show(block, next, behavior = "smooth") {
  const reel = block.querySelector(".reel");
  const slides = [...reel.children];
  const count = slides.length;

  // Wraps round, so neither arrow is ever a dead end.
  const wrapped = next < 0 || next >= count;
  const index = ((next % count) + count) % count;
  block.dataset.index = String(index);
  setPhrase(block, index);

  // Slides are exactly one stage wide, so offsetLeft maps straight to scrollLeft.
  const left = slides[index].offsetLeft - slides[0].offsetLeft;
  // "instant" rather than "auto": DaisyUI's .carousel sets scroll-behavior:
  // smooth, and a wrap would otherwise sweep past every slide.
  reel.scrollTo({ left, behavior: wrapped ? "instant" : behavior });
}

function setup() {
  const root = document.querySelector("#app");
  if (!root) return;

  root.addEventListener("click", (event) => {
    const nav = event.target.closest(".nav");
    if (!nav) return;
    const block = nav.closest(".carousel-block");
    show(block, Number(block.dataset.index) + Number(nav.dataset.dir));
  });

  // Keep the tracked index honest when the user swipes the strip by hand.
  for (const block of document.querySelectorAll(".carousel-block")) {
    const reel = block.querySelector(".reel");
    let timer = null;
    reel.addEventListener("scroll", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const step = reel.clientWidth || 1;
        const nearest = Math.round(reel.scrollLeft / step);
        const last = reel.children.length - 1;
        const index = Math.min(Math.max(nearest, 0), last);
        block.dataset.index = String(index);
        // A swipe changes the verb too, so the caption has to follow.
        setPhrase(block, index);
      }, 120);
    });
  }
}

document.querySelector("#app").innerHTML = App();
setup();
