import { test } from "node:test";
import assert from "node:assert/strict";
import { cargoModes, readCargo, cargoSummary } from "../src/utils/cargo.js";
const form = new Map([
  ["pallets", "8"],
  ["boxes", "24"],
  ["cubicMeters", "42,50"],
]);
const expected = [
  { pallets: 8 },
  { boxes: 24 },
  { pallets: 8, boxes: 24, cubicMeters: 42.5 },
  { cubicMeters: 42.5 },
];
Object.keys(cargoModes).forEach((mode, i) =>
  test(mode, () => {
    const saved = JSON.parse(JSON.stringify({ cargo: readCargo(mode, form) }));
    assert.deepEqual(saved.cargo, expected[i]);
    assert.equal(
      cargoSummary(saved),
      ["8 paletes", "24 caixas", "8 paletes · 24 caixas · 42,50 m³", "42,50 m³"][i],
    );
  }),
);
test("rejeita valores inválidos sem exigir campos ocultos", () => {
  for (const n of ["-1", "0", "0,0", "1,2,3", ""])
    assert.throws(() => readCargo("Metragem da carga", new Map([["cubicMeters", n]])));
  assert.throws(() => readCargo("Palete", new Map([["pallets", "1.2"]])));
  assert.deepEqual(readCargo("Caixas", new Map([["boxes", "2"]])), { boxes: 2 });
  assert.equal(
    cargoSummary({ volumes: 12, volumeTypes: ["Paletes", "Caixas"] }),
    "12 · Paletes + Caixas",
  );
});
