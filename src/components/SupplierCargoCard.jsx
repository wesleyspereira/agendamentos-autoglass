import CargoIcon from "./CargoIcon";
import { cargoModes, cargoSummary } from "../utils/cargo";
import { readSupplier } from "../utils/supplierCargo";

function SupplierCargoCard({
  supplier,
  index,
  internal,
  expanded,
  onToggle,
  onChange,
  onRemove,
  error,
}) {
  const panelId = `supplier-${supplier.id}`;
  const fields = cargoModes[supplier.volumeType];

  let summary = "Carga a preencher";

  try {
    summary = cargoSummary(readSupplier(supplier));
  } catch {
    // Exibe o resumo apenas quando os dados obrigatórios são válidos.
  }

  return (
    <section
      className="supplier-card"
      aria-label={`Fornecedor ${index + 1}`}
    >
      <div className="supplier-card__header">
        <button
          type="button"
          className="supplier-card__toggle"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span>
            <strong>
              {supplier.name.trim() || `Fornecedor ${index + 1}`}
            </strong>

            <small>
              {summary}
              {error ? " · Revisar dados" : ""}
            </small>
          </span>

          <span className="supplier-card__toggle-label">
            {expanded ? "Recolher ▴" : "Expandir ▾"}
          </span>
        </button>

        {onRemove && (
          <button
            type="button"
            className="supplier-card__remove"
            onClick={onRemove}
            aria-label={`Remover fornecedor ${index + 1}`}
          >
            ×
          </button>
        )}
      </div>

      <div
        id={panelId}
        className="supplier-card__body"
        hidden={!expanded}
      >
        <div className="cargo-supplier">
          {internal && (
            <label className="transport-field">
              <span>CNPJ</span>

              <input
                value={supplier.cnpj}
                placeholder="00.000.000/0000-00"
                onChange={(event) =>
                  onChange("cnpj", event.target.value)
                }
              />
            </label>
          )}

          <label className="transport-field">
            <span>Fornecedor</span>

            <input
              value={supplier.name}
              placeholder="Nome do fornecedor"
              required
              onChange={(event) =>
                onChange("name", event.target.value)
              }
            />
          </label>
        </div>

        <fieldset className="cargo-modes">
          <legend>Tipo de volume deste fornecedor</legend>

          <div>
            {Object.keys(cargoModes).map((mode) => (
              <label key={mode}>
                <input
                  type="radio"
                  name={`volumeType-${supplier.id}`}
                  value={mode}
                  checked={supplier.volumeType === mode}
                  onChange={() => onChange("volumeType", mode)}
                />

                <span>
                  <CargoIcon mode={mode} />
                  {mode === "Palete" ? "Paletes" : mode}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="cargo-quantities">
          {fields
            .filter((field) => field !== "cubicMeters")
            .map((field) => (
              <label key={field} className="transport-field">
                <span>
                  {field === "pallets"
                    ? "Quantidade de paletes"
                    : "Quantidade de caixas"}
                </span>

                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={supplier[field]}
                  onChange={(event) =>
                    onChange(field, event.target.value)
                  }
                />
              </label>
            ))}

          {fields.includes("cubicMeters") && (
            <label className="transport-field cargo-meter">
              <span>Metragem da carga</span>

              <span className="cargo-meter-input">
                <input
                  inputMode="decimal"
                  required
                  placeholder="Ex.: 42,50"
                  value={supplier.cubicMeters}
                  onChange={(event) =>
                    onChange("cubicMeters", event.target.value)
                  }
                />

                <b aria-hidden="true">m³ (metros cúbicos)</b>
              </span>
            </label>
          )}
        </div>

        {error && (
          <p className="form-feedback" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}

export default SupplierCargoCard;