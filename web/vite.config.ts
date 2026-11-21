import { defineConfig } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  resolve: {
    alias: {
      // @ts-expect-error
      "@src": path.resolve(__dirname, "./src"),
    },
  },
  // Same-origin API/WebSocket proxies for local UI work against the campus backend.
  // Other modes, including production builds, keep their existing configuration.
  ...(mode === "campus" ? {
    server: {
      host: "127.0.0.1",
      port: 5173,
      strictPort: true,
      proxy: {
        "/api/v1": { target: "http://127.0.0.1:43803", changeOrigin: true },
        "/record-api": {
          target: "http://127.0.0.1:43801",
          changeOrigin: true,
          rewrite: (url) => url.replace(/^\/record-api/, ""),
        },
        "/socket.io": { target: "http://127.0.0.1:43804", ws: true },
        "^/ws(event|picking|arrivalpick)(\\?|$)": { target: "ws://127.0.0.1:43805", ws: true },
      },
    },
  } : {}),
  // Hot-reload UI against the local Docker stack (`docker compose up`, then `npm run dev:local`).
  // The stack's web container already proxies every backend path, so one target is enough.
  ...(mode === "local" ? {
    server: {
      host: "127.0.0.1",
      port: 5173,
      strictPort: true,
      proxy: Object.fromEntries(
        ["/api/v1", "/record-api", "/socket.io", "^/ws(event|picking|arrivalpick)(\\?|$)"].map((p) => [
          p,
          { target: process.env.SEISRA_STACK_URL ?? "http://127.0.0.1:8080", ws: true, changeOrigin: true },
        ]),
      ),
    },
  } : {}),
  // UI preview: fixture data, no backend or SSH needed (`npm run dev:preview`).
  // Port 5174 so it can run beside the campus session on 5173.
  ...(mode === "preview" ? {
    define: { "import.meta.env.VITE_UI_PREVIEW": JSON.stringify("true") },
    // .trycloudflare.com: lets a Cloudflare quick tunnel show the preview on another device.
    server: { host: "127.0.0.1", port: 5174, strictPort: true, allowedHosts: [".trycloudflare.com"] },
  } : {}),
}));
