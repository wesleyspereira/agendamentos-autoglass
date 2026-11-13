// Define quais campos aparecem para cada tipo de volume.
export const cargoModes = {
  Palete: ["pallets"],
  Caixas: ["boxes"],

  // Ambos solicita somente paletes e caixas.
  Ambos: ["pallets", "boxes"],

  // Opção separada para quem conhece o volume em metros cúbicos.
  "Metragem da carga": ["cubicMeters"],
};

// Valida e retorna somente os campos do tipo selecionado.
export function readCargo(mode, data) {
  const fields = cargoModes[mode];

  if (!fields) {
    throw new Error("Selecione um tipo de volume válido.");
  }

  const cargo = {};

  for (const field of fields) {
    const raw = String(data.get(field) ?? "").trim();
    const isMeasurement = field === "cubicMeters";
    const value = Number(raw.replace(",", "."));

    const validFormat = isMeasurement
      ? /^\d+(?:[.,]\d+)?$/.test(raw)
      : /^\d+$/.test(raw);

    if (
      !validFormat ||
      !Number.isFinite(value) ||
      value <= 0 ||
      (!isMeasurement && !Number.isSafeInteger(value))
    ) {
      throw new Error(
        isMeasurement
          ? "Informe uma metragem maior que zero, por exemplo 42,50."
          : "Informe uma quantidade inteira maior que zero para cada embalagem selecionada.",
      );
    }

    cargo[field] = value;
  }

  return cargo;
}

// Monta o resumo exibido nos fornecedores e nas demais telas.
export function cargoSummary(item) {
  // Mantém a compatibilidade com agendamentos antigos.
  if (!item.cargo) {
    return (
      [item.volumes, item.volumeTypes?.join(" + ")]
        .filter(Boolean)
        .join(" · ") || "—"
    );
  }

  const { pallets, boxes, cubicMeters } = item.cargo;

  const summary = [
    pallets && (pallets === 1 ? "1 palete" : `${pallets} paletes`),

    boxes && (boxes === 1 ? "1 caixa" : `${boxes} caixas`),

    cubicMeters &&
      `${cubicMeters.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 20,
      })} m³`,
  ];

  return summary.filter(Boolean).join(" · ") || "—";
}