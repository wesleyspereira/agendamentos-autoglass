// A chave de acesso é opcional. Mantemos os números como texto para preservar zeros à esquerda.
export function readFiscalDocument(form) {
  const documentType = String(form.get("documentType") ?? "");
  const documentNumber = String(form.get("documentNumber") ?? "").trim();
  const documentKey = String(form.get("documentKey") ?? "").trim();
  if (!["CT-e", "MDF-e"].includes(documentType)) throw new Error("Selecione CT-e ou MDF-e.");
  if (!documentNumber) throw new Error("Informe o número do documento fiscal.");
  if (documentKey && !/^\d{44}$/.test(documentKey))
    throw new Error(
      "A chave de acesso deve ter 44 dígitos. Se não for informá-la, deixe o campo vazio.",
    );
  return { documentType, documentNumber, documentKey };
}
