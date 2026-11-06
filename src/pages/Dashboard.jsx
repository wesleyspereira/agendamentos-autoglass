import { Link, useNavigate } from "react-router-dom"
import PageHeader from "../components/PageHeader"
import StatusBadge from "../components/StatusBadge"
import { useAppointments } from "../context/AppointmentsContext"
import { appointmentDateKey, localDateKey, sortAppointments } from "../utils/appointmentDates"
import "../styles/dashboard-verification.css"

function Dashboard() {
    const navigate = useNavigate()
    const { appointments } = useAppointments()
    const today = localDateKey()

    // Usa a data real e os registros compartilhados, sem valores demonstrativos fixos.
    const todayAppointments = sortAppointments(
        appointments.filter((item) => appointmentDateKey(item) === today)
    )
    const futureAppointments = sortAppointments(appointments.filter((item) =>
        appointmentDateKey(item) > today &&
        item.status !== "rejected" && item.status !== "completed"
    ))
    const upcomingAppointments = futureAppointments.slice(0, 7)

    const dashboardStats = [
        { id: "today", label: "Agendamentos hoje", value: todayAppointments.length, tone: "blue", scope: "Entregas com data de hoje" },
        { id: "pending", label: "Aguardando aprovação", value: appointments.filter((item) => item.status === "pending").length, tone: "orange", scope: "Todos os agendamentos" },
        { id: "progress", label: "Em andamento", value: appointments.filter((item) => item.status === "progress").length, tone: "blue", scope: "Todos os agendamentos" },
        { id: "completed", label: "Concluídos", value: appointments.filter((item) => item.status === "completed").length, tone: "green", scope: "Todos os agendamentos" }
    ]

    return (
        <main className="page-content dashboard-connected">
            <PageHeader title="Visão Geral" subtitle="Acompanhe os agendamentos e as próximas entregas em um só lugar.">
                <button className="button button--primary" type="button" onClick={() => navigate("/novo-agendamento")}>＋ Novo agendamento</button>
            </PageHeader>
            <section className="transport-stats-grid">
                {dashboardStats.map((stat) => (
                    <article className="transport-stat-card" key={stat.id}>
                        <span>{stat.label}</span>
                        <strong className={`transport-stat-card--${stat.tone}`}>{stat.value}</strong>
                        <small>{stat.scope}</small>
                    </article>
                ))}
            </section>
            <section className="transport-dashboard-grid">
                <article className="panel transport-list-card">
                    <header className="transport-card-header">
                        <h2>Agenda de hoje</h2>
                        <span>{new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </header>
                    <div className="transport-appointment-list">
                        {todayAppointments.map((appointment) => (
                            <Link className="transport-appointment-row dashboard-appointment-link" key={appointment.id} to={`/detalhes-agendamento?id=${encodeURIComponent(appointment.id)}`} aria-label={`Ver entrega de ${appointment.carrier} às ${appointment.time}`}>
                                <div className="transport-appointment-row__time"><i className={`status-dot status-dot--${appointment.status}`} aria-hidden="true" /><strong>{appointment.time}</strong></div>
                                <div><b>{appointment.carrier}</b><span>{appointment.documentType} {appointment.documentNumber}</span></div>
                                <span className="dashboard-suppliers" title={appointment.suppliers.join(", ")}>{appointment.suppliers.join(", ")}</span>
                                <StatusBadge status={appointment.status} />
                            </Link>
                        ))}
                        {todayAppointments.length === 0 && <p className="dashboard-empty">Nenhuma entrega agendada para hoje.</p>}
                    </div>
                    <footer className="dashboard-list-footer"><Link to="/calendario">Abrir calendário →</Link></footer>
                </article>
                <article className="panel transport-list-card transport-list-card--upcoming">
                    <header className="transport-card-header"><h2>Próximas entregas</h2><span>A partir de amanhã</span></header>
                    <div className="transport-appointment-list">
                        {upcomingAppointments.map((appointment) => (
                            <Link className="transport-appointment-row transport-appointment-row--upcoming dashboard-appointment-link" key={appointment.id} to={`/detalhes-agendamento?id=${encodeURIComponent(appointment.id)}`} aria-label={`Ver entrega de ${appointment.carrier} em ${appointment.date}`}>
                                <div className="transport-appointment-row__time"><i className={`status-dot status-dot--${appointment.status}`} aria-hidden="true" /><strong>{appointment.date.slice(0, 5)}</strong></div>
                                <div><b>{appointment.carrier}</b><span>{appointment.time} · {appointment.documentType} {appointment.documentNumber}</span><small className="transport-appointment-row__meta">{appointment.volumeTypes.join(" + ")}</small></div>
                                <StatusBadge status={appointment.status} />
                            </Link>
                        ))}
                        {upcomingAppointments.length === 0 && <p className="dashboard-empty">Nenhuma entrega futura pendente, aprovada ou em andamento.</p>}
                    </div>
                    <footer className="dashboard-list-footer"><span>{upcomingAppointments.length} de {futureAppointments.length} entregas futuras</span><Link to="/verificacao-agendamentos">Ver agendamentos →</Link></footer>
                </article>
            </section>
        </main>
    )
}

export default Dashboard
