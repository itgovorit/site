import { defineConfig } from "vite";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Project root is the repo root; index.html lives here.
  plugins: [tailwindcss()],
  build: {
    // Emit a clean, self-contained bundle. Vite tree-shakes JS and
    // fingerprints assets referenced through import statements.
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      // Each HTML file is a separate page (multi-page app).
      input: {
        main: resolve(__dirname, "index.html"),
        abc: resolve(__dirname, "abc/index.html"),
        "abc-task1": resolve(__dirname, "abc-task1/index.html"),
        "abc-task2": resolve(__dirname, "abc-task2/index.html"),
        symbols: resolve(__dirname, "symbols/index.html"),
        "symbols-task1": resolve(__dirname, "symbols-task1/index.html"),
        "symbols-task3": resolve(__dirname, "symbols-task3/index.html"),
        "symbols-task-lama": resolve(__dirname, "symbols-task-lama/index.html"),
        "numbers-sounds": resolve(__dirname, "numbers-sounds/index.html"),
        "numbers-sounds-task1": resolve(__dirname, "numbers-sounds-task1/index.html"),
        "numbers-sounds-task2": resolve(__dirname, "numbers-sounds-task2/index.html"),
        "numbers-sounds-task3": resolve(__dirname, "numbers-sounds-task3/index.html"),
      },
    },
  },
});
