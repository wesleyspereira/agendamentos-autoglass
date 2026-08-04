import { Link } from "react-router-dom"
import PageHeader from "../components/PageHeader"
import ScheduleRow from "../components/ScheduleRow"
import StatCard from "../components/StatCard"
import { dashboardStats, todayAppointments, upcomingAppointments } from "../data/appointments"

function Dashboard() {
    return (
        <main className="page-content">
            <PageHeader title="Visão Geral">
                <button type="button" className="button button--primary">+ Novo agendamento</button>
            </PageHeader>

            <section className="stats-grid" aria-label="Indicadores do recebimento">
                {dashboardStats.map((stat) => <StatCard key={stat.title} {...stat} />)}
            </section>

            <section className="dashboard-grid">
                <article className="panel">
                    <header className="panel__header">
                        <div>
                            <h2>Agenda de hoje</h2>
                            <p>20 de julho de 2026</p>
                        </div>
                    </header>
                    <div className="schedule-list">
                        {todayAppointments.map((appointment) => (
                            <ScheduleRow key={`${appointment.time}-${appointment.supplier}`} appointment={appointment} />
                        ))}
                    </div>
                    <Link className="panel__link" to="/agenda-semanal">Ver agenda completa</Link>
                </article>

                <article className="panel">
                    <header className="panel__header">
                        <div>
                            <h2>Próximas entregas</h2>
                            <p>Programação confirmada</p>
                        </div>
                    </header>
                    <div className="schedule-list">
                        {upcomingAppointments.map((appointment) => (
                            <ScheduleRow key={`${appointment.date}-${appointment.time}`} appointment={appointment} upcoming />
                        ))}
                    </div>
                    <Link className="panel__link" to="/calendario">Ver todos os agendamentos</Link>
                </article>
            </section>
        </main>
    )
}

export default Dashboard
