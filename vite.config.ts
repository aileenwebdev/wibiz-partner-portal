import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: "client",
  build: {
    outDir: "../client/dist",
    emptyOutDir: true,
    rollupOptions: {
      // Prevent Rollup from trying to bundle server-side modules.
      // AppRouter is imported as `import type` so it's erased at compile
      // time — this external declaration is a belt-and-suspenders guard.
      external: (id) =>
        (id.startsWith("/") || id.startsWith(".")) &&
        id.includes("/server/") &&
        !id.includes("node_modules"),
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
