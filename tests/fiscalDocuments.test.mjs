import test from "node:test";
import assert from "node:assert/strict";
import { readFiscalDocument } from "../src/utils/fiscalDocuments.js";
const input = (type, n, key = "") =>
  new Map([
    ["documentType", type],
    ["documentNumber", n],
    ["documentKey", key],
  ]);
test("CT-e preserva zeros no número e aceita chave vazia", () =>
  assert.deepEqual(readFiscalDocument(input("CT-e", " 00014 ")), {
    documentType: "CT-e",
    documentNumber: "00014",
    documentKey: "",
  }));
test("MDF-e preserva os 44 dígitos da chave", () =>
  assert.equal(
    readFiscalDocument(input("MDF-e", "15", "0".repeat(44))).documentKey,
    "0".repeat(44),
  ));
test("documento sem número, tipo inválido ou chave incorreta não avança", () => {
  for (const form of [
    input("NF-e", "12"),
    input("CT-e", "  "),
    input("CT-e", "12", "12"),
    input("MDF-e", "12", "x".repeat(44)),
  ])
    assert.throws(() => readFiscalDocument(form));
});
