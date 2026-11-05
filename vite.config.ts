import { defineConfig } from "vite";

export default defineConfig({
  server: { port: 5173 },
  // весь контент (~1.6 МБ) лежит в одном чанке, это ожидаемо
  build: { target: "es2022", chunkSizeWarningLimit: 2000 },
});
