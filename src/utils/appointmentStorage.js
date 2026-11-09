import { validDateISO } from "./appointmentDates.js";

export const STORAGE_KEY = "autoglass-agendamentos-v1";

// Apenas a ausência da chave indica a primeira utilização. Uma lista vazia é válida.
export function readAppointments(raw, demo) {
  if (raw === null) return demo;
  const items = JSON.parse(raw);
  if (!Array.isArray(items)) throw new Error("Lista de agendamentos inválida.");
  const ids = new Set();
  return items.map((item) => {
    const dateISO = item?.dateISO || item?.date?.split("/").reverse().join("-");
    if (!validDateISO(dateISO) || item.id == null || ids.has(String(item.id))) {
      throw new Error("O histórico contém uma data ou identificação inválida.");
    }
    ids.add(String(item.id));
    const next = { ...item, dateISO, date: dateISO.split("-").reverse().join("/") };
    for (const key of ["suppliers", "volumeTypes", "invoices", "history", "documentFiles"]) {
      if (next[key] == null) next[key] = [];
      if (!Array.isArray(next[key])) throw new Error("Lista de dados da entrega inválida: " + key);
    }
    return next;
  });
}
