import { useState } from "react";
import { Link } from "react-router-dom";

import Filter from "../components/Filter";
import PageHeader from "../components/PageHeader";
import PageToolbar from "../components/PageToolbar";
import { useAppointments } from "../context/useAppointments";
import { sortAppointments } from "../utils/appointmentDates";

const stages = {
  expected: "Aguardando chegada",
  gate: "Na portaria",
  receiving: "Em recebimento",
  shipment: "Aguardando remessa",
  finished: "Remessa criada",
};

function receivingStage(item) {
  if (item.status === "approved") return item.gateEntryAt ? "gate" : "expected";
  if (item.status === "progress") return "receiving";
  if (item.status === "completed") return item.shipment ? "finished" : "shipment";
  return null;
}

function searchable(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export default function Receiving() {
  const { appointments } = useAppointments();
  const [stage, setStage] = useState("");
  const [search, setSearch] = useState("");
  const term = searchable(search);

  const deliveries = sortAppointments(
    appointments.filter((item) => {
      const current = receivingStage(item);
      return (
        current &&
        (!stage || current === stage) &&
        [item.carrier, item.plate, item.shipment?.number].some((value) =>
          searchable(value).includes(term),
        )
      );
    }),
  );

  return (
    <main className="page-content">
      <PageHeader
        title="Recebimentos"
        subtitle="Acompanhe as entregas aprovadas, da chegada do veículo à criação da remessa."
      />

      <PageToolbar meta={deliveries.length === 1 ? "1 entrega" : deliveries.length + " entregas"}>
        <Filter label="Etapa" value={stage} onChange={(event) => setStage(event.target.value)}>
          <option value="">Todas as etapas</option>
          {Object.entries(stages).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Filter>
        <label className="transport-field">
          <span>Buscar por transportadora, placa ou remessa</span>
          <input
            type="search"
            value={search}
            placeholder="Ex.: ABC1D23"
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </PageToolbar>

      <section className="panel approval-list" aria-label="Entregas">
        {deliveries.length ? (
          <div className="table-container">
            <table className="approval-table">
              <thead>
                <tr>
                  <th>Transportadora</th>
                  <th>Entrega</th>
                  <th>Placa</th>
                  <th>Etapa</th>
                  <th>Remessa</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.carrier}</strong>
                    </td>
                    <td>
                      {item.date} às {item.time}
                    </td>
                    <td>{item.plate || "Não informada"}</td>
                    <td>{stages[receivingStage(item)]}</td>
                    <td>{item.shipment?.number || "—"}</td>
                    <td>
                      <Link
                        className="approval-select-button"
                        aria-label={`Abrir detalhes de ${item.carrier} em ${item.date} às ${item.time}`}
                        to={`/detalhes-agendamento?id=${encodeURIComponent(item.id)}`}
                      >
                        Abrir detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p role="status">
            {stage || search
              ? "Nenhuma entrega corresponde à busca. Tente outra placa, transportadora ou etapa."
              : "Nenhuma entrega para receber. Os agendamentos aparecem aqui após a aprovação."}
          </p>
        )}
      </section>
    </main>
  );
}
