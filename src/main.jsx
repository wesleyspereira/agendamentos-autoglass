import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";

import App from "./App";
import { AppointmentsProvider } from "./context/AppointmentsContext";

import "./styles/global.css";
import "./styles/transport-screens.css";

// A hospedagem estática recebe apenas o caminho antes de #, inclusive ao recarregar uma tela.
const Router = import.meta.env.PROD ? HashRouter : BrowserRouter;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      {/* Disponibiliza a mesma lista para todas as páginas do App. */}
      <AppointmentsProvider>
        <App />
      </AppointmentsProvider>
    </Router>
  </StrictMode>,
);
