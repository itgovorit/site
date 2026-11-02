import "../src/style.css";
import { Header } from "../src/components/header.js";
import { Warning } from "../src/components/warning.js";

const PAGE_TITLE = "Быстрее, выше, сТильнее";

// Tasks are linked as they get built. A number that is not listed here renders
// as a disabled placeholder rather than a link to a page that would 404; the id
// is set either way, so a task page's back link can point at /adjectives/#taskN
// and land on the right button.
const BUILT_TASKS = new Set([1, 2, 3]);

function TaskButton(number) {
  const button = BUILT_TASKS.has(number)
    ? `<a id="task${number}" href="/adjectives-task${number}/" class="btn btn-secondary">Task #${number}</a>`
    : `<button id="task${number}" type="button" class="btn btn-secondary" disabled>Task #${number}</button>`;
  return `<p>${button}</p>`;
}

function Hero() {
  return `
    <section class="hero bg-base-200 py-20">
      <div class="hero-content text-center">
        <div class="max-w-2xl">
          <h1 class="text-5xl font-bold">${PAGE_TITLE}</h1>
          <p class="pt-4 text-base-content/70">
            Как о(б)суждать дизайн
          </p>
        </div>
      </div>
    </section>
  `;
}

function Content() {
  return `
    <article class="mx-auto max-w-3xl space-y-4 px-4 py-12 leading-relaxed">
      <h2 class="text-2xl font-bold">Scenario 5 🎨</h2>
      <p>
        Ты фронтендер 😉 на встрече с клиентами. Они гордо показывают новый
        вариант дизайна. Все красиво — но тебе не нравится. Главный от клиентов
        опрометчиво спрашивает твоего мнения. Твой выход:
      </p>
      <div class="chat chat-start">
        <div class="chat-bubble">
          Let’s make the background lighter, animations slower, image resolution
          higher…
        </div>
      </div>
      <p>
        Тут твой начальник отключает тебе микрофон и обещает клиентам формальный
        фидбек позже.
      </p>
      <p class="text-center">The END 😶</p>

      <h2 class="pt-4 text-2xl font-bold">Хороший, плохой, злой 🤠</h2>
      <p>
        Сегодня мы поговорим о прилагательных (adjectives). А сконцентрируемся на
        таких, которые помогут описать интерфейсы. Переходим, вспоминаем / учим.
        Слова эти пригодятся в жизни даже если ты бэкендер.
      </p>
      ${TaskButton(1)}

      <h2 class="pt-4 text-2xl font-bold">Очень страшное кино 👻</h2>
      <p>
        Итак, слова повторили. Напомню, что усилить «вес» прилагательного можно используя
        следующие слова — <strong>very</strong>, <strong>really</strong>,
        <strong>too</strong>. Первые два выражают нейтральное отношение —
        [очень], <strong>too</strong> указывает на «больше-чем-хотелось»
        отношение говорящего — [слишком].
      </p>
      ${Warning(`Используй <strong>very</strong> только с прилагательными!
        Никакого <strong>I very want</strong> 🤦 — даже если very хочется.
        <strong>Really</strong> в этом отношении более универсален и может
        использоваться для усиления веса и прилагательных, и глаголов —
        <strong>I really want it</strong>.`)}
      <p>
        Итак, если хотим побурчать, говорим: <strong>too big</strong>,
        <strong>too slow</strong>.
      </p>
      <p>Но как говорится: «критикуешь — предлагай».</p>
      <p class="font-medium">
        It’s too big. Make it smaller.<br />
        It’s too slow. Make it faster.
      </p>
      <p>
        <strong>Make it smaller</strong> [сделай меньше] — это инструкция, о
        которой говорили на прошлом занятии. Не забываем, что мы можем
        «смягчить» инструкцию, превратив её в вопрос или предложение:
      </p>
      <p class="font-medium">
        Can we make it smaller?<br />
        Let's make it smaller
      </p>
      <p>Давай составим такие предложения с остальными прилагательными:</p>
      ${TaskButton(2)}

      <h2 class="pt-4 text-2xl font-bold">Тупой и ещё тупее 😬</h2>
      <p>
         В предыдущем таске часть прилагательных была в сравнительной степени. В английском правила их построения (в которых размер имеет значение)
        довольно простые:
      </p>
      <p class="font-medium">
        Короткое слово ➕ er: <i>short</i> ➕ er, <i>fast</i> ➕ er.
      </p>
      <p>
        Конечно, не всё так гладко: есть удвоение согласной в конце
        (<strong>big — bigger</strong>), замена y → i
        (<strong>easy — easier</strong>). Но это всё происходит в письменной
        речи. Так что можно забить — автокоррект тебя исправит, а на
        произношение не влияет.
      </p>
      <p class="font-medium">
        More ➕ длинное слово: more transparent, more interesting.
      </p>
      <p>
        Возникает вопрос — а какое слово можно считать длинным. Мой ответ — «со
        временем разберёшься». Сомневаешься? — используй <strong>more</strong>.
      </p>
      <p>
        <strong>Narrower</strong> и <strong>more narrow</strong> — оба варианта
        приемлемы.
      </p>
      <p>
        Ну и стоит напомнить, конечно, о паре исключений (а куда без них). Но
        исключения для таких же слов, как и в русском языке, поэтому не
        жалуемся:
      </p>
      <ul class="space-y-2">
        <li>👍 <strong>Good — better</strong> [хорошо — лучше]</li>
        <li>👎 <strong>Bad — worse</strong> [плохо — хуже]</li>
      </ul>
    

      <h2 class="pt-4 text-2xl font-bold">Итог 📝</h2>
      <p>
        Итак, в этом уроке мы взяли конструкцию <strong>make it</strong> ➕
        прилагательное в сравнительной степени —
        <strong>Make it higher!</strong>
      </p>
      <p>
        Но такой же смысл можно передать используя глагол
        <strong>increase</strong> / <strong>decrease</strong> ➕ существительное:
        <strong>Increase height</strong>.
      </p>
      <ul class="space-y-2">
        <li><strong>Increase height</strong> = make it higher</li>
        <li><strong>Decrease height</strong> = make it lower</li>
      </ul>
      ${Warning(`Слово <strong>height</strong> очень часто произносят как
        «хейт», но это не правильно — «хейт» звучит как <strong>hate</strong>
        [ненависть] <em>/heɪt/</em>. А «высота» — это <em>/haɪt/</em>, «хайт».
        Вероятно, это происходит из-за похожести на слово 8
        (<strong>eight</strong>).`)}
      <ul class="space-y-2">
        <li>
          <strong>Increase transparency</strong> = make it more transparent
        </li>
        <li>
          <strong>Decrease transparency</strong> = make it more opaque = make it
          less transparent
        </li>
      </ul>
      <p>Аж три варианта сказать одно и то же 😄</p>
      <p>
        Но будь внимателен: <strong>less</strong> [менее] работает только с
        длинными прилагательными.
      </p>
      <p>
       <strong> Less big</strong> ❌ — звучит не очень. Лучше <strong>smaller</strong> ✅
      </p>
      <p>Закрепим всё это в следующем таске. Но будьте внимательней задание не простое - не стесняйся пользоваться автокомплитом</p>

        ${TaskButton(3)}

        <p>На сегодня фсё. Будьте more patient и kinder c заказчиками и коллегами</p>

      <p class="pt-4">
        Держи шпаргалку: все пары прилагательных и их существительные в одном
        месте. 🔖
      </p>
      <p>
        <a id="bookmark" href="/adjectives-bookmark/" class="btn btn-secondary">Bookmark</a>
      </p>
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
