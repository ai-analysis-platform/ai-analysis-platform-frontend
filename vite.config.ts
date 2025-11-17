import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  server: {
    port: 5173,
    open: false,
  },
  preview: {
    port: 4173,
  },
  envPrefix: ["NEXT_PUBLIC_", "VITE_"],
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },
});
