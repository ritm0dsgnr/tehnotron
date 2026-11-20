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
        card: resolve(__dirname, "card.html"),
        error: resolve(__dirname, "404.html"),
        policy: resolve(__dirname, "policy.html"),
        consent: resolve(__dirname, "consent.html"),
        contacts: resolve(__dirname, "contacts.html"),
        dealers: resolve(__dirname, "dealers.html"),
        news: resolve(__dirname, "news.html"),
        article: resolve(__dirname, "article.html"),
        reviews: resolve(__dirname, "reviews.html"),
        resources: resolve(__dirname, "resources.html"),
        career: resolve(__dirname, "career.html"),
        services: resolve(__dirname, "services.html"),
      },
    },
  },
});
