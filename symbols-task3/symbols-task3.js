import "../src/style.css";
import { Header } from "../src/components/header.js";

// Drag-and-drop task definitions.
import tasks from "../src/data/symbols/task3.json";

// Full-bleed background for the play area.
import bgUrl from "../src/img/symbols/task3.jpg";

// Explanation clips, keyed by file name (e.g. "01.mp3") so each task names its
// own clip in task3.json — no reliance on file order. Only URL strings are
// imported here; the .mp3 bytes load on demand when the user presses Listen
// (see playAudio).
const audioModules = import.meta.glob("../src/audio/symbols/task3/*.mp3", {
  eager: true,
  import: "default",
});
const audioByFile = Object.fromEntries(
  Object.entries(audioModules).map(([path, url]) => [path.split("/").pop(), url]),
);

// Fisher–Yates shuffle (returns a new array).
function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// The task order is shuffled on every load, so a returning user does not get the
// same first sentence. Each task names its own clip, so shuffling cannot break
// the pairing. From here on the page works off `deck`, and a task's index means
// its position in the deck, not its position in task3.json.
const deck = shuffle(tasks);

const speakerIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5" aria-hidden="true">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06Z" />
    <path d="M18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
    <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
  </svg>
`;

const arrowIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5" aria-hidden="true">
    <path fill-rule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clip-rule="evenodd" />
  </svg>
`;

function Explanation() {
  const tabs = deck
    .map(
      (_, i) =>
        `<button type="button" class="task-tab tab ${i === 0 ? "tab-active" : ""}" data-target="${i}">${i + 1}</button>`,
    )
    .join("");

  return `
    <section class="mx-auto max-w-3xl space-y-4 px-4 py-10 leading-relaxed">
      <h1 class="text-3xl font-bold">Собери инструкцию 🧩</h1>
      <p>
        Команда написана с ошибкой. Перетащи слова в правильном порядке, чтобы
        объяснить, как её исправить. Лишние слова тоже есть — не попадись!
      </p>
      <div role="tablist" class="tabs tabs-boxed justify-center">${tabs}</div>
    </section>
  `;
}

function Chip(word) {
  return `
    <span class="chip badge badge-lg cursor-grab bg-base-100 px-4 py-5 text-base">${word}</span>
  `;
}

function TaskCard(task, index) {
  const pool = shuffle([...task.sentence, ...task.extraOptions]);
  const isLast = index === deck.length - 1;
  // Takes the Check button's place once the answer is correct (see checkTask).
  // Omitted when the task has no matching clip.
  const playButton = audioByFile[task.audio]
    ? `<button type="button" class="play btn btn-secondary hidden gap-2" aria-label="Listen to the explanation">${speakerIcon} Listen</button>`
    : "";

  return `
    <div
      class="task card w-full max-w-xl bg-base-100/30 shadow-md backdrop-blur-sm ${index === 0 ? "" : "hidden"}"
      data-index="${index}"
    >
      <div class="card-body gap-5">
        <div class="rounded-box bg-base-100 p-3 text-center font-mono text-lg">
          <span class="text-error">${task.incorrect}</span>
          <span class="mx-2">➡️</span>
          <span class="text-success">${task.correct}</span>
        </div>

        <p class="text-sm text-base-content/70">Перетащи слова сюда:</p>
        <div
          class="answer dropzone flex min-h-16 flex-wrap items-center gap-2 rounded-box border-2 border-dashed border-base-300 bg-base-100/60 p-3 transition-colors"
        ></div>

        <p class="text-sm text-base-content/70">Доступные слова:</p>
        <div class="bank dropzone flex min-h-16 flex-wrap items-center gap-2 rounded-box bg-base-200/70 p-3">
          ${pool.map(Chip).join("")}
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <button type="button" class="check btn btn-secondary">Check</button>
          ${playButton}
          <button type="button" class="reset btn btn-ghost">Reset</button>
          ${
            isLast
              ? ""
              : `<button type="button" class="next btn ml-auto hidden gap-1 border-0 bg-base-100/80 backdrop-blur-sm hover:bg-base-100">Next ${arrowIcon}</button>`
          }
        </div>
      </div>
    </div>
  `;
}

function Tasks() {
  return `
    <section class="bg-cover bg-center" style="background-image: url(${bgUrl});">
      <div class="flex min-h-[60vh] items-center justify-center px-4 py-12">
        ${deck.map(TaskCard).join("")}
      </div>
    </section>
  `;
}

function App() {
  return `
    ${Header({ backHref: "/symbols/#task3" })}
    <main>
      ${Explanation()}
      ${Tasks()}
    </main>
  `;
}

// Show only the chosen task and highlight its tab.
function showTask(index) {
  if (index < 0 || index >= deck.length) return;
  document
    .querySelectorAll(".task-tab")
    .forEach((t) => t.classList.toggle("tab-active", Number(t.dataset.target) === index));
  document
    .querySelectorAll(".task")
    .forEach((el) => el.classList.toggle("hidden", Number(el.dataset.index) !== index));
}

// --- Drag and drop via Pointer Events (works for mouse, touch, and pen) ---

let drag = null; // { chip, ghost, taskEl, offsetX, offsetY }

// Which chip (if any) the dragged chip should be inserted before, based on the
// pointer position. Uses reading order (row, then column) so it works when the
// chips wrap onto multiple rows.
function getInsertBeforeElement(zone, x, y) {
  const chips = [...zone.querySelectorAll(".chip:not(.dragging)")];
  const pointerKey = y * 100000 + x;
  for (const chip of chips) {
    const box = chip.getBoundingClientRect();
    const key = (box.top + box.height / 2) * 100000 + (box.left + box.width / 2);
    if (pointerKey < key) return chip;
  }
  return null;
}

function onPointerDown(event) {
  const chip = event.target.closest(".chip");
  if (!chip) return;
  const taskEl = chip.closest(".task");
  if (!taskEl || taskEl.dataset.locked === "true") return;

  event.preventDefault();

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
    taskEl,
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

  const { ghost, offsetX, offsetY, chip, taskEl } = drag;
  ghost.style.left = `${event.clientX - offsetX}px`;
  ghost.style.top = `${event.clientY - offsetY}px`;

  // The ghost has pointer-events: none, so elementFromPoint ignores it.
  const under = document.elementFromPoint(event.clientX, event.clientY);
  const zone = under?.closest?.(".dropzone");
  if (!zone || !taskEl.contains(zone)) return;

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

function setupDragAndDrop() {
  const root = document.querySelector("#app");
  if (root) root.addEventListener("pointerdown", onPointerDown);
}

// --- Audio playback (one clip at a time, loaded on demand) ---
let currentAudio = null;

function setPlayLoading(button, loading) {
  if (loading) {
    if (button.dataset.originalHtml === undefined) {
      button.dataset.originalHtml = button.innerHTML;
    }
    button.innerHTML =
      '<span class="loading loading-spinner loading-sm"></span> Загрузка';
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

function playAudio(button) {
  // The clip is named by the task itself, found via the card's deck position.
  const task = deck[Number(button.closest(".task")?.dataset.index)];
  const url = audioByFile[task?.audio];
  if (!url) return;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  setPlayLoading(button, true);
  // Creating the Audio here is what triggers the network request — nothing is
  // fetched until this point.
  const audio = new Audio(url);
  currentAudio = audio;

  audio.addEventListener("playing", () => setPlayLoading(button, false), {
    once: true,
  });
  audio.addEventListener("ended", () => {
    if (currentAudio === audio) currentAudio = null;
  });
  audio.addEventListener(
    "error",
    () => {
      setPlayLoading(button, false);
      if (currentAudio === audio) currentAudio = null;
    },
    { once: true },
  );

  audio.play().catch(() => setPlayLoading(button, false));
}

// --- Clicks: tabs, play, check, reset, next ---
function setupClicks() {
  const root = document.querySelector("#app");
  if (!root) return;
  root.addEventListener("click", (event) => {
    const tab = event.target.closest(".task-tab");
    if (tab) {
      showTask(Number(tab.dataset.target));
      return;
    }

    const nextBtn = event.target.closest(".next");
    if (nextBtn) {
      showTask(Number(nextBtn.closest(".task").dataset.index) + 1);
      return;
    }

    const playBtn = event.target.closest(".play");
    if (playBtn) {
      playAudio(playBtn);
      return;
    }

    const taskEl = event.target.closest(".task");
    if (!taskEl) return;
    if (event.target.closest(".check")) checkTask(taskEl);
    else if (event.target.closest(".reset")) resetTask(taskEl);
  });
}

function checkTask(taskEl) {
  const task = deck[Number(taskEl.dataset.index)];
  if (!task) return;

  const answer = taskEl.querySelector(".answer");
  const words = [...answer.querySelectorAll(".chip")].map((chip) =>
    chip.textContent.trim(),
  );

  if (words.length === 0) return;

  const isCorrect =
    words.join(" ").toLowerCase() === task.sentence.join(" ").toLowerCase();

  // Color the answer container's border instead of showing text feedback.
  answer.classList.remove("border-base-300", "border-success", "border-error");
  answer.classList.add(isCorrect ? "border-success" : "border-error");

  if (isCorrect) {
    taskEl.dataset.locked = "true";
    taskEl.querySelectorAll(".chip").forEach((chip) => {
      chip.classList.remove("cursor-grab");
      chip.classList.add("cursor-default");
    });
    // The task is solved, so Check has nothing left to do: swap it for Listen
    // so the user can hear the explanation read aloud.
    const checkBtn = taskEl.querySelector(".check");
    checkBtn.disabled = true;
    checkBtn.classList.add("hidden");
    taskEl.querySelector(".play")?.classList.remove("hidden");
    // Reveal the Next button (absent on the last task).
    taskEl.querySelector(".next")?.classList.remove("hidden");
  }
}

function resetTask(taskEl) {
  const bank = taskEl.querySelector(".bank");
  const answer = taskEl.querySelector(".answer");
  answer.querySelectorAll(".chip").forEach((chip) => bank.appendChild(chip));
  delete taskEl.dataset.locked;
  // Bring Check back and hide Listen again.
  const checkBtn = taskEl.querySelector(".check");
  checkBtn.disabled = false;
  checkBtn.classList.remove("hidden");
  taskEl.querySelector(".play")?.classList.add("hidden");
  taskEl.querySelector(".next")?.classList.add("hidden");
  // Restore the neutral border.
  answer.classList.remove("border-success", "border-error");
  answer.classList.add("border-base-300");
  taskEl.querySelectorAll(".chip").forEach((chip) => {
    chip.classList.add("cursor-grab");
    chip.classList.remove("cursor-default");
  });
}

document.querySelector("#app").innerHTML = App();
setupDragAndDrop();
setupClicks();
