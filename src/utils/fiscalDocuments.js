// A identificação fiscal será feita depois. O nome do arquivo não é um número de nota.
export function validateFiscalFiles(invoices, transport) {
  if (!invoices.length) throw new Error("Anexe pelo menos uma nota fiscal para continuar.");
  for (const file of [...invoices, ...transport]) {
    if (!/\.(pdf|xml)$/i.test(file.name) || !file.size)
      throw new Error("Selecione arquivos PDF ou XML não vazios.");
  }
}
export function documentLabel(item) {
  return (
    [item.documentType, item.documentNumber].filter(Boolean).join(" ") ||
    item.document ||
    item.invoices?.[0] ||
    "Não informado"
  );
}
