import test from "node:test"
import assert from "node:assert/strict"
import { AVAILABLE_TIMES, findSlotConflict, isPastSlot, slotStatus } from "../src/utils/appointmentSlots.js"

const testDate = "2026-11-12"
const now = new Date(2026, 10, 5, 10, 0, 0)
const book = (id, status, time = "09:30", date = "12/11/2026") => ({ id, status, time, date })

test("a lista de horários permanece padronizada", () => {
  assert.equal(AVAILABLE_TIMES.length, 12)
  assert.ok(AVAILABLE_TIMES.includes("09:30"))
})

test("um agendamento pendente bloqueia o mesmo horário", () => {
  const appointments = [book(1, "pending")]
  assert.equal(slotStatus(appointments, testDate, "09:30", now), "occupied")
  assert.equal(slotStatus(appointments, testDate, "10:00", now), "available")
})

test("agendamento recusado libera novamente o horário", () => {
  assert.equal(slotStatus([book(1, "rejected")], testDate, "09:30", now), "available")
})

test("aprovado, em andamento e concluído continuam ocupando", () => {
  for (const status of ["approved", "progress", "completed"]) {
    assert.equal(slotStatus([book(1, status)], testDate, "09:30", now), "occupied")
  }
})

test("uma data diferente e outro horário não geram conflito", () => {
  assert.equal(findSlotConflict([book(1, "approved")], "2026-11-13", "09:30"), null)
  assert.equal(findSlotConflict([book(1, "approved")], testDate, "08:00"), null)
})

test("ignora o próprio agendamento e valida registros com dateISO", () => {
  const appointments = [{ id: "abc", status: "approved", dateISO: testDate, time: "09:30" }]
  assert.equal(findSlotConflict(appointments, testDate, "09:30", "abc"), null)
  assert.equal(findSlotConflict(appointments, testDate, "09:30")?.id, "abc")
})

test("na aprovação, considera apenas estados já confirmados", () => {
  const pending = book(1, "pending")
  const approved = book(2, "approved")
  assert.equal(findSlotConflict([pending], testDate, "09:30", 3, ["approved", "progress", "completed"]), null)
  assert.equal(findSlotConflict([pending, approved], testDate, "09:30", 1, ["approved", "progress", "completed"])?.id, 2)
})

test("impede horários passados, inclusive dentro do dia atual", () => {
  assert.equal(isPastSlot("2026-11-04", "16:00", now), true)
  assert.equal(isPastSlot("2026-11-05", "09:30", now), true)
  assert.equal(isPastSlot("2026-11-05", "10:00", now), true)
  assert.equal(isPastSlot("2026-11-05", "10:30", now), false)
  assert.equal(isPastSlot("2026-11-06", "07:30", now), false)
})
