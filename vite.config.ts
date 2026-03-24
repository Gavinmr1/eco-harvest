import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    svgr({
      include: "**/*.svg?react",
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("firebase")) {
            return "vendor-firebase";
          }

          if (id.includes("react-slick") || id.includes("slick-carousel")) {
            return "vendor-carousel";
          }

          if (id.includes("react") || id.includes("scheduler")) {
            return "vendor-react";
          }

          return "vendor-misc";
        },
      },
    },
  },
});
