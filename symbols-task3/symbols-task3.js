import "../src/style.css";
import { Header } from "../src/components/header.js";

// Drag-and-drop task definitions.
import tasks from "../src/data/symbols/task2.json";

// Full-bleed background for the play area.
import bgUrl from "../src/img/symbols/task3.jpg";

// Fisher–Yates shuffle (returns a new array).
function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const arrowIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5" aria-hidden="true">
    <path fill-rule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clip-rule="evenodd" />
  </svg>
`;

function Explanation() {
  const tabs = tasks
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
  const isLast = index === tasks.length - 1;

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
        ${tasks.map(TaskCard).join("")}
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
  if (index < 0 || index >= tasks.length) return;
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

// --- Clicks: tabs, check, reset, next ---
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

    const taskEl = event.target.closest(".task");
    if (!taskEl) return;
    if (event.target.closest(".check")) checkTask(taskEl);
    else if (event.target.closest(".reset")) resetTask(taskEl);
  });
}

function checkTask(taskEl) {
  const task = tasks[Number(taskEl.dataset.index)];
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
    taskEl.querySelector(".check").disabled = true;
    taskEl.querySelectorAll(".chip").forEach((chip) => {
      chip.classList.remove("cursor-grab");
      chip.classList.add("cursor-default");
    });
    // Reveal the Next button (absent on the last task).
    taskEl.querySelector(".next")?.classList.remove("hidden");
  }
}

function resetTask(taskEl) {
  const bank = taskEl.querySelector(".bank");
  const answer = taskEl.querySelector(".answer");
  answer.querySelectorAll(".chip").forEach((chip) => bank.appendChild(chip));
  delete taskEl.dataset.locked;
  taskEl.querySelector(".check").disabled = false;
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
