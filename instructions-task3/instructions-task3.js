import "../src/style.css";
import { Header } from "../src/components/header.js";
import { getInsertBeforeElement } from "../src/components/chip-drag.js";

// Five requests, each split into chunks that have to be put back in order.
import task from "../src/data/instructions/task3.json";

// The call the requests belong to, behind the exercise.
import bgUrl from "../src/img/instructions/task3/background.jpeg";

const SENTENCES = task.sentences;

// A clip per sentence, named by the data. Only URL strings are imported here;
// the bytes load when the user presses play.
const audioModules = import.meta.glob("../src/audio/instructions/task3/*.mp3", {
  eager: true,
  import: "default",
});
const audioByFile = Object.fromEntries(
  Object.entries(audioModules).map(([path, url]) => [path.split("/").pop(), url]),
);

const speakerIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5" aria-hidden="true">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
    <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
  </svg>
`;

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

// Shuffle, but never hand back the finished sentence.
function scramble(chunks) {
  if (chunks.length < 2) return [...chunks];
  const correct = chunks.join("\u0000");
  let mixed = shuffle(chunks);
  // Two chunks have only one wrong arrangement, so this settles immediately.
  for (let i = 0; i < 20 && mixed.join("\u0000") === correct; i++) {
    mixed = shuffle(chunks);
  }
  return mixed;
}

// --- Pill colours -----------------------------------------------------------
// Blue while unjudged, then green or red per position once Check is pressed.
const STATES = ["badge-info", "badge-success", "badge-error"];

function paint(chip, state) {
  chip.classList.remove(...STATES);
  chip.classList.add(state);
}

function Row(sentence, index) {
  const chips = scramble(sentence.chunks)
    .map(
      (chunk) =>
        // Smaller type and tighter padding on phones, so a whole sentence still
        // fits on one line in portrait.
        `<span class="chip badge badge-info badge-lg cursor-grab px-2 py-4 text-xs sm:px-4 sm:py-5 sm:text-base">${escapeHtml(chunk)}</span>`,
    )
    .join("");

  return `
    <div class="sentence" data-index="${index}">
      <!-- Generous gap and side padding: a chunk is inserted by comparing the
           pointer with each pill's centre, so the space between pills is the
           target you have to hit. The extra px gives somewhere to aim when
           dropping before the first pill or after the last. -->
      <div
        class="row dropzone flex min-h-16 flex-wrap items-center gap-2 rounded-box border border-base-300 bg-base-100/60 px-4 py-3 sm:min-h-20 sm:gap-4 sm:px-8 sm:py-4"
      >
        ${chips}
      </div>
      <!-- Shown once this sentence is fully correct: the clip of the finished
           sentence plus its translation. Laid out from the start and only
           unseen, so revealing it shifts nothing. -->
      <div class="translation invisible flex items-center gap-2 px-4 pt-1 sm:px-8">
        ${
          // h-11 w-11 is the 44px tap target used across the site.
          audioByFile[sentence.audio]
            ? `<button
                type="button"
                class="play btn btn-circle btn-ghost h-11 min-h-0 w-11 border border-base-content/30 p-0 text-base-content/60 hover:border-base-content/60 hover:text-base-content"
                data-audio="${escapeHtml(sentence.audio)}"
                aria-label="Прослушать: ${escapeHtml(sentence.chunks.join(" "))}"
              >${speakerIcon}</button>`
            : ""
        }
        <p class="text-sm text-base-content/70">
          ${escapeHtml(sentence.translation ?? "")}
        </p>
      </div>
    </div>
  `;
}

function Explanation() {
  return `
    <section class="mx-auto max-w-3xl space-y-4 px-4 py-10 leading-relaxed">
      <h1 class="text-3xl font-bold">Собери инструкции 🙏</h1>
      <p>
        Тебе же не нужны инструкции по сбору инструкций? 
      </p>
    </section>
  `;
}

function App() {
  return `
    ${Header({ backHref: "/instructions/#task3" })}
    <main>
      ${Explanation()}
      <section class="bg-cover bg-center" style="background-image: url(${bgUrl});">
        <div class="mx-auto max-w-3xl px-4 py-12">
          <!-- Translucent panel over the photo, as on the symbols drag task. -->
          <div class="card bg-base-100/30 shadow-md backdrop-blur-sm">
            <div class="card-body gap-4">
              ${SENTENCES.map(Row).join("")}
              <button type="button" class="check btn btn-secondary mt-2 self-center">Check</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  `;
}

// --- Drag and drop via Pointer Events (mouse, touch and pen) ---------------
//
// Same approach as the symbols drag task, with one extra rule: a chunk may only
// be dropped back into the row it came from.

let drag = null; // { chip, ghost, row, offsetX, offsetY }

function onPointerDown(event) {
  const chip = event.target.closest(".chip");
  if (!chip) return;
  const row = chip.closest(".row");
  if (!row) return;

  event.preventDefault();

  // Moving a chunk invalidates the verdict for its row.
  resetRow(row);

  const rect = chip.getBoundingClientRect();
  const ghost = chip.cloneNode(true);
  ghost.classList.add("chip-ghost");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    margin: "0",
    pointerEvents: "none",
    zIndex: "50",
    opacity: "0.9",
  });
  document.body.appendChild(ghost);

  chip.classList.add("dragging", "opacity-40");

  drag = {
    chip,
    ghost,
    row,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top,
  };

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
}

function onPointerMove(event) {
  if (!drag) return;
  event.preventDefault();

  const { ghost, offsetX, offsetY, chip, row } = drag;
  ghost.style.left = `${event.clientX - offsetX}px`;
  ghost.style.top = `${event.clientY - offsetY}px`;

  // The ghost has pointer-events: none, so elementFromPoint sees through it.
  const under = document.elementFromPoint(event.clientX, event.clientY);
  const zone = under?.closest?.(".dropzone");
  // Only the chunk's own row accepts it; dragging over another row does nothing.
  if (zone !== row) return;

  const before = getInsertBeforeElement(zone, event.clientX, event.clientY);
  if (before == null) zone.appendChild(chip);
  else zone.insertBefore(chip, before);
}

function onPointerUp() {
  if (!drag) return;
  drag.ghost.remove();
  drag.chip.classList.remove("dragging", "opacity-40");
  drag = null;
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
  window.removeEventListener("pointercancel", onPointerUp);
}

// --- Checking ---------------------------------------------------------------

function resetRow(row) {
  row.querySelectorAll(".chip").forEach((chip) => paint(chip, "badge-info"));
  // The arrangement changed, so last round's translation no longer applies.
  row
    .closest(".sentence")
    ?.querySelector(".translation")
    ?.classList.add("invisible");
}

// Grades all five rows at once: a chunk is green when it sits at the index it
// holds in the source data. No sentence repeats a chunk, so position is exact.
// A sentence that is right all the way through also reveals its translation.
function checkAll() {
  document.querySelectorAll(".sentence").forEach((sentence) => {
    const correct = SENTENCES[Number(sentence.dataset.index)].chunks;
    const chips = [...sentence.querySelectorAll(".chip")];

    let allInPlace = true;
    chips.forEach((chip, i) => {
      const inPlace = chip.textContent.trim() === correct[i];
      if (!inPlace) allInPlace = false;
      paint(chip, inPlace ? "badge-success" : "badge-error");
    });

    sentence
      .querySelector(".translation")
      .classList.toggle("invisible", !allInPlace);
  });
}

// --- On-demand audio playback (one clip at a time) -------------------------
let currentAudio = null;

function playSound(file) {
  const url = audioByFile[file];
  if (!url) return;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  // Creating the Audio here is what fetches the file; nothing loads before this.
  currentAudio = new Audio(url);
  currentAudio.play().catch(() => {});
}

function setup() {
  const root = document.querySelector("#app");
  if (!root) return;

  root.addEventListener("pointerdown", onPointerDown);
  root.addEventListener("click", (event) => {
    const play = event.target.closest(".play");
    if (play) {
      // A hidden button cannot be reached by pointer or keyboard, but the gate
      // is checked here too so the clip is tied to the sentence being solved
      // rather than to the button merely being on screen.
      const revealed = !play
        .closest(".translation")
        ?.classList.contains("invisible");
      if (revealed) playSound(play.dataset.audio);
      return;
    }
    if (event.target.closest(".check")) checkAll();
  });
}

document.querySelector("#app").innerHTML = App();
setup();
