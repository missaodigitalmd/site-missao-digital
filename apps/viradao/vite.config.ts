import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// Fase 3: app estático + PWA (offline). O service worker faz o app e as imagens
// sobreviverem a recarregar/modo avião; o áudio é cacheado sob demanda ao tocar
// (não os ~25MB de uma vez). Supabase NÃO é interceptado: vai sempre à rede, e a
// fila offline do app cuida das escritas que falharem.
export default defineConfig({
  // Deploy como sub-app do site da Missao Digital: missaodigitalmd.com/viradao
  // (a pasta buildada vira public/viradao/ no repo site-missao-digital).
  base: "/viradao/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      scope: "/viradao/",
      manifest: {
        name: "App da Missão - Viradão",
        short_name: "Viradão",
        description: "Brincadeira Noturna do Viradão",
        lang: "pt-BR",
        theme_color: "#0A0E14",
        background_color: "#0A0E14",
        display: "standalone",
        orientation: "portrait",
        scope: "/viradao/",
        start_url: "/viradao/",
      },
      workbox: {
        // precache: app shell (js/css/html) + fontes + todas as imagens da história
        globPatterns: [
          "**/*.{js,css,html,woff,woff2}",
          "images/**/*.{png,jpg,jpeg,webp,svg}",
        ],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: "/viradao/index.html",
        runtimeCaching: [
          {
            // narrações: baixa na 1a vez que tocar e guarda para o offline
            urlPattern: ({ url }) => url.pathname.includes("/audio/"),
            handler: "CacheFirst",
            options: {
              cacheName: "viradao-audio",
              rangeRequests: true,
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200, 206] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: { host: true },
});
