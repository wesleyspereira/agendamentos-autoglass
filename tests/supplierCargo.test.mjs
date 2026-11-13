import test from "node:test";
import assert from "node:assert/strict";
import { createSupplier, readSupplier, sumSupplierCargo } from "../src/utils/supplierCargo.js";

const supplier = (changes = {}) => ({
  ...createSupplier(),
  name: "Vidros Sul",
  cnpj: "00.000.000/0000-00",
  pallets: "8",
  boxes: "24",
  cubicMeters: "42,50",
  ...changes,
});

test("cada fornecedor salva apenas as quantidades do tipo selecionado", () => {
  for (const [volumeType, expected] of [
    ["Palete", { pallets: 8 }],
    ["Caixas", { boxes: 24 }],
    ["Ambos", { pallets: 8, boxes: 24, cubicMeters: 42.5 }],
    ["Metragem da carga", { cubicMeters: 42.5 }],
  ]) {
    assert.deepEqual(readSupplier(supplier({ volumeType })).cargo, expected);
  }
});

test("soma cargas sem perder a distribuição por fornecedor após salvar", () => {
  const details = [
    readSupplier(supplier({ volumeType: "Palete" }), true),
    readSupplier(supplier({ name: "Outro fornecedor", volumeType: "Ambos" }), true),
  ];
  assert.notEqual(details[0].id, details[1].id);
  const restored = JSON.parse(JSON.stringify(details));
  assert.deepEqual(sumSupplierCargo(restored), {
    cargo: { pallets: 16, boxes: 24, cubicMeters: 42.5 },
    volumeTypes: ["Paletes", "Caixas"],
  });
  assert.deepEqual(restored[0].cargo, { pallets: 8 });
  assert.equal(sumSupplierCargo(restored.slice(1)).cargo.pallets, 8);
});

test("valida fornecedor e quantidades inclusive quando o painel estiver recolhido", () => {
  assert.throws(() => readSupplier(supplier({ name: "  " })));
  assert.throws(() => readSupplier(supplier({ pallets: "0" })));
  assert.throws(() => readSupplier(supplier({ volumeType: "Ambos", cubicMeters: "" })));
  assert.throws(() => readSupplier(supplier({ volumeType: "desconhecido" })));
});

test("não inclui CNPJ no registro criado pelo formulário externo", () => {
  assert.equal(readSupplier(supplier()).cnpj, undefined);
  assert.equal(readSupplier(supplier(), true).cnpj, "00.000.000/0000-00");
});

test("metragem total não mostra resíduos de soma decimal", () => {
  const details = ["0,1", "0,2"].map((cubicMeters) =>
    readSupplier(supplier({ volumeType: "Metragem da carga", cubicMeters })),
  );
  assert.equal(sumSupplierCargo(details).cargo.cubicMeters, 0.3);
});
