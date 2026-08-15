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
Сборник тем 
          </p>
        </div>
      </div>
    </section>
  `;
}

function Card({ title, description, image, link }) {
  const imageUrl = imagesByName[image];
  const inner = `
    <figure class="aspect-[11/6] w-full">
      <img
        src="${imageUrl}"
        alt="${title} preview"
        width="1408"
        height="768"
        class="h-full w-full object-cover"
      />
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
      <h2 class="mb-8 text-2xl font-semibold">Explore</h2>
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        ${cards.map(Card).join("")}
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
