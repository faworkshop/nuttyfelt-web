import { resolve } from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        works: resolve(__dirname, "works.html"),
        halo: resolve(__dirname, "halo.html"),
        process: resolve(__dirname, "process.html"),
        about: resolve(__dirname, "about.html"),
        faq: resolve(__dirname, "faq.html"),
        commission: resolve(__dirname, "commission.html"),
      },
    },
  },
});
