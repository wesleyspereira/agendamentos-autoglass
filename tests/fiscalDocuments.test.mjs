import test from "node:test";
import assert from "node:assert/strict";
import { validateFiscalFiles, documentLabel } from "../src/utils/fiscalDocuments.js";
const nota = { name: "Nota.PDF", size: 50 };
const cte = { name: "transporte.xml", size: 100 };
test("CT-e não substitui uma NF; uma NF dispensa o CT-e", () => {
  assert.throws(() => validateFiscalFiles([], [cte]), /nota fiscal/);
  validateFiscalFiles([nota], []);
  validateFiscalFiles([nota], [cte]);
});
test("rejeita anexos vazios e extensões não permitidas", () => {
  assert.throws(() => validateFiscalFiles([{ ...nota, size: 0 }], []));
  assert.throws(() => validateFiscalFiles([nota], [{ ...cte, name: "imagem.png" }]));
});
test("consulta preserva documentos antigos e identifica novos pelo nome do anexo", () => {
  assert.equal(
    documentLabel({ documentType: "MDF-e", documentNumber: "0005", invoices: ["nf.pdf"] }),
    "MDF-e 0005",
  );
  assert.equal(documentLabel({ invoices: ["nf.pdf"] }), "nf.pdf");
});
