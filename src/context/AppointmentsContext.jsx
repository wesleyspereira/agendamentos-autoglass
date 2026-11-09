import { useEffect, useState } from "react";
import { transportAppointments } from "../data/transportAppointments";
import { AppointmentsContext } from "./useAppointments";
import { readAppointments, STORAGE_KEY } from "../utils/appointmentStorage";

export function AppointmentsProvider({ children }) {
  const [initial] = useState(() => {
    try {
      return { items: readAppointments(localStorage.getItem(STORAGE_KEY), transportAppointments) };
    } catch {
      return {
        error:
          "Não foi possível ler os agendamentos deste navegador. Os dados não foram substituídos. Confira o armazenamento antes de tentar novamente.",
      };
    }
  });
  const [appointments, setAppointments] = useState(initial.items ?? []);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    // A abertura da página não deve gravar por cima de um histórico ilegível.
    if (initial.error || appointments === initial.items) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
      setStorageError("");
    } catch {
      setStorageError("As alterações estão na tela, mas não puderam ser salvas neste navegador.");
    }
  }, [appointments, initial]);

  if (initial.error)
    return (
      <main className="page-content">
        <h1>Agenda indisponível</h1>
        <p role="alert">{initial.error}</p>
        <button
          className="button button--outline"
          type="button"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </main>
    );

  return (
    <AppointmentsContext.Provider value={{ appointments, setAppointments, storageError }}>
      {storageError && <p role="alert">{storageError}</p>}
      {children}
    </AppointmentsContext.Provider>
  );
}
