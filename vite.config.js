import { resolve } from "node:path";
import { defineConfig } from "vite";
import { htmlPartials } from "./scripts/vite-html-partials.js";

export default defineConfig({
  root: ".",
  base: "/tehnotron/",
  publicDir: "public",
  plugins: [htmlPartials()],
  build: {
    outDir: "docs",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        home: resolve(__dirname, "home.html"),
      },
    },
  },
});
