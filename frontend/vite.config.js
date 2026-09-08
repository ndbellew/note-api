import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = {
    ...loadEnv(mode, process.cwd(), ""),
    ...process.env,
  };

  return {
    plugins: [react()],

    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,

      proxy: {
        "/api": {
          target: env.API_PROXY_TARGET ?? "http://localhost:5000",
          changeOrigin: true,
        },
      },
    },

    preview: {
      host: "0.0.0.0",
      port: 4173,
      strictPort: true,
    },

    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/setupTests.js",

      coverage: {
        provider: "v8",
        reporter: ["text", "html", "lcov"],

        exclude: [
          "src/main.jsx",
          "src/index.jsx",
          "src/reportWebVitals.jsx",
          "src/setupTests.js",
          "**/*.css",
          "**/*.svg",
        ],

        thresholds: {
          lines: 85,
          functions: 85,
          branches: 85,
          statements: 85,
        },
      },
    },
  };
});
