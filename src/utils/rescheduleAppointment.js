import { appointmentDateKey, validDateISO } from "./appointmentDates.js";
import { AVAILABLE_TIMES, findSlotConflict, isPastSlot } from "./appointmentSlots.js";

// O reagendamento só é permitido antes da entrada na portaria.
export function canReschedule(appointment) {
  return Boolean(
    appointment && !appointment.gateEntryAt && ["pending", "approved"].includes(appointment.status),
  );
}

export function formatRescheduleDate(dateISO) {
  return dateISO.split("-").reverse().join("/");
}

// O horário da própria entrega é identificado como "current", não como ocupado.
export function rescheduleSlotStatus(appointments, appointment, dateISO, time, now = new Date()) {
  if (!validDateISO(dateISO) || !AVAILABLE_TIMES.includes(time)) {
    return "invalid";
  }

  if (isPastSlot(dateISO, time, now)) {
    return "past";
  }

  if (findSlotConflict(appointments, dateISO, time, appointment?.id)) {
    return "occupied";
  }

  if (appointment && appointmentDateKey(appointment) === dateISO && appointment.time === time) {
    return "current";
  }

  return "available";
}

// Prepara o agendamento atualizado sem modificar a lista original.
export function prepareReschedule(
  appointments,
  appointmentId,
  dateISO,
  time,
  reason = "",
  now = new Date(),
) {
  const appointment = appointments.find((item) => String(item.id) === String(appointmentId));

  if (!appointment) {
    return { error: "Agendamento não encontrado." };
  }

  if (!canReschedule(appointment)) {
    return {
      error: appointment.gateEntryAt
        ? "Não é possível reagendar após a entrada na portaria."
        : "Somente entregas pendentes ou aprovadas podem ser reagendadas.",
    };
  }

  const slotStatus = rescheduleSlotStatus(appointments, appointment, dateISO, time, now);

  switch (slotStatus) {
    case "invalid":
      return { error: "Escolha uma data válida e um horário da agenda." };

    case "past":
      return { error: "Não é possível reagendar para um horário que já passou." };

    case "occupied":
      return { error: "Este horário já está ocupado. Escolha outra opção." };

    case "current":
      return { error: "Escolha uma data ou horário diferente do atual." };
  }

  const previousDate = appointment.date;
  const previousTime = appointment.time;
  const nextDate = formatRescheduleDate(dateISO);
  const cleanedReason = String(reason).trim();
  const needsApproval = appointment.status === "approved";
  const updatedAt = now.toISOString();

  const details = [
    `${previousDate} às ${previousTime} → ${nextDate} às ${time}.`,
    cleanedReason ? `Motivo: ${cleanedReason}.` : "",
    needsApproval ? "Aguarda nova aprovação." : "",
  ]
    .filter(Boolean)
    .join(" ");

  const event = {
    id: globalThis.crypto?.randomUUID?.() ?? `reagendamento-${now.getTime()}`,
    title: "Entrega reagendada",
    at: updatedAt,
    tone: "blue",
    details,
    from: { date: previousDate, time: previousTime },
    to: { date: nextDate, time },
    reason: cleanedReason,
  };

  // Preserva ID, carga e documentos. A nova data exige aprovação e conferência.
  const updatedAppointment = {
    ...appointment,
    date: nextDate,
    dateISO,
    time,
    status: "pending",
    verified: false,
    updatedAt,
    history: [...(appointment.history || []), event],
  };

  return {
    appointment: updatedAppointment,
    appointments: appointments.map((item) =>
      String(item.id) === String(appointmentId) ? updatedAppointment : item,
    ),
  };
}
