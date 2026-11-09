import { appointmentDateKey, localDateKey, validDateISO } from "./appointmentDates.js";

// Horários definidos para os recebimentos (uma entrega por horário).
export const AVAILABLE_TIMES = [
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "12:30",
  "14:00",
  "15:30",
  "16:00",
];

// Um agendamento recusado libera a vaga. Pendente, aprovado,
// em andamento e concluído continuam ocupando a data e o horário.
export function findSlotConflict(appointments, dateISO, time, excludeId = null, statuses = null) {
  if (!dateISO || !time) return null;

  return (
    appointments.find(
      (appointment) =>
        String(appointment.id) !== String(excludeId) &&
        appointmentDateKey(appointment) === dateISO &&
        appointment.time === time &&
        (statuses ? statuses.includes(appointment.status) : appointment.status !== "rejected"),
    ) ?? null
  );
}

export function isPastSlot(dateISO, time, now = new Date()) {
  if (!dateISO || !time) return true;

  const currentDate = localDateKey(now);
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return dateISO < currentDate || (dateISO === currentDate && time <= currentTime);
}

export function slotStatus(appointments, dateISO, time, now = new Date()) {
  if (!validDateISO(dateISO) || !AVAILABLE_TIMES.includes(time)) return "invalid";
  if (isPastSlot(dateISO, time, now)) return "past";
  if (findSlotConflict(appointments, dateISO, time)) return "occupied";
  return "available";
}
