import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["elisa-cad.png"], // remove icon files
        manifest: {
          name: "Viona Screening",
          short_name: "Viona",
          start_url: "/",
          scope: "/",
          display: "standalone",
          background_color: "#ffffff",
          theme_color: "#0f172a",
          // icons: []  // remove this completely
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,png,svg,ico,json}"],
          navigateFallback: "/index.html",
        },
      })
  ],
});