import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Filter from "../components/Filter";
import PageHeader from "../components/PageHeader";
import PageToolbar from "../components/PageToolbar";
import StatusBadge from "../components/StatusBadge";

import {
  calendarDays,
  transportAppointments,
} from "../data/transportAppointments";
import { transporters } from "../data/transporters";

const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function CalendarPage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(1);
  const [calendarView, setCalendarView] = useState("month");

  const selectedAppointment = transportAppointments.find(
    (appointment) => appointment.id === selectedId,
  );

  return (
    <main className="page-content">
      <PageHeader
        title="Calendário de Agendamentos"
        subtitle="Consulte as entregas programadas por data, transportadora e fornecedor."
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

      <PageToolbar
        meta={`${transportAppointments.length} agendamentos no período`}
      >
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
          <option>Vidros Sul</option>
          <option>Cristal Glass</option>
        </Filter>

        <Filter label="Status" defaultValue="todos">
          <option value="todos">Todos</option>
          <option>Aprovado</option>
          <option>Pendente</option>
        </Filter>
      </PageToolbar>

      <section className="transport-calendar-panel">
        <div className="transport-calendar-main">
          <div className="transport-calendar-toolbar">
            <div>
              <button className="button button--outline" type="button">
                Hoje
              </button>
              <button className="button button--icon" type="button">
                ‹
              </button>
              <button className="button button--icon" type="button">
                ›
              </button>
              <h2>Julho 2026</h2>
            </div>

            <div className="segmented-control">
              <button
                className={calendarView === "month" ? "is-active" : ""}
                type="button"
                onClick={() => setCalendarView("month")}
              >
                Mês
              </button>
              <button
                className={calendarView === "week" ? "is-active" : ""}
                type="button"
                onClick={() => setCalendarView("week")}
              >
                Semana
              </button>
              <button
                className={calendarView === "day" ? "is-active" : ""}
                type="button"
                onClick={() => setCalendarView("day")}
              >
                Dia
              </button>
            </div>
          </div>

          <div className="transport-calendar-grid">
            {weekDays.map((day) => (
              <strong className="transport-calendar-weekday" key={day}>
                {day}
              </strong>
            ))}

            {calendarDays.map((cell, index) => {
              const appointment = transportAppointments.find(
                (item) => item.id === cell.appointmentId,
              );

              return (
                <div
                  className={`transport-calendar-day${cell.otherMonth ? " is-other-month" : ""}${cell.today ? " is-today" : ""}`}
                  key={`${cell.day}-${index}`}
                >
                  <span>{cell.day}</span>

                  {appointment && (
                    <button
                      className={`transport-calendar-event transport-calendar-event--${appointment.status}`}
                      type="button"
                      onClick={() => setSelectedId(appointment.id)}
                    >
                      {appointment.time} · {appointment.carrier}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {selectedAppointment && (
          <aside className="transport-calendar-details">
            <h2>Detalhes</h2>
            <StatusBadge status={selectedAppointment.status} />
            <strong className="transport-calendar-details__time">
              {selectedAppointment.time}
            </strong>
            <b>{selectedAppointment.carrier}</b>

            <dl>
              <div>
                <dt>Data</dt>
                <dd>{selectedAppointment.date}</dd>
              </div>
              <div>
                <dt>CT-e / MDF-e</dt>
                <dd>
                  {selectedAppointment.documentType}{" "}
                  {selectedAppointment.documentNumber}
                </dd>
              </div>
              <div>
                <dt>Fornecedores</dt>
                <dd>{selectedAppointment.suppliers.join(", ")}</dd>
              </div>
              <div>
                <dt>Notas fiscais</dt>
                <dd>{selectedAppointment.invoices.length} anexas</dd>
              </div>
              <div>
                <dt>Volumes</dt>
                <dd>
                  {selectedAppointment.volumes} ·{" "}
                  {selectedAppointment.volumeTypes.join(" + ")}
                </dd>
              </div>
            </dl>

            <button
              className="button button--primary button--full"
              type="button"
              onClick={() => navigate("/detalhes-agendamento")}
            >
              Ver detalhes completos
            </button>
          </aside>
        )}
      </section>
    </main>
  );
}

export default CalendarPage;
