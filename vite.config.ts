import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Cloudinary config — baked in at build time (no secret exposed, upload preset is public)
const CLOUDINARY_CLOUD_NAME    = process.env.CLOUDINARY_CLOUD_NAME    ?? "dguj5ncu4";
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET ?? "Wibiz_Acad";

export default defineConfig({
  plugins: [react()],
  define: {
    __CLOUDINARY_CLOUD_NAME__:    JSON.stringify(CLOUDINARY_CLOUD_NAME),
    __CLOUDINARY_UPLOAD_PRESET__: JSON.stringify(CLOUDINARY_UPLOAD_PRESET),
  },
  root: "client",
  build: {
    outDir: path.resolve(__dirname, "client/dist"),
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
