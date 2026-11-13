import { cargoModes, readCargo } from "./cargo.js";

// Cada fornecedor mantém suas próprias quantidades.
export function createSupplier() {
  return {
    id: crypto.randomUUID(),
    name: "",
    cnpj: "",
    volumeType: "Palete",
    pallets: "",
    boxes: "",
    cubicMeters: "",
  };
}

export function readSupplier(supplier, internal = false) {
  if (!supplier.name.trim()) {
    throw new Error("Informe o nome do fornecedor.");
  }

  if (!cargoModes[supplier.volumeType]) {
    throw new Error("Selecione o tipo de volume.");
  }

  return {
    id: supplier.id,
    name: supplier.name.trim(),
    ...(internal && { cnpj: supplier.cnpj.trim() }),
    volumeType: supplier.volumeType,

    // Campos de outros tipos de volume não entram no registro.
    cargo: readCargo(
      supplier.volumeType,
      new Map(Object.entries(supplier)),
    ),
  };
}

// Soma cada unidade separadamente para as outras telas da aplicação.
export function sumSupplierCargo(details) {
  const cargo = {};

  for (const supplier of details) {
    for (const [field, value] of Object.entries(supplier.cargo)) {
      cargo[field] = (cargo[field] || 0) + value;

      if (
        !Number.isFinite(cargo[field]) ||
        (field !== "cubicMeters" && !Number.isSafeInteger(cargo[field]))
      ) {
        throw new Error(
          "A quantidade total da carga é muito grande. Revise os valores.",
        );
      }
    }
  }

  if (cargo.cubicMeters) {
    cargo.cubicMeters = Number(cargo.cubicMeters.toPrecision(15));
  }

  const volumeTypes = [
    cargo.pallets && "Paletes",
    cargo.boxes && "Caixas",
    cargo.cubicMeters &&
      !cargo.pallets &&
      !cargo.boxes &&
      "Metragem da carga",
  ].filter(Boolean);

  return { cargo, volumeTypes };
}