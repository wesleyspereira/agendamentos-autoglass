import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Filter from "../components/Filter";
import PageHeader from "../components/PageHeader";
import PageToolbar from "../components/PageToolbar";
import StatusBadge from "../components/StatusBadge";

import { transportAppointments } from "../data/transportAppointments";
import { transporters } from "../data/transporters";

function AppointmentVerification() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState(transportAppointments);
  const [feedback, setFeedback] = useState("");

  function toggleVerification(appointmentId) {
    setAppointments((currentAppointments) =>
      currentAppointments.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, verified: !appointment.verified }
          : appointment,
      ),
    );
  }

  const verifiedCount = appointments.filter(
    (appointment) => appointment.verified,
  ).length;

  return (
    <main className="page-content">
      <PageHeader
        title="Verificação de Agendamentos"
        subtitle="20 – 24 de julho de 2026"
      >
        <button
          className="button button--primary"
          type="button"
          onClick={() => navigate("/novo-agendamento")}
        >
          <span aria-hidden="true">＋</span>
          Novo agendamento
        </button>
      </PageHeader>

      {/* Filtros mantidos em uma única linha nas telas maiores */}
      <PageToolbar
        className="page-toolbar--verification"
        description="Marque os agendamentos conferidos pela equipe de recebimento."
        meta={`${verifiedCount} de ${appointments.length} verificados`}
      >
        <Filter label="Data" defaultValue="semana">
          <option value="semana">Semana</option>
          <option>Hoje</option>
        </Filter>
        <Filter label="Transportadora" defaultValue="todas">
          <option value="todas">Todas</option>
          {transporters.map((transporter) => (
            <option value={transporter.id} key={transporter.id}>
              {transporter.name}
            </option>
          ))}
        </Filter>
        <Filter label="Fornecedor" defaultValue="todos">
          <option value="todos">Todos</option>
          <option>Cristal Glass</option>
        </Filter>
        <Filter label="Status" defaultValue="todos">
          <option value="todos">Todos</option>
          <option>Aprovado</option>
          <option>Pendente</option>
        </Filter>
      </PageToolbar>

      {/* Tabela de conferência com checkbox sempre acessível */}
      <section className="panel verification-panel">
        <div className="verification-table-wrapper">
          <table className="verification-table verification-table--transport">
            {/* Larguras fixas mantêm o checkbox visível sem rolagem horizontal no desktop. */}
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
              {appointments.map((appointment) => (
                <tr
                  className={appointment.verified ? "is-verified" : ""}
                  key={appointment.id}
                >
                  <td>{appointment.date}</td>
                  <td>
                    <strong>{appointment.time}</strong>
                  </td>
                  <td>
                    <strong>{appointment.carrier}</strong>
                  </td>
                  <td title={appointment.suppliers.join(", ")}>
                    {appointment.suppliers.join(", ")}
                  </td>
                  <td
                    title={`${appointment.volumes} · ${appointment.volumeTypes.join(" + ")}`}
                  >
                    {appointment.documentType} {appointment.documentNumber}
                  </td>
                  <td>{appointment.invoices.length} anexas</td>
                  <td>
                    {appointment.volumes} ·{" "}
                    {appointment.volumeTypes.join(" + ")}
                  </td>
                  <td>
                    <StatusBadge status={appointment.status} />
                  </td>
                  <td>
                    <input
                      className="verification-checkbox"
                      type="checkbox"
                      checked={appointment.verified}
                      onChange={() => toggleVerification(appointment.id)}
                      aria-label={`Verificar agendamento da ${appointment.carrier}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="verification-footer">
          <span>
            1–{appointments.length} de {appointments.length} agendamentos
          </span>
          <strong>{verifiedCount} verificados</strong>
          <button
            className="button button--primary"
            type="button"
            onClick={() => setFeedback("Verificações salvas com sucesso.")}
          >
            Salvar verificações
          </button>
        </footer>
      </section>

      <div className="verification-notice">
        <span>ⓘ</span>
        <p aria-live="polite">
          {feedback ||
            "Ao marcar o checkbox, o agendamento fica registrado como verificado pela equipe de recebimento."}
        </p>
      </div>
    </main>
  );
}

export default AppointmentVerification;
