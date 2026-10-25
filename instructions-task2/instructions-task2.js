import "../src/style.css";
import { Header } from "../src/components/header.js";

// Verb-picking questions: a target phrase plus four candidate verbs.
import task from "../src/data/instructions/task2.json";

// Vault room behind the dials, and the payoff once every phrase is solved.
import bgUrl from "../src/img/instructions/task2/background.jpeg";
import finalUrl from "../src/img/instructions/task2/final.jpeg";

// A clip per full phrase, named by each question in task2.json. Only URL strings
// are imported here; the bytes load when the user presses play.
const audioModules = import.meta.glob("../src/audio/instructions/task2/*.mp3", {
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

// Shuffled on every visit, so a second run does not open with the same phrase.
// Each question already names its own audio file and carries its own reasons, so
// nothing is keyed to the original order. From here on an index means a position
// in the deck, not the question's id.
const DECK = shuffle(task.questions);

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

const arrowIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5" aria-hidden="true">
    <path fill-rule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clip-rule="evenodd" />
  </svg>
`;

// --- The dial ---
//
// Options sit evenly around the plate, option 0 starting at 3 o'clock, and each
// press adds one step clockwise. The chosen option is whichever one stands at
// 6 o'clock, the slot facing the sentence below the dial.
const MARKER_ANGLE = 90; // degrees clockwise from 3 o'clock, i.e. the bottom

function selectedIndex(steps, count) {
  const slot = MARKER_ANGLE / (360 / count);
  return (((slot - steps) % count) + count) % count;
}

// Start the dial somewhere that is not already the right answer, otherwise a
// quarter of the questions would be solved before the user touches anything.
function initialSteps(question) {
  const count = question.options.length;
  const correct = question.options.findIndex((option) => option.is_correct);
  const safe = [];
  for (let steps = 0; steps < count; steps++) {
    if (selectedIndex(steps, count) !== correct) safe.push(steps);
  }
  return safe[Math.floor(Math.random() * safe.length)];
}

function Dial(question) {
  const count = question.options.length;
  const step = 360 / count;
  const steps = initialSteps(question);

  const options = question.options
    .map(
      (option, i) => `
        <span class="dial-opt" style="--a: ${i * step}deg" data-opt="${i}">
          <span class="dial-opt-text">${escapeHtml(option.text)}</span>
        </span>`,
    )
    .join("");

  // Decorative notches round the rim, so the turn is easy to see.
  const ticks = Array.from(
    { length: 12 },
    (_, i) => `<span class="dial-tick" style="--a: ${i * 30}deg"></span>`,
  ).join("");

  // No wrapper: as a direct flex child the button is blockified, so there is no
  // inline line box adding descender space under it. That stray space used to
  // push the dial a few pixels above the sentence it is supposed to line up with.
  return `
    <button
      type="button"
      class="dial"
      style="--rot: ${steps * step}deg"
      data-steps="${steps}"
      aria-label="Повернуть диск"
    >
      <span class="dial-face">
        ${ticks}
        ${options}
        <span class="dial-hub"></span>
      </span>
    </button>
  `;
}

function QuestionCard(question, index) {
  const isLast = index === DECK.length - 1;

  return `
    <!-- Painted-steel panel rather than a white card, so it reads as part of the
         vault. Still translucent with a blur, so the room shows through without
         the text losing contrast. The olive is specific to this page, so it is
         written inline rather than added to the theme. -->
    <div
      class="question card mx-auto w-full max-w-2xl border-4 border-[#5f5c4b]/70 bg-[#7f7b64]/75 shadow-lg backdrop-blur-sm ${index === 0 ? "" : "hidden"}"
      data-index="${index}"
    >
      <div class="card-body items-center gap-6">
        <!-- text-xl sits on the wrapper so the dial's labels inherit exactly the
             same font and size as the phrase beside them. -->
        <!-- Stacked at every width: the chosen word sits at the bottom of the
             dial and reads downwards into the phrase. Side by side, the phrase
             dropped below the dial on narrow screens anyway. -->
        <div class="flex flex-col items-center gap-1 text-xl">
          ${Dial(question)}
          <!-- White, not the default ink: the olive panel is a mid tone, where
               near-black text measures only 3.9:1. White clears AA. -->
          <p class="dial-phrase max-w-sm text-center leading-relaxed text-white">
            ${escapeHtml(question.target_phrase)}
          </p>
          <!-- The chosen word is only shown on the dial, so screen readers get
               it from here instead. -->
          <span class="chosen sr-only" aria-live="polite"></span>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-3">
          <button type="button" class="check btn btn-secondary">Check</button>
          ${
            // Shown from the start but disabled, so the pair of buttons reads as
            // centred and Check does not appear to sit off to one side.
            isLast
              ? ""
              : `<button type="button" class="next btn btn-success gap-1" disabled>Next ${arrowIcon}</button>`
          }
        </div>

        <!-- Every possible message lives here: the solved phrase and one reason
             per wrong option. They share a single grid cell, so the panel is
             already as tall as its tallest message and swapping between them
             moves nothing. All start unseen; only the active one is revealed. -->
        <div class="reveal invisible grid w-full rounded-box border border-[#5f5c4b]/40 bg-[#efeadb]/85 p-4 text-center">
          <div class="reveal-correct invisible col-start-1 row-start-1">
            <div class="flex flex-wrap items-center justify-center gap-2">
              <p class="text-lg font-semibold">${escapeHtml(question.full_phrase)}</p>
              ${
                // h-11 w-11 is the same 44px tap target used on the bookmark pages.
                audioByFile[question.audio]
                  ? `<button
                      type="button"
                      class="play btn btn-circle btn-ghost h-11 min-h-0 w-11 border border-base-content/30 p-0 text-base-content/60 hover:border-base-content/60 hover:text-base-content"
                      data-audio="${escapeHtml(question.audio)}"
                      aria-label="Прослушать: ${escapeHtml(question.full_phrase)}"
                    >${speakerIcon}</button>`
                  : ""
              }
            </div>
            <p class="pt-1 text-sm text-base-content/70">${escapeHtml(question.explanation)}</p>
          </div>
          ${question.options
            .map((option, i) =>
              option.is_correct
                ? ""
                : `<p class="reveal-reason invisible col-start-1 row-start-1 leading-relaxed" data-opt="${i}">${escapeHtml(option.reason ?? "")}</p>`,
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function Explanation() {
  // Progress markers, not controls: the questions are worked through in order
  // with Next, so these only report state. Red ring until answered, green after.
  const marks = DECK.map(
    (_, i) =>
      `<span
        class="task-mark flex h-9 w-9 items-center justify-center rounded-full border-2 border-error font-medium"
        data-mark="${i}"
        role="listitem"
        aria-label="Вопрос ${i + 1}: без ответа"
      >${i + 1}</span>`,
  ).join("");

  return `
    <section class="mx-auto max-w-3xl space-y-4 px-4 py-10 leading-relaxed">
      <h1 class="text-3xl font-bold">Open the safe 🔐</h1>
      <p>
        Крути диск и выбирай подходящий глагол
      </p>
      <div role="list" class="flex flex-wrap justify-center gap-2">${marks}</div>
    </section>
  `;
}

function App() {
  return `
    ${Header({ backHref: "/instructions/#task2" })}
    <main>
      ${Explanation()}
      <section
        class="bg-base-200 bg-cover bg-center px-4 py-12"
        style="background-image: url(${bgUrl});"
      >
        <!-- The card stack is the safe door, with the reward sitting behind it.
             Both share this frame, whose height comes from the cards, so sliding
             the panel up changes nothing about the layout. -->
        <div id="stage" class="relative mx-auto w-full max-w-2xl overflow-hidden rounded-box">
          <!-- Starts unseen so the panel's backdrop blur cannot leak the picture
               through the olive before it is earned. -->
          <img
            id="reward"
            src="${finalUrl}"
            alt="Well done — все фразы собраны"
            width="1211"
            height="864"
            class="invisible absolute inset-0 h-full w-full object-cover"
          />
          <div id="panel" class="vault-panel relative">
            ${DECK.map(QuestionCard).join("")}
          </div>
        </div>
      </section>
    </main>
  `;
}

// --- Behaviour ---

// Mark the option standing at the marker; that one reads as the sentence's verb.
function syncDial(card) {
  const question = DECK[Number(card.dataset.index)];
  const dial = card.querySelector(".dial");
  const count = question.options.length;
  const chosen = selectedIndex(Number(dial.dataset.steps), count);

  card.querySelectorAll(".dial-opt").forEach((opt) => {
    opt.classList.toggle("is-selected", Number(opt.dataset.opt) === chosen);
  });

  const word = question.options[chosen].text;
  card.querySelector(".chosen").textContent = `${word} ${question.target_phrase}`;
}

function turn(card) {
  const dial = card.querySelector(".dial");
  const question = DECK[Number(card.dataset.index)];
  const step = 360 / question.options.length;

  // The count only ever grows, so the plate always turns clockwise.
  const steps = Number(dial.dataset.steps) + 1;
  dial.dataset.steps = String(steps);
  dial.style.setProperty("--rot", `${steps * step}deg`);

  // A new pick invalidates the last verdict: clear the red pill and the message.
  card
    .querySelectorAll(".dial-opt")
    .forEach((opt) => opt.classList.remove("is-wrong"));
  card.querySelector(".reveal").classList.add("invisible");

  syncDial(card);
}

// Reveal one message from the panel. The parent turning visible is what shows
// it, so every other message stays marked unseen and merely holds space.
function showMessage(card, active) {
  const reveal = card.querySelector(".reveal");
  reveal.querySelectorAll(".reveal-correct, .reveal-reason").forEach((el) => {
    el.classList.add("invisible");
  });
  active?.classList.remove("invisible");
  reveal.classList.remove("invisible");
}

function check(card) {
  const question = DECK[Number(card.dataset.index)];
  const dial = card.querySelector(".dial");
  const index = selectedIndex(Number(dial.dataset.steps), question.options.length);
  const chosen = question.options[index];

  if (!chosen.is_correct) {
    // Mark the pill red and explain why this verb does not fit.
    card
      .querySelector(`.dial-opt[data-opt="${index}"]`)
      ?.classList.add("is-wrong");
    showMessage(card, card.querySelector(`.reveal-reason[data-opt="${index}"]`));
    return;
  }

  showMessage(card, card.querySelector(".reveal-correct"));
  markAnswered(card.dataset.index);

  // Solved: lock the dial and show the whole phrase with its translation.
  dial.disabled = true;
  card.querySelector(".check").disabled = true;

  // Check is spent, so hand over to Next.
  const next = card.querySelector(".next");
  if (next) next.disabled = false;

  if (allAnswered()) showFinale();
}

// --- On-demand audio playback (one clip at a time) ---
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

// Show one question.
function showQuestion(target) {
  const index = String(target);
  document
    .querySelectorAll(".question")
    .forEach((card) => card.classList.toggle("hidden", card.dataset.index !== index));
}

// Flip a question's progress marker from red to green.
function markAnswered(index) {
  const mark = document.querySelector(`.task-mark[data-mark="${index}"]`);
  if (!mark) return;
  mark.classList.remove("border-error");
  mark.classList.add("border-success");
  mark.setAttribute("aria-label", `Вопрос ${Number(index) + 1}: отвечен`);
}

// Every marker green means the run is done. Read from the markers rather than a
// counter, so it cannot drift out of step with what the user can see.
function allAnswered() {
  return document.querySelectorAll(".task-mark.border-success").length === DECK.length;
}

function showFinale() {
  const panel = document.querySelector("#panel");
  const reward = document.querySelector("#reward");
  if (!panel || panel.classList.contains("is-open")) return;

  // Uncovered first, while the panel still hides it, so nothing is spoiled.
  reward.classList.remove("invisible");

  // Only the panel moves. Its layout box stays put — a transform does not affect
  // layout — so the frame keeps its height and the page does not shift.
  panel.classList.add("is-open");

  // Once it has slid away, its buttons are off-screen but would still be
  // tabbable, so take the whole panel out of the tab order and a11y tree.
  panel.addEventListener(
    "transitionend",
    () => {
      panel.inert = true;
    },
    { once: true },
  );

  document
    .querySelector("#stage")
    .scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function setup() {
  const root = document.querySelector("#app");
  if (!root) return;

  root.addEventListener("click", (event) => {
    const card = event.target.closest(".question");
    if (!card) return;

    // Checked before the dial, since the button sits inside the card too.
    const play = event.target.closest(".play");
    if (play) {
      playSound(play.dataset.audio);
      return;
    }

    if (event.target.closest(".dial")) turn(card);
    else if (event.target.closest(".check")) check(card);
    else if (event.target.closest(".next"))
      showQuestion(Number(card.dataset.index) + 1);
  });

  // Mark each dial's starting pick.
  document.querySelectorAll(".question").forEach(syncDial);
}

document.querySelector("#app").innerHTML = App();
setup();
