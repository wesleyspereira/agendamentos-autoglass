import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Habilita a transformação de JSX e a atualização dos componentes durante o desenvolvimento.
export default defineConfig({
  // No Pages, a aplicação fica em uma subpasta. Os arquivos acompanham o HTML.
  base: "./",
  plugins: [react()],
});
