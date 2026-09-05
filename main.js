import "./src/style.css";
import { Header } from "./src/components/header.js";

// Placeholder card data. Content will be replaced with real material later.
import cards from "./src/data/cards.json";

// Eagerly resolve every image in ./img to its hashed build URL. Cards reference
// their image by filename in cards.json; this map turns that into a real URL.
const imageModules = import.meta.glob("./src/img/*", {
  eager: true,
  import: "default",
});
const imagesByName = Object.fromEntries(
  Object.entries(imageModules).map(([path, url]) => [
    path.replace("./src/img/", ""),
    url,
  ]),
);

function Hero() {
  return `
    <section class="hero bg-base-100 py-16">
      <div class="hero-content text-center">
        <div class="max-w-2xl">
          <h1 class="text-4xl font-bold">Английский для IT</h1>
          <p class="py-6 text-base-content/80">
Добро пожаловать на сайт <strong>ITgovorit</strong>. Больше информации в соседнем телеграм канале <a href="https://t.me/itgovorit" target="_blank" class="badge badge-secondary rounded-full align-middle">@itgovorit</a>
          </p>
        </div>
      </div>
    </section>
  `;
}

// Cards are revealed over time via "isActive" in cards.json. A missing key
// counts as active, so older entries keep working.
function isActive(card) {
  return card.isActive ?? true;
}

// Placeholder for a card that has not been released yet. Same shape as a real
// card so the grid does not shift when one is switched on.
function SkeletonCard() {
  return `
    <div class="card bg-base-100 shadow-md">
      <div class="skeleton aspect-[11/6] w-full" aria-hidden="true"></div>
      <div class="card-body gap-3">
        <span class="sr-only">Скоро</span>
        <div class="skeleton h-6 w-3/4" aria-hidden="true"></div>
        <div class="skeleton h-4 w-full" aria-hidden="true"></div>
        <div class="skeleton h-4 w-5/6" aria-hidden="true"></div>
      </div>
    </div>
  `;
}

function Card({ title, description, image, imageAvif, link }) {
  const imageUrl = imagesByName[image];
  const avifUrl = imageAvif ? imagesByName[imageAvif] : null;

  // The browser takes the first source it supports, falling back to <img>.
  const picture = `
      <img
        src="${imageUrl}"
        alt="${title} preview"
        width="1408"
        height="768"
        class="h-full w-full object-cover"
      />`;

  const inner = `
    <figure class="aspect-[11/6] w-full">
      ${
        avifUrl
          ? `<picture class="block h-full w-full">
        <source srcset="${avifUrl}" type="image/avif" />${picture}
      </picture>`
          : picture
      }
    </figure>
    <div class="card-body">
      <h2 class="card-title">${title}</h2>
      <p>${description}</p>
    </div>
  `;

  // Render a linked card as an anchor so clicking it navigates to the page.
  if (link) {
    return `
      <a href="${link}" class="card bg-base-100 shadow-md transition hover:shadow-lg">
        ${inner}
      </a>
    `;
  }

  return `
    <div class="card bg-base-100 shadow-md">
      ${inner}
    </div>
  `;
}

function CardGrid() {
  return `
    <section class="mx-auto max-w-6xl px-4 py-12">
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        ${cards.map((card) => (isActive(card) ? Card(card) : SkeletonCard())).join("")}
      </div>
    </section>
  `;
}

function App() {
  return `
    ${Header()}
    <main>
      ${Hero()}
      ${CardGrid()}
    </main>
  `;
}

document.querySelector("#app").innerHTML = App();
