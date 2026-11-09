export const cargoModes = {
  Palete: ["pallets"],
  Caixas: ["boxes"],
  Ambos: ["pallets", "boxes", "cubicMeters"],
  "Metragem da carga": ["cubicMeters"],
};

export function readCargo(mode, data) {
  const cargo = {};
  for (const field of cargoModes[mode]) {
    const raw = String(data.get(field) ?? "").trim();
    const measure = field === "cubicMeters";
    const value = Number(raw.replace(",", "."));
    if (
      !(measure ? /^\d+(?:[.,]\d+)?$/ : /^\d+$/).test(raw) ||
      !Number.isFinite(value) ||
      value <= 0 ||
      (!measure && !Number.isSafeInteger(value))
    ) {
      throw new Error(
        measure
          ? "Informe uma metragem maior que zero, por exemplo 42,50."
          : "Informe uma quantidade inteira maior que zero para cada embalagem selecionada.",
      );
    }
    cargo[field] = value;
  }
  return cargo;
}

export function cargoSummary(item) {
  if (!item.cargo)
    return [item.volumes, item.volumeTypes?.join(" + ")].filter(Boolean).join(" · ") || "—";
  const { pallets, boxes, cubicMeters } = item.cargo;
  return [
    pallets && (pallets === 1 ? "1 palete" : pallets + " paletes"),
    boxes && (boxes === 1 ? "1 caixa" : boxes + " caixas"),
    cubicMeters &&
      cubicMeters.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 20 }) +
        " m³",
  ]
    .filter(Boolean)
    .join(" · ");
}
