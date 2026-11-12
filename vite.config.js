import { resolve } from "node:path";
import { defineConfig } from "vite";
import { htmlPartials } from "./scripts/vite-html-partials.js";

export default defineConfig({
  root: ".",
  base: "/tehnotron/",
  publicDir: "public",
  plugins: [htmlPartials()],
  server: {
    watch: {
      ignored: [
        "**/public/**/.figma-export*/**",
        "**/public/**/.figma-export*",
      ],
    },
  },
  build: {
    outDir: "docs",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        home: resolve(__dirname, "home.html"),
        products: resolve(__dirname, "products.html"),
        product: resolve(__dirname, "product.html"),
        section: resolve(__dirname, "section.html"),
      },
    },
  },
});
