import test from "node:test";
import assert from "node:assert/strict";
import { slotStatus } from "../src/utils/appointmentSlots.js";
import { readAppointments } from "../src/utils/appointmentStorage.js";
import { deliveryIssues, OPENED, RESOLVED } from "../src/utils/deliveryIssues.js";

test("novo agendamento recusa datas inexistentes e aceita o dia bissexto válido", () => {
  const now = new Date(2026, 0, 1);
  for (const date of ["2026-02-29", "2026-04-31", "29/02/2028"]) {
    assert.equal(slotStatus([], date, "09:30", now), "invalid");
  }
  assert.equal(slotStatus([], "2028-02-29", "09:30", now), "available");
});

test("apenas a primeira utilização carrega a demonstração; histórico ilegível não a substitui", () => {
  const demo = [{ id: 1 }];
  assert.equal(readAppointments(null, demo), demo);
  assert.deepEqual(readAppointments("[]", demo), []);
  for (const raw of ["", "{}", "[null]", '[{"id":1,"date":"31/04/2026"}]']) {
    assert.throws(() => readAppointments(raw, demo));
  }
});

test("registro antigo conserva o ID e os campos próprios ao normalizar a data", () => {
  const [item] = readAppointments('[{"id":7,"date":"21/07/2026","plate":"ABC1D23"}]', []);
  assert.equal(item.dateISO, "2026-07-21");
  assert.equal(item.plate, "ABC1D23");
  assert.equal(item.id, 7);
  assert.deepEqual(item.history, []);
});

test("o relatório e o painel associam a solução apenas à ocorrência correspondente", () => {
  const items = deliveryIssues([
    { title: OPENED, id: "a" },
    { title: OPENED, id: "b" },
    { title: "Ressalva anexada", id: "c" },
    { title: RESOLVED, occurrenceId: "b", details: "Conferido" },
  ]);
  assert.equal(items.length, 2);
  assert.equal(items[0].solution, undefined);
  assert.equal(items[1].solution.details, "Conferido");
});
