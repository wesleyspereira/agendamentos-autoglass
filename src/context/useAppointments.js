import { createContext, useContext } from "react";

export const AppointmentsContext = createContext(null);

export function useAppointments() {
  const context = useContext(AppointmentsContext);

  if (!context) {
    throw new Error("useAppointments deve ser usado dentro de AppointmentsProvider.");
  }

  return context;
}
