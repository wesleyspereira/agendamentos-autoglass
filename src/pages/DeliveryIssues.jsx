import { useState } from "react";
import { Link } from "react-router-dom";

import Filter from "../components/Filter";
import PageHeader from "../components/PageHeader";
import PageToolbar from "../components/PageToolbar";
import { useAppointments } from "../context/useAppointments";

import { OPENED, RESOLVED, deliveryIssues } from "../utils/deliveryIssues";

function documentLabel(appointment) {
  return (
    [appointment.documentType, appointment.documentNumber].filter(Boolean).join(" ") ||
    appointment.document ||
    "Documento não informado"
  );
}

function ResolutionForm({ onSave, onCancel }) {
  const [solution, setSolution] = useState("");

  function submit(event) {
    event.preventDefault();
    if (solution.trim()) onSave(solution.trim());
  }

  return (
    <form onSubmit={submit}>
      <label className="transport-field">
        <span>Como a ocorrência foi resolvida?</span>
        <textarea
          value={solution}
          rows={3}
          required
          onChange={(event) => setSolution(event.target.value)}
        />
      </label>
      <button className="button button--primary" disabled={!solution.trim()}>
        Salvar solução
      </button>{" "}
      <button type="button" className="button button--outline" onClick={onCancel}>
        Cancelar
      </button>
    </form>
  );
}

function InternalOccurrences() {
  const { appointments, setAppointments } = useAppointments();
  const [filter, setFilter] = useState("open");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");

  const rows = appointments
    .flatMap((appointment) => {
      return deliveryIssues(appointment.history).map(({ entry, solution }) => ({
        key: JSON.stringify([appointment.id, entry.id]),
        appointment,
        entry,
        solution,
      }));
    })
    .sort((a, b) => Date.parse(b.entry.at) - Date.parse(a.entry.at));

  const query = search.trim().toLocaleLowerCase("pt-BR");
  const visible = rows.filter(({ appointment, solution }) => {
    const fields = [appointment.carrier, appointment.plate, documentLabel(appointment)];
    return (
      (filter === "all" || filter === (solution ? "closed" : "open")) &&
      fields.some((value) =>
        String(value || "")
          .toLocaleLowerCase("pt-BR")
          .includes(query),
      )
    );
  });

  function resolve({ appointment, entry }, details) {
    const result = {
      id: crypto.randomUUID(),
      occurrenceId: entry.id,
      title: RESOLVED,
      at: new Date().toISOString(),
      details,
      tone: "green",
    };

    setAppointments((current) =>
      current.map((item) => {
        if (item.id !== appointment.id) return item;
        const history = item.history || [];
        if (
          !history.some((event) => event.title === OPENED && event.id === entry.id) ||
          history.some((event) => event.title === RESOLVED && event.occurrenceId === entry.id)
        ) {
          return item;
        }
        return { ...item, history: [...history, result] };
      }),
    );
    setEditing(null);
    setMessage("Solução registrada no histórico da entrega.");
  }

  return (
    <main className="page-content">
      <PageHeader
        title="Ocorrências"
        subtitle="Acompanhe as ocorrências registradas pela equipe de recebimento da Autoglass."
      >
        <Link className="button button--outline" to="/recebimentos">
          Abrir recebimentos
        </Link>
      </PageHeader>

      <PageToolbar meta={visible.length + (visible.length === 1 ? " ocorrência" : " ocorrências")}>
        <Filter label="Situação" value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="open">Abertas</option>
          <option value="closed">Resolvidas</option>
          <option value="all">Todas</option>
        </Filter>
        <label className="transport-field">
          <span>Buscar por transportadora, documento ou placa</span>
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
      </PageToolbar>

      {message && <p role="status">{message}</p>}
      <section className="panel approval-list" aria-label="Ocorrências das entregas">
        {visible.length === 0 ? (
          <p>
            {rows.length
              ? "Nenhuma ocorrência para os filtros selecionados."
              : "Nenhuma ocorrência registrada. Em Recebimentos, abra a entrega e clique em Registrar ocorrência."}
          </p>
        ) : (
          <div className="table-container">
            <table className="approval-table">
              <thead>
                <tr>
                  <th>Entrega</th>
                  <th>Registro</th>
                  <th>Ocorrência</th>
                  <th>Situação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => {
                  const { key, appointment, entry, solution } = row;
                  return (
                    <tr key={key}>
                      <td>
                        <strong>{appointment.carrier}</strong>
                        <span className="table-secondary-text">{documentLabel(appointment)}</span>
                      </td>
                      <td>
                        <time dateTime={entry.at}>
                          {new Date(entry.at).toLocaleString("pt-BR")}
                        </time>
                      </td>
                      <td>
                        <p>{entry.details}</p>
                        {solution && (
                          <p>
                            <strong>Solução:</strong> {solution.details}
                          </p>
                        )}
                      </td>
                      <td>{solution ? "Resolvida" : "Aberta"}</td>
                      <td>
                        <Link to={"/detalhes-agendamento?id=" + encodeURIComponent(appointment.id)}>
                          Ver entrega
                        </Link>
                        {!solution &&
                          (editing === key ? (
                            <ResolutionForm
                              onSave={(details) => resolve(row, details)}
                              onCancel={() => setEditing(null)}
                            />
                          ) : (
                            <button
                              type="button"
                              className="approval-select-button"
                              onClick={() => setEditing(key)}
                            >
                              Resolver
                            </button>
                          ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default function DeliveryIssues({ internal = false }) {
  return internal ? <InternalOccurrences /> : <p>Área da equipe de recebimento da Autoglass.</p>;
}
