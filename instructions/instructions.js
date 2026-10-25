import "../src/style.css";
import { Header } from "../src/components/header.js";
import { Warning } from "../src/components/warning.js";

// Only the URL is imported here; the bytes load when the user presses play.
import phraseAudio from "../src/audio/instructions/phrase.mp3";

const PAGE_TITLE = "Инструкции";

// Matches the audio controls on the task pages.
const speakerIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5" aria-hidden="true">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
    <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
  </svg>
`;

function Hero() {
  return `
    <section class="hero bg-base-200 py-20">
      <div class="hero-content text-center">
        <div class="max-w-2xl">
          <h1 class="text-5xl font-bold">${PAGE_TITLE}</h1>
          <p class="pt-4 text-base-content/70">
              Как сказать коллегам, что им делать, и как после понять, куда тебе надо идти.
          </p>
        </div>
      </div>
    </section>
  `;
}

function Content() {
  return `
    <article class="mx-auto max-w-3xl space-y-4 px-4 py-12 leading-relaxed">
      <h2 class="text-2xl font-bold">Scenario 4 😡</h2>
      <p>
        Ты на общем звонке с коллегами. И тебя все бесят. Один забыл раздать
        экран и что-то увлечённо показывает и рассказывает. У другого на фоне орёт
        кот, а третий забыл выключить камеру и ковыряется в носу. Твой выход:
      </p>
      <div class="chat chat-start">
        <div class="chat-bubble">
          Angela, share your screen. Oleg, mute your mic. OMG, John, turn off
          your camera
        </div>
      </div>
      <p class="text-center">The END 😌</p>

      <h2 class="pt-4 text-2xl font-bold">Объяснение 🧠</h2>
      <p>
        Давать инструкции (включая приказы и просьбы) на английском довольно
        просто. Отсутствие в английском уважительной формы (открой / откройте) и
        совершенной и несовершенной формы глаголов (открывать / открыть) упрощает
        нам жизнь — просто берём глагол из словаря — <strong>Open!</strong> Вот и
        готова самая минимальная инструкция. Конечно, часто надо уточнять,что
        открывать, но об этом позже.
      </p>

      <h2 class="pt-4 text-2xl font-bold">Экшены 🎬</h2>
      <p>
        Давай посмотрим на список глаголов, которые могут пригодиться тебе на
        стандартном рабочем звонке. Листай, переворачивай карточки и обращай внимание на произношение
      </p>
      <p>
        <a id="task1" href="/instructions-task1/" class="btn btn-secondary">Task #1</a>
      </p>

      <h2 class="pt-4 text-2xl font-bold">Запреты 🙅</h2>
      <p>
        Зачастую мы, конечно, хотим, чтоб человек что-то <strong>НЕ</strong> делал.
        Для этого добавляем <strong>do not</strong> или (что чаще) краткую форму
        <strong>don't</strong> перед глаголом.
      </p>
      <ul class="space-y-2">
        <li>🕳️ - <strong>Dig!</strong> [копай] </li>
        <li>❌🕳️ - <strong>Don't dig</strong> [не копай!] </li>
        <li>🕺 - <strong>dance</strong> [танцуй]</li>
        <li>❌🕺 - <strong>don't dance</strong> [не танцуй]</li>
      </ul>
      <p>
        <strong>Don't</strong> — слово маленькое, но с точки зрения произношения
        непростое для русскоговорящих. Часто его произносят как <i>донт</i>.
      </p>
      <p>
        <strong>Во-первых:</strong> звук <em>/d/</em> — он звонкий напарник звука
        <em>/t/</em>, о котором мы говорили на прошлом уроке. То есть всё так же:
        язык к бугорочку, собираем энергию и высвобождаем её, но ещё и добавляем
        голос. В этом и вся разница между глухим и звонким звуком — включаешь ты
        голос или нет.
      </p>
      <p>
        <strong>Во-вторых,</strong> буква «o» даёт нам двойной звук — точно так же
        как мы произносим её в алфавите — <em>/oʊ/</em>.
      </p>
      <p class="font-medium">
        No, I know but don't go <span class="text-base-content/70">[Нет, я знаю,
        но не иди]</span>
      </p>
      <p>
        <!-- h-11 w-11 is the 44px tap target used across the site. -->
        <button
          type="button"
          id="play-phrase"
          class="btn btn-circle btn-ghost h-11 min-h-0 w-11 border border-base-content/30 p-0 text-base-content/60 hover:border-base-content/60 hover:text-base-content"
          aria-label="Прослушать: No, I know but don't go"
        >${speakerIcon}</button>
      </p>
      <p>В этом бессмысленном предложении все буквы «o» произносятся одинаково.</p>
      <p>
        <strong>В-третьих,</strong> буква «t» в <code>don't</code> произносится
        менее энергично, чем <em>/d/</em> — а зачастую в речи просто «съедается».
      </p>
      <p>
        Итак, с произношением закончили на сегодня. Главное - запомнить, что это не
        «ленивый-переднеязычный», а очень энергичный-приподнято-язычный
        <em>/d/</em>. «Д» сына маминой подруги, так сказать. Не «донт» → «доунт», а
        точнее <em>/doʊnt/</em>.
      </p>

      <h2 class="pt-4 text-2xl font-bold">Фразы 🔗</h2>
      <p>
        Исключая <strong>zoom in/out</strong> и <strong>scroll up/down</strong> —
        остальные глаголы из нашего списка обычно требуют уточнения: что конкретно
        открыть или закрыть. “Сделай что-то”:
      </p>
      <p><strong>Open the window </strong> </br> <strong>Don’t open the window</strong> </p>
      <p>
        Также такую же простую структуру мы используем для создания git commit
        месседжей: 
        <strong>Remove header from…</strong></br>
        <strong>Add function for..</strong></br>
        <strong>Fix bug </strong>(такой коммит месседж осуждаю) 😉
      </p>
      ${Warning(`В коммит сообщениях артикли обычно пропускают, а вот реальной
        жизни нет. Но пока продолжаем не переживать об артиклях`)}

      <p>В следующем таске  давай “подберем” глагол и откроем сейф 🔒:</p>
      <p>
        <a id="task2" href="/instructions-task2/" class="btn btn-secondary">Task #2</a>
      </p>
      

      <h2 class="pt-4 text-2xl font-bold">Подача 😠🙂</h2>
      <p>
        Теперь давай поговорим о подаче инструкций. Главное правило: <i>быть вежливым,
        ну или хотя бы казаться таковым</i>. Например:
      </p>
      <p class="font-medium"><strong><i>Oleg, mute your mic!</i></strong></p>
      <p>Это может звучать (да и звучит) грубо.</p>
      <p>
        ☝️ Как вариант, можем добавить <strong>please</strong> в начале или в конце фразы:
      </p>
      <p class="font-medium">Oleg, mute your mic, please!</p>
      <p>
        🤷 Но от этого ваша инструкция не меняет форму. Предпочтительнее замаскировать
        вашу инструкцию под вопрос.
      </p>
      <ul class="space-y-2">
        <li>
          <strong><i>Oleg, can you mute your mic?</i></strong> — Олег, не можешь ли ты…
        </li>
        <li>
          <strong>Could you share your screen?</strong> — не мог бы ты…
        </li>
      </ul>
      <p>☝️ Можно и <strong>please</strong> докинуть в конце.</p>
      <p class="font-medium"><strong><i>Can you zoom in, please?</i></strong></p>
      <p>
        💡 Другой вариант, которым часто пользуются менеджеры — начать свою инструкцию
        с <strong>Let's</strong>. Это сокращение от <strong>Let us</strong> [позвольте
        нам], но более точный перевод по духу — «А давайте-ка…».
      </p>
      <p>
        Если менеджер говорит <strong><i>Let's fix this bug today</i></strong> [
        давайте пофиксим этот баг сегодня] — он-то ничего с вами фиксить не
        будет. Это просто более вежливая форма для инструкции. В отличие от
        вопроса, это «авторитетный» вариант, так как не требует ответа.
      </p>
      <p>
        Но помните: в данном случае, <strong>КАК</strong> вы произносите что-то,
        гораздо важнее того, <strong>ЧТО</strong> вы произносите.
      </p>
      <p>
        Фраза <strong>Turn on your camera, убл#%к, мать твою</strong> с дружескими интонациями в
        голосе может звучать менее обидно, чем <strong>Could you turn on your camera,
        please</strong> с нотками раздражения и сарказма. Но это, конечно,
        общечеловеческое правило, работающее для всех языков.
      </p>

      <h2 class="pt-4 text-2xl font-bold">Давайте подведём итог 📝</h2>
      <ul class="list-disc space-y-2 pl-6">
        <li>Дать инструкцию очень просто. Берём глагол и поехали.</li>
        <li>Если хотим чтоб что-то не делали — ставим <strong>don't</strong> перед глаголом.</li>
        <li>
          Хотим звучать более вежливо — превращаем в вопрос
          <strong>can/could you</strong> + глагол.
        </li>
        <li>Либо добавляем <strong>Let's</strong> перед действием для «смягчения» инструкции.</li>
      </ul>


      <h2 class="pt-4 text-2xl font-bold">Применение 💪</h2>
      <p>
        Проанализируй, какие фразы ты часто используешь на созвонах, и повтори их
        несколько раз (можешь прогнать через ИИшку, чтоб убедиться что всё
        правильно). Например:
      </p>
      <ul class="space-y-2">
        <li><strong>Can you open ticket 235?</strong></li>
        <li><strong>Drop the link in the chat, please.</strong></li>
        <li><strong>Let's move it to the next sprint</strong></li>
      </ul>

      <p>
        Вот еще примеры таких фраз - но их надо сначала собрать
      </p>
      <p>
        <a id="task3" href="/instructions-task3/" class="btn btn-secondary">Task #3</a>
      </p>

      <p>
        Если получилось с первого раза - Well Done! </p>
        <p>🦉 Разговаривая на родном языке, мы не складываем речь из отдельных слов как в предыдущем упражнении — мы
        оперируем смысловыми группами слов. Поэтому не ленимся запоминать вот такие
        фразы целиком. 
      </p>


      <p class="pt-4">
        в закладку: четыре формы инструкции и все глаголы из урока в одном
        месте. 🔖
      </p>
      <p>
        <a id="bookmark" href="/instructions-bookmark/" class="btn btn-secondary">Bookmark</a>
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

// The one clip on this page. A fresh Audio per press replays from the start, and
// pausing the previous one keeps a double tap from overlapping with itself.
let currentAudio = null;
document.querySelector("#play-phrase")?.addEventListener("click", () => {
  currentAudio?.pause();
  currentAudio = new Audio(phraseAudio);
  currentAudio.play().catch(() => {});
});

// Jump to an in-page anchor when arriving via a back-button link.
if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
