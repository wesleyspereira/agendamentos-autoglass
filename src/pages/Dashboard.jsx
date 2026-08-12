import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useNavigate } from "react-router-dom";
import {
  dashboardStats,
  transportAppointments,
} from "../data/transportAppointments";

// Dados demonstrativos da agenda diária, organizados como no layout do Figma.
const dashboardTodayAppointments = [
  { ...transportAppointments[0], time: "08:00", status: "approved" },
  { ...transportAppointments[2], time: "09:30", status: "approved" },
  { ...transportAppointments[1], time: "11:00", status: "progress" },
  { ...transportAppointments[3], time: "13:30", status: "pending" },
  { ...transportAppointments[4], time: "15:00", status: "approved" },
];

function Dashboard() {
  const navigate = useNavigate();

  const upcomingAppointments = transportAppointments.slice(2, 7);

  return (
    <main className="page-content">
      <PageHeader
        title="Visão Geral"
        subtitle="Acompanhe os agendamentos e as próximas entregas em um só lugar."
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

      {/* Indicadores rápidos da operação */}
      <section className="transport-stats-grid">
        {dashboardStats.map((stat) => (
          <article className="transport-stat-card" key={stat.id}>
            <span>{stat.label}</span>
            <strong className={`transport-stat-card--${stat.tone}`}>
              {stat.value}
            </strong>
            <small>Atualizado agora</small>
          </article>
        ))}
      </section>

      {/* Listas de entregas atuais e futuras */}
      <section className="transport-dashboard-grid">
        <article className="panel transport-list-card">
          <header className="transport-card-header">
            <h2>Agenda de hoje</h2>
            <span>20 de julho de 2026</span>
          </header>

          <div className="transport-appointment-list">
            {dashboardTodayAppointments.map((appointment) => (
              <div className="transport-appointment-row" key={appointment.id}>
                <div className="transport-appointment-row__time">
                  <i
                    className={`status-dot status-dot--${appointment.status}`}
                    aria-hidden="true"
                  />
                  <strong>{appointment.time}</strong>
                </div>
                <div>
                  <b>{appointment.carrier}</b>
                  <span>
                    {appointment.documentType} {appointment.documentNumber}
                  </span>
                </div>
                <span>{appointment.suppliers.join(", ")}</span>
                <StatusBadge status={appointment.status} />
              </div>
            ))}
          </div>
        </article>

        <article className="panel transport-list-card transport-list-card--upcoming">
          <header className="transport-card-header">
            <h2>Próximas entregas</h2>
          </header>

          <div className="transport-appointment-list">
            {upcomingAppointments.map((appointment) => (
              <div
                className="transport-appointment-row transport-appointment-row--upcoming"
                key={appointment.id}
              >
                <div className="transport-appointment-row__time">
                  <i
                    className={`status-dot status-dot--${appointment.status}`}
                    aria-hidden="true"
                  />
                  <strong>{appointment.date.slice(0, 5)}</strong>
                </div>
                <div>
                  <b>{appointment.carrier}</b>
                  <span>
                    {appointment.documentType} {appointment.documentNumber}
                  </span>
                  <small className="transport-appointment-row__meta">
                    {appointment.volumeTypes.join(" + ")}
                  </small>
                </div>
                <StatusBadge status={appointment.status} />
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

export default Dashboard;
