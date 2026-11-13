export function readFiscalDocument(form) {
  const documentNumber = String(
    form.get("documentNumber") ?? "",
  ).trim();

  const documentKey = String(
    form.get("documentKey") ?? "",
  ).trim();

  const cteNumber = String(
    form.get("cteNumber") ?? "",
  ).trim();

  const cteKey = String(
    form.get("cteKey") ?? "",
  ).trim();

  // O MDF-e é o documento principal obrigatório da entrega.
  if (!documentNumber) {
    throw new Error("Informe o número do MDF-e.");
  }

  if (!/^\d+$/.test(documentNumber)) {
    throw new Error("O número do MDF-e deve conter apenas números.");
  }

  if (documentKey && !/^\d{44}$/.test(documentKey)) {
    throw new Error(
      "A chave de acesso do MDF-e deve conter exatamente 44 números.",
    );
  }

  // O CT-e é opcional, mas os dados preenchidos precisam ser válidos.
  if (cteNumber && !/^\d+$/.test(cteNumber)) {
    throw new Error("O número do CT-e deve conter apenas números.");
  }

  if (cteKey && !cteNumber) {
    throw new Error(
      "Informe o número do CT-e ou apague sua chave de acesso.",
    );
  }

  if (cteKey && !/^\d{44}$/.test(cteKey)) {
    throw new Error(
      "A chave de acesso do CT-e deve conter exatamente 44 números.",
    );
  }

  // Mantém os campos principais usados nas demais páginas.
  // Os números permanecem como texto para preservar zeros à esquerda.
  return {
    documentType: "MDF-e",
    documentNumber,
    documentKey,
    cteNumber,
    cteKey,
  };
}