import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import App from "./App";
import { AppointmentsProvider } from "./context/AppointmentsContext";

import "./styles/global.css"
import "./styles/transport-screens.css"

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            {/* Disponibiliza a mesma lista para todas as páginas do App. */}
            <AppointmentsProvider>
                <App />
            </AppointmentsProvider>
        </BrowserRouter>
    </StrictMode>
)