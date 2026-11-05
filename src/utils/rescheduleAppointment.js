import { appointmentDateKey } from "./appointmentDates.js"
import { AVAILABLE_TIMES, findSlotConflict, isPastSlot } from "./appointmentSlots.js"

// A edição do horário mantém o mesmo ID, a carga e os documentos cadastrados.
export function canReschedule(appointment) {
  return Boolean(appointment && ["pending", "approved"].includes(appointment.status))
}

export function formatRescheduleDate(dateISO) {
  return dateISO.split("-").reverse().join("/")
}

function validDateISO(dateISO) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) return false
  const parsed = new Date(`${dateISO}T12:00:00.000Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === dateISO
}

// Durante a edição, o horário do próprio agendamento não é tratado como conflito.
export function rescheduleSlotStatus(appointments, appointment, dateISO, time, now = new Date()) {
  if (!validDateISO(dateISO) || !AVAILABLE_TIMES.includes(time)) return "invalid"
  if (isPastSlot(dateISO, time, now)) return "past"
  if (findSlotConflict(appointments, dateISO, time, appointment?.id)) return "occupied"
  if (appointment && appointmentDateKey(appointment) === dateISO && appointment.time === time) return "current"
  return "available"
}

// Função pura: pode ser testada sem interface e não altera a lista original.
export function prepareReschedule(appointments, appointmentId, dateISO, time, reason = "", now = new Date()) {
  const appointment = appointments.find((item) => String(item.id) === String(appointmentId))
  if (!appointment) return { error: "Agendamento não encontrado." }
  if (!canReschedule(appointment)) return { error: "Somente entregas pendentes ou aprovadas podem ser reagendadas." }

  const status = rescheduleSlotStatus(appointments, appointment, dateISO, time, now)
  if (status === "invalid") return { error: "Escolha uma data válida e um horário da agenda." }
  if (status === "past") return { error: "Não é possível reagendar para um horário que já passou." }
  if (status === "occupied") return { error: "Este horário já está ocupado. Escolha outra opção." }
  if (status === "current") return { error: "Escolha uma data ou horário diferente do atual." }

  const previousDate = appointment.date
  const previousTime = appointment.time
  const nextDate = formatRescheduleDate(dateISO)
  const cleanedReason = String(reason).trim()
  const needsApproval = appointment.status === "approved"
  const event = {
    id: globalThis.crypto?.randomUUID?.() ?? `reagendamento-${now.getTime()}`,
    title: "Entrega reagendada",
    at: now.toISOString(),
    tone: "blue",
    details: `${previousDate} às ${previousTime} → ${nextDate} às ${time}.${cleanedReason ? ` Motivo: ${cleanedReason}.` : ""}${needsApproval ? " Aguarda nova aprovação." : ""}`,
    from: { date: previousDate, time: previousTime },
    to: { date: nextDate, time },
    reason: cleanedReason,
  }

  const updatedAppointment = {
    ...appointment,
    date: nextDate,
    dateISO,
    time,
    status: "pending", // Requer nova aprovação quando estava aprovado.
    verified: false, // Verificação feita para a data antiga não é reaproveitada.
    updatedAt: now.toISOString(),
    history: [...(appointment.history || []), event],
  }

  return {
    appointment: updatedAppointment,
    appointments: appointments.map((item) => String(item.id) === String(appointmentId) ? updatedAppointment : item),
  }
}
