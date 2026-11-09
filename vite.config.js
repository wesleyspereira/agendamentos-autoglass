import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Habilita a transformação de JSX e a atualização dos componentes durante o desenvolvimento.
export default defineConfig({
  plugins: [react()],
});
