import "../src/style.css";
import { Header } from "../src/components/header.js";

const PAGE_TITLE = "Checkpoint Alpha";

function Hero() {
  return `
    <section class="hero bg-base-200 py-20">
      <div class="hero-content text-center">
        <div class="max-w-2xl">
          <h1 class="text-5xl font-bold">${PAGE_TITLE}</h1>
          <p class="pt-4 text-base-content/70">Время чекнуть</p>
        </div>
      </div>
    </section>
  `;
}

// Tasks are linked as they get built, same as on the adjectives lesson. A
// number not listed here renders as a disabled placeholder rather than a link
// to a page that would 404. The id is set either way, so a task page's back
// link can point at /checkpoint-1/#taskN and land on the right button.
const BUILT_TASKS = new Set([1, 2, 3]);

function TaskButton(number) {
  const button = BUILT_TASKS.has(number)
    ? `<a id="task${number}" href="/checkpoint-1-task${number}/" class="btn btn-secondary">Task #${number}</a>`
    : `<button id="task${number}" type="button" class="btn btn-secondary" disabled>Task #${number}</button>`;
  return `<p>${button}</p>`;
}

// Links back to earlier lessons. Relative, so they work on any host.
const lessonLink = (href, text) => `<a href="${href}" class="link link-secondary">${text}</a>`;

function Content() {
  return `
    <article class="mx-auto max-w-3xl space-y-4 px-4 py-12 leading-relaxed">
      <p>
        Поздравляю - мы добрались до первого чекпоинта. Тут три упражнения на основе
        пройденных уроков. Это как контрольная работа, но без контроля и без
        особой работы.
      </p>

      <h2 class="pt-4 text-2xl font-bold">Scenario 🤖</h2>
      <p>
        Ты Джон Коннор (как-то так) - и ты пробрался в сердце Скайнета — завод по
        изготовлению Терминаторов.
      </p>

      <h2 class="pt-4 text-2xl font-bold">Скрипт 💻</h2>
      <p>
        Таск номер один - зайди на сервер и запусти заранее оставленный там
        скрипт. Слушай свою помощницу и вводи команды!
      </p>
      ${TaskButton(1)}
      <p>Получилось?</p>
      <ul class="list-disc space-y-1 pl-6">
        <li>Если были проблемы с буквами, то стоит повторить ${lessonLink("/abc/", "первый урок")}.</li>
        <li>Если с цифрами, то ${lessonLink("/numbers-sounds/", "сюда")}.</li>
        <li>А символы мы проходили ${lessonLink("/symbols/", "здесь")}.</li>
      </ul>

      <h2 class="pt-4 text-2xl font-bold">Перекур 🕹️</h2>
      <p>
        Пока скрипт исполняется, ты, Джон, можешь позволить себе поиграть —
        заодно проверим твою реакцию.
      </p>
      ${TaskButton(2)}
      <p>Дошёл до конца <strong>?</strong> Well done <strong>:</strong> Repeat 😉</p>
      <p>Прилагательные мы проходили ${lessonLink("/adjectives/", "здесь")}.</p>
      <p>
        А глаголы при разговоре об инструкциях — ${lessonLink("/instructions/", "здесь")},
        и они тебе понадобятся в следующем задании.
      </p>

      <h2 class="pt-4 text-2xl font-bold">Саботаж 🔧</h2>
      <p>
        Благодаря запущенному скрипту ты получил доступ к производству
        Терминаторов. Вместо Шварценеггер-подобного робота - сделай им
        игрушечного. И мир будет спасён!
      </p>
      ${TaskButton(3)}

      <p class="pt-4">👍 Миссия выполнена — до встречи на следующем уроке!</p>
      <p class="text-center text-lg font-semibold">Hasta la vista, baby!</p>
    </article>
  `;
}

function App() {
  return `
    ${Header({ backHref: "/" })}
    <main>
      ${Hero()}
      ${Content()}
    </main>
  `;
}

document.querySelector("#app").innerHTML = App();

// Jump to an in-page anchor when arriving via a back-button link.
if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
