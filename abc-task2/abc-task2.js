import "../src/style.css";
import { Header } from "../src/components/header.js";

// Task definitions (audio + multiple-choice answers).
import tasks from "../src/data/abc/task.json";

// Resolve task audio URLs. Only URL strings are imported here — the .mp3 bytes
// are fetched on demand when the user presses play (see playAudio).
const audioModules = import.meta.glob("../src/audio/abc-task2/*.mp3", {
  eager: true,
  import: "default",
});
const audioByName = Object.fromEntries(
  Object.entries(audioModules).map(([path, url]) => [
    path.split("/").pop(),
    url,
  ]),
);

const speakerIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5" aria-hidden="true">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06Z" />
    <path d="M18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
    <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
  </svg>
`;

function Explanation() {
  return `
    <section class="mx-auto max-w-3xl space-y-4 px-4 py-10 leading-relaxed">
      <h1 class="text-3xl font-bold">Task #2: 🎧</h1>
      <p>
       3 задания "Слушай-выбирай" и 3 задания "Слушай-вбивай"
      </p>
    </section>
  `;
}

// Answer area depends on the task variant. Both start disabled until the user
// presses Listen.
function Answer(task) {
  if (task.variant === "user-input") {
    return `
      <div class="flex w-full gap-2">
        <input
          type="text"
          class="answer-input input input-bordered w-full"
          placeholder="Печатать тут"
          maxlength="100"
          autocomplete="off"
          disabled
        />
        <button type="button" class="answer-submit btn btn-primary" disabled>
          Check
        </button>
      </div>
    `;
  }

  const options = (task.options ?? [])
    .map(
      (option) => `
        <button
          type="button"
          class="option btn btn-outline transition"
          data-value="${option}"
          disabled
        >${option}</button>
      `,
    )
    .join("");

  return `
    <div class="options grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
      ${options}
    </div>
  `;
}

function TaskCard(task, index) {
  return `
    <div
      class="task card mx-auto w-full max-w-md bg-base-100 shadow-md"
      data-index="${index}"
    >
      <div class="card-body items-center gap-6">
        <button
          type="button"
          class="play btn btn-primary btn-lg gap-2"
          data-audio="${task.source}"
          aria-label="Прослушать запись ${index + 1}"
        >${speakerIcon} Listen</button>

        ${Answer(task)}

        <p class="feedback text-center font-medium" aria-live="polite"></p>
        <p class="on-complete hidden text-center text-base-content/80"></p>
      </div>
    </div>
  `;
}

function Tasks() {
  return `
    <section class="bg-base-200">
      <div class="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-16 md:grid-cols-2 lg:grid-cols-3">
        ${tasks.map(TaskCard).join("")}
      </div>
    </section>
  `;
}

function App() {
  return `
    ${Header({ backHref: "/abc/#task2" })}
    <main>
      ${Explanation()}
      ${Tasks()}
    </main>
  `;
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
  const url = audioByName[button.dataset.audio];
  if (!url) return;

  // Options are visible from the start but disabled. Enable them the first time
  // the user presses Listen (a solved task stays locked).
  const taskEl = button.closest(".task");
  if (taskEl && !taskEl.dataset.activated) {
    taskEl.dataset.activated = "true";
    taskEl
      .querySelectorAll(".option, .answer-input, .answer-submit")
      .forEach((el) => {
        el.disabled = false;
      });
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  setPlayLoading(button, true);
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

// --- Feedback helpers (text feedback in addition to color) ---
function showFeedback(taskEl, message, correct) {
  const feedback = taskEl.querySelector(".feedback");
  feedback.textContent = message;
  feedback.classList.toggle("text-success", correct);
  feedback.classList.toggle("text-error", !correct);
}

function revealComplete(taskEl, task) {
  const onComplete = taskEl.querySelector(".on-complete");
  if (onComplete && task.onComplete) {
    onComplete.textContent = task.onComplete;
    onComplete.classList.remove("hidden");
  }
}

// Normalize answers: trim surrounding whitespace, ignore case.
function normalize(value) {
  return value.trim().toUpperCase();
}

// --- Multiple-choice evaluation ---
function handleOptionClick(button) {
  const taskEl = button.closest(".task");
  if (!taskEl) return;
  const task = tasks[Number(taskEl.dataset.index)];
  if (!task) return;

  if (button.dataset.value === task.correct) {
    button.classList.remove("btn-outline");
    button.classList.add("btn-success");
    taskEl.querySelectorAll(".option").forEach((option) => {
      option.disabled = true;
    });
    showFeedback(taskEl, "✅ Correct!", true);
    revealComplete(taskEl, task);
  } else {
    button.classList.remove("btn-outline");
    button.classList.add("btn-error");
    button.disabled = true;
    showFeedback(taskEl, "❌ OOPS. Wrong!", false);
  }
}

// --- Free-text evaluation ---
function handleSubmit(taskEl) {
  const task = tasks[Number(taskEl.dataset.index)];
  if (!task) return;
  const input = taskEl.querySelector(".answer-input");
  if (!input || input.disabled) return;

  const value = input.value.trim();
  if (!value) {
    showFeedback(taskEl, "✍️ Type your answer first.", false);
    return;
  }

  if (normalize(value) === normalize(task.correct)) {
    input.disabled = true;
    taskEl.querySelector(".answer-submit").disabled = true;
    input.classList.add("input-success");
    input.classList.remove("input-error");
    showFeedback(taskEl, "✅ Correct!", true);
    revealComplete(taskEl, task);
  } else {
    input.classList.add("input-error");
    input.classList.remove("input-success");
    showFeedback(taskEl, "❌ OOPS. Wrong!", false);
  }
}

function setupInteractions() {
  const root = document.querySelector("#app");
  if (!root) return;

  root.addEventListener("click", (event) => {
    const play = event.target.closest(".play");
    if (play) {
      playAudio(play);
      return;
    }
    const submit = event.target.closest(".answer-submit");
    if (submit && !submit.disabled) {
      handleSubmit(submit.closest(".task"));
      return;
    }
    const option = event.target.closest(".option");
    if (option && !option.disabled) handleOptionClick(option);
  });

  // Allow submitting a free-text answer with Enter.
  root.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const input = event.target.closest(".answer-input");
    if (input && !input.disabled) {
      event.preventDefault();
      handleSubmit(input.closest(".task"));
    }
  });
}

document.querySelector("#app").innerHTML = App();
setupInteractions();
