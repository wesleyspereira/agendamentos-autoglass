import { cargoSummary } from "../utils/cargo";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Filter from "../components/Filter";
import PageHeader from "../components/PageHeader";
import PageToolbar from "../components/PageToolbar";
import StatusBadge from "../components/StatusBadge";
import { useAppointments } from "../context/useAppointments";
import {
  appointmentDateKey,
  localDateKey,
  currentWeekRange,
  sortAppointments,
} from "../utils/appointmentDates";
import "../styles/dashboard-verification.css";

const statuses = {
  pending: "Pendente",
  approved: "Aprovado",
  progress: "Em andamento",
  completed: "Concluído",
  rejected: "Recusado",
};

function AppointmentVerification() {
  const navigate = useNavigate();
  const { appointments, setAppointments, storageError } = useAppointments();
  const [period, setPeriod] = useState("all");
  const [specificDate, setSpecificDate] = useState(localDateKey());
  const [carrier, setCarrier] = useState("");
  const [supplier, setSupplier] = useState("");
  const [status, setStatus] = useState("");
  const [feedback, setFeedback] = useState("");
  // Guarda somente as marcações editadas, até o usuário clicar em Salvar.
  const [draftChecks, setDraftChecks] = useState({});
  const today = localDateKey();
  const week = currentWeekRange();
  const carriers = [...new Set(appointments.map((item) => item.carrier))].sort();
  const suppliers = [...new Set(appointments.flatMap((item) => item.suppliers))].sort();

  const filteredAppointments = sortAppointments(
    appointments.filter((item) => {
      const date = appointmentDateKey(item);
      const matchesDate =
        period === "all" ||
        (period === "today" && date === today) ||
        (period === "week" && date >= week.start && date <= week.end) ||
        (period === "date" && date === specificDate);
      return (
        matchesDate &&
        (!carrier || item.carrier === carrier) &&
        (!supplier || item.suppliers.includes(supplier)) &&
        (!status || item.status === status)
      );
    }),
  );

  // Usa ?? para preservar também a escolha false (checkbox desmarcado).
  function isVerified(appointment) {
    return draftChecks[appointment.id] ?? Boolean(appointment.verified);
  }
  const verifiedCount = filteredAppointments.filter(isVerified).length;
  const changedAppointments = appointments.filter(
    (item) => draftChecks[item.id] !== undefined && draftChecks[item.id] !== Boolean(item.verified),
  );

  function toggleVerification(appointment) {
    setFeedback("");
    setDraftChecks((current) => {
      const next = { ...current };
      const checked = !(current[appointment.id] ?? Boolean(appointment.verified));
      if (checked === Boolean(appointment.verified)) delete next[appointment.id];
      else next[appointment.id] = checked;
      return next;
    });
  }

  function saveVerification() {
    if (changedAppointments.length === 0) return;
    // Prepara os eventos fora do atualizador para manter a atualização pura.
    const changes = new Map(
      changedAppointments.map((item) => {
        const verified = draftChecks[item.id];
        return [
          item.id,
          {
            verified,
            event: {
              id: crypto.randomUUID(),
              title: verified ? "Agendamento conferido" : "Conferência desmarcada",
              at: new Date().toISOString(),
              tone: verified ? "green" : "blue",
            },
          },
        ];
      }),
    );
    setAppointments((currentAppointments) =>
      currentAppointments.map((item) => {
        const change = changes.get(item.id);
        if (!change || Boolean(item.verified) === change.verified) return item;
        // Preserva status e quaisquer alterações feitas pelas outras telas.
        return {
          ...item,
          verified: change.verified,
          history: [...(item.history || []), change.event],
        };
      }),
    );
    setDraftChecks({});
    setFeedback("Conferências atualizadas. Você já pode consultá-las nos detalhes.");
  }

  return (
    <main className="page-content verification-connected">
      <PageHeader
        title="Verificação de Agendamentos"
        subtitle="Consulte as entregas e registre a conferência da equipe de recebimento."
      >
        <button
          className="button button--primary"
          type="button"
          onClick={() => navigate("/novo-agendamento")}
        >
          ＋ Novo agendamento
        </button>
      </PageHeader>
      <PageToolbar
        className="page-toolbar--verification"
        description="Marque os agendamentos conferidos e salve as alterações."
        meta={`${verifiedCount} de ${filteredAppointments.length} exibidos marcados`}
      >
        <Filter label="Período" value={period} onChange={(event) => setPeriod(event.target.value)}>
          <option value="all">Todos</option>
          <option value="today">Hoje</option>
          <option value="week">Esta semana</option>
          <option value="date">Data específica</option>
        </Filter>
        <Filter
          label="Transportadora"
          value={carrier}
          onChange={(event) => setCarrier(event.target.value)}
        >
          <option value="">Todas</option>
          {carriers.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Filter>
        <Filter
          label="Fornecedor"
          value={supplier}
          onChange={(event) => setSupplier(event.target.value)}
        >
          <option value="">Todos</option>
          {suppliers.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Filter>
        <Filter label="Status" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Todos</option>
          {Object.entries(statuses).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Filter>
      </PageToolbar>
      {period === "date" && (
        <label className="verification-specific-date">
          Data da entrega
          <input
            type="date"
            value={specificDate}
            onChange={(event) => setSpecificDate(event.target.value)}
          />
        </label>
      )}
      {changedAppointments.length > 0 && (
        <p className="verification-draft-note" role="status">
          {changedAppointments.length} alteração(ões) não salva(s). O botão salva também as
          marcações feitas antes de mudar os filtros. Salve antes de sair da página.
        </p>
      )}

      <section className="panel verification-panel">
        <div className="verification-table-wrapper">
          <table className="verification-table verification-table--transport">
            <colgroup>
              <col className="verification-col--date" />
              <col className="verification-col--time" />
              <col className="verification-col--carrier" />
              <col className="verification-col--suppliers" />
              <col className="verification-col--document" />
              <col className="verification-col--invoices" />
              <col className="verification-col--volumes" />
              <col className="verification-col--status" />
              <col className="verification-col--checked" />
            </colgroup>
            <thead>
              <tr>
                <th>Data</th>
                <th>Horário</th>
                <th>Transportadora</th>
                <th>Fornecedores</th>
                <th>CT-e / MDF-e</th>
                <th>NF-e</th>
                <th>Volumes</th>
                <th>Status</th>
                <th>Verificado</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr className={isVerified(appointment) ? "is-verified" : ""} key={appointment.id}>
                  <td>{appointment.date}</td>
                  <td>
                    <strong>{appointment.time}</strong>
                  </td>
                  <td>
                    <Link
                      className="verification-detail-link"
                      to={`/detalhes-agendamento?id=${encodeURIComponent(appointment.id)}`}
                      title="Abrir detalhes"
                    >
                      <strong>{appointment.carrier}</strong>
                    </Link>
                  </td>
                  <td title={appointment.suppliers.join(", ")}>
                    {appointment.suppliers.join(", ")}
                  </td>
                  <td>
                    {appointment.documentType} {appointment.documentNumber}
                  </td>
                  <td>{appointment.invoices.length} registradas</td>
                  <td>{cargoSummary(appointment)}</td>
                  <td>
                    <StatusBadge status={appointment.status} />
                  </td>
                  <td>
                    <input
                      className="verification-checkbox"
                      type="checkbox"
                      checked={isVerified(appointment)}
                      onChange={() => toggleVerification(appointment)}
                      aria-label={`Verificar agendamento da ${appointment.carrier} em ${appointment.date} às ${appointment.time}`}
                    />
                  </td>
                </tr>
              ))}
              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan={9} className="verification-empty">
                    Nenhum agendamento encontrado com esses filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <footer className="verification-footer">
          <span>
            {filteredAppointments.length} de {appointments.length} agendamentos
          </span>
          <strong>{verifiedCount} marcados na lista</strong>
          <button
            className="button button--primary"
            type="button"
            disabled={changedAppointments.length === 0}
            onClick={saveVerification}
          >
            Salvar verificações
          </button>
        </footer>
      </section>
      <div className="verification-notice">
        <span aria-hidden="true">ⓘ</span>
        <p aria-live="polite">
          {storageError ||
            feedback ||
            "As conferências são registradas ao clicar em Salvar verificações."}
        </p>
      </div>
    </main>
  );
}

export default AppointmentVerification;
