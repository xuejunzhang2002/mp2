import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync } from "node:fs";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "github-pages-routes",
      closeBundle() {
        // GitHub Pages serves this file for direct visits to detail routes.
        copyFileSync("dist/index.html", "dist/404.html");
      },
    },
  ],
  base: "/mp2/",
});
