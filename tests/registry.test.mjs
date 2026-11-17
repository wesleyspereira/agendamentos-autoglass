import test from "node:test";
import assert from "node:assert/strict";
import { saveSupplier, findSupplier, saveUser } from "../src/utils/registry.js";
const empty = { suppliers: [], users: [] };
const fixture = { name: "Vidros Sul", cnpjs: ["12.345.678/0001-00", "12.345.678/0002-00"] };
test("matriz e filial identificam o mesmo cadastro; CNPJ ausente não corresponde", () => {
  const { suppliers } = saveSupplier(empty, fixture);
  assert.equal(
    findSupplier(suppliers, fixture.cnpjs[0]).id,
    findSupplier(suppliers, "12345678000200").id,
  );
  assert.equal(findSupplier(suppliers, "12345678000300"), undefined);
});
test("edição mantém o ID e impede compartilhar CNPJ com outro fornecedor", () => {
  const data = saveSupplier(empty, fixture);
  const record = data.suppliers[0];
  assert.equal(
    saveSupplier(data, { ...record, cnpjs: [...record.cnpjs, "12345678000300"] }).suppliers[0].id,
    record.id,
  );
  assert.throws(() => saveSupplier(data, fixture), /vinculado/);
  assert.throws(() => saveSupplier(empty, { ...fixture, cnpjs: ["123", ""] }));
});
test("cadastro de usuário rejeita o mesmo e-mail com outra capitalização", () => {
  const data = saveUser(empty, { name: "Wendel", email: "Wendel@example.com" });
  assert.throws(() => saveUser(data, { name: "Outro", email: "wendel@example.com" }));
});
