import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  // 트레이너 앱(/)과 학생 앱(/student/)을 한 프로젝트에서 같이 빌드한다
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        student: resolve(__dirname, "student/index.html"),
      },
    },
  },
  server: {
    proxy: {
      "/api/claude": {
        target: "https://api.anthropic.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/claude/, "/v1/messages"),
        headers: {
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
      },
    },
  },
});
