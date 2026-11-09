import { deliveryIssues } from "../utils/deliveryIssues";
import { useState } from "react";
import { Link } from "react-router-dom";

import Filter from "../components/Filter";
import PageHeader from "../components/PageHeader";
import PageToolbar from "../components/PageToolbar";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { useAppointments } from "../context/useAppointments";
import { appointmentDateKey, sortAppointments } from "../utils/appointmentDates";

const INITIAL = { start: "", end: "", carrier: "", status: "", occurrences: "" };
const STATUS = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Recusado",
  progress: "Em andamento",
  completed: "Concluído",
};
const COLUMNS = [
  "Data agendada",
  "Horário",
  "Transportadora",
  "CT-e / MDF-e",
  "Situação",
  "Ocorrências abertas",
  "Ocorrências resolvidas",
  "Remessa",
];

function reportRows(appointments, filters) {
  const { start, end, carrier, status, occurrences } = filters;
  const selected = appointments.filter((item) => {
    const date = appointmentDateKey(item);
    return (
      (!start || date >= start) &&
      (!end || date <= end) &&
      (!carrier || item.carrier === carrier) &&
      (!status || item.status === status)
    );
  });

  return sortAppointments(selected)
    .map((item) => {
      const issues = deliveryIssues(item.history);
      const closed = issues.filter(({ solution }) => solution).length;
      return {
        id: item.id,
        date: appointmentDateKey(item).split("-").reverse().join("/"),
        time: item.time || "",
        carrier: item.carrier || "",
        document:
          [item.documentType, item.documentNumber].filter(Boolean).join(" ") || item.document || "",
        status: item.status,
        open: issues.length - closed,
        closed,
        shipment: item.shipment?.number || "",
      };
    })
    .filter(
      (row) => !occurrences || (occurrences === "open" ? row.open > 0 : row.open + row.closed > 0),
    );
}

// Neutraliza fórmulas e preserva aspas e separadores ao abrir o CSV no Excel.
function csvCell(value) {
  const text = String(value ?? "");
  const safe = /^\s*[=+@-]|^[\t\r\n]/.test(text) ? "'" + text : text;
  return '"' + safe.replaceAll('"', '""') + '"';
}

function reportCsv(rows) {
  const records = rows.map((row) => [
    row.date,
    row.time,
    row.carrier,
    row.document,
    STATUS[row.status] || row.status,
    row.open,
    row.closed,
    row.shipment,
  ]);
  return "\uFEFF" + [COLUMNS, ...records].map((line) => line.map(csvCell).join(";")).join("\r\n");
}

function downloadCsv(rows, filters) {
  const blob = new Blob([reportCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download =
    ["relatorio-recebimentos", filters.start, filters.end].filter(Boolean).join("_") + ".csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Reports() {
  const { appointments } = useAppointments();
  const [filters, setFilters] = useState(INITIAL);
  const carriers = [...new Set(appointments.map((item) => item.carrier).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "pt-BR"),
  );
  const invalid = Boolean(filters.start && filters.end && filters.end < filters.start);
  const rows = invalid ? [] : reportRows(appointments, filters);
  const active = Object.values(filters).some(Boolean);

  function field(name) {
    return {
      value: filters[name],
      onChange: (event) => {
        const value = event.target.value;
        setFilters((previous) => ({ ...previous, [name]: value }));
      },
    };
  }

  return (
    <main className="page-content">
      <PageHeader
        title="Relatórios"
        subtitle="Consulte as entregas pelo período agendado e acompanhe a situação atual de cada uma."
      >
        <button
          type="button"
          className="button button--primary"
          disabled={!rows.length}
          onClick={() => downloadCsv(rows, filters)}
        >
          Exportar CSV
        </button>
      </PageHeader>

      <PageToolbar description="Sem datas preenchidas, o relatório considera todo o histórico de agendamentos.">
        <label className="transport-field">
          <span>Data inicial</span>
          <input type="date" max={filters.end || undefined} {...field("start")} />
        </label>
        <label className="transport-field">
          <span>Data final</span>
          <input type="date" min={filters.start || undefined} {...field("end")} />
        </label>
        <Filter label="Transportadora" {...field("carrier")}>
          <option value="">Todas</option>
          {carriers.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Filter>
        <Filter label="Situação da entrega" {...field("status")}>
          <option value="">Todas</option>
          {Object.entries(STATUS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Filter>
        <Filter label="Ocorrências" {...field("occurrences")}>
          <option value="">Todas as entregas</option>
          <option value="any">Com ocorrência registrada</option>
          <option value="open">Com ocorrência aberta</option>
        </Filter>
        <button
          type="button"
          className="button button--outline"
          disabled={!active}
          onClick={() => setFilters(INITIAL)}
        >
          Limpar filtros
        </button>
      </PageToolbar>

      {invalid ? (
        <p className="panel" role="alert">
          A data final deve ser igual ou posterior à data inicial.
        </p>
      ) : (
        <>
          <section className="stats-grid" aria-label="Resumo das entregas filtradas">
            <StatCard
              title="Agendamentos"
              value={rows.length}
              tone="blue"
              comparison="Entregas selecionadas"
            />
            <StatCard
              title="Em recebimento"
              value={rows.filter((row) => row.status === "progress").length}
              tone="blue"
              comparison="Recebimento iniciado"
            />
            <StatCard
              title="Recebimentos concluídos"
              value={rows.filter((row) => row.status === "completed").length}
              tone="green"
              comparison="Conferência finalizada"
            />
            <StatCard
              title="Ocorrências abertas"
              value={rows.reduce((sum, row) => sum + row.open, 0)}
              tone="orange"
              comparison="Registros sem solução"
            />
          </section>
          <section className="panel approval-list" aria-label="Entregas do relatório">
            <div className="approval-list__header">
              <h2>Entregas do período</h2>
              <span aria-live="polite">
                {rows.length} {rows.length === 1 ? "entrega" : "entregas"}
              </span>
            </div>
            {rows.length ? (
              <div className="table-container">
                <table className="approval-table">
                  <thead>
                    <tr>
                      {COLUMNS.map((label) => (
                        <th scope="col" key={label}>
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.date}</td>
                        <td>{row.time || "—"}</td>
                        <td>{row.carrier || "Não informada"}</td>
                        <td>
                          <Link to={"/detalhes-agendamento?id=" + encodeURIComponent(row.id)}>
                            {row.document || "Ver entrega"}
                          </Link>
                        </td>
                        <td>
                          <StatusBadge
                            status={row.status}
                            label={STATUS[row.status] || "Não informada"}
                          />
                        </td>
                        <td>{row.open}</td>
                        <td>{row.closed}</td>
                        <td>{row.shipment || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p role="status">
                {active
                  ? "Nenhuma entrega corresponde aos filtros selecionados."
                  : "Nenhum agendamento registrado."}
              </p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
