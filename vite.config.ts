import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/staccato-live-chat-demo/",
  plugins: [react()],
});
