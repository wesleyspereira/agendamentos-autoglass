// Importa o Link do React Router.
// Ele permite navegar entre páginas sem recarregar o site.
import { Link } from "react-router-dom"

// Importa os componentes reutilizáveis usados no Dashboard.
import PageHeader from "../components/PageHeader"
import ScheduleRow from "../components/ScheduleRow"
import StatCard from "../components/StatCard"

// Importa os dados simulados exibidos nesta página.
import {
    dashboardStats,
    todayAppointments,
    upcomingAppointments
} from "../data/appointments"


// Componente responsável por montar a tela de Visão Geral.
function Dashboard() {
    // Retorna toda a estrutura JSX que será exibida na página.
    return (
        <main className="page-content">

            {/* Cabeçalho da página com o título e o botão de novo agendamento. */}
            <PageHeader title="Visão Geral">
                <button
                    type="button"
                    className="button button--primary"
                >
                    + Novo agendamento
                </button>
            </PageHeader>


            {/* Seção responsável pelos cards de indicadores.
                aria-label ajuda leitores de tela a entenderem a seção. */}
            <section
                className="stats-grid"
                aria-label="Indicadores do recebimento"
            >
                {/* Percorre o array dashboardStats.
                    Para cada indicador, cria um componente StatCard. */}
                {dashboardStats.map((stat) => (
                    <StatCard
                        // A key ajuda o React a identificar cada card.
                        key={stat.title}

                        // O spread envia todas as propriedades do objeto stat
                        // como props para o componente StatCard.
                        {...stat}
                    />
                ))}
            </section>


            {/* Grade que divide o Dashboard em dois painéis. */}
            <section className="dashboard-grid">

                {/* Primeiro painel: agendamentos do dia atual. */}
                <article className="panel">

                    {/* Cabeçalho do painel. */}
                    <header className="panel__header">
                        <div>
                            <h2>Agenda de hoje</h2>
                            <p>20 de julho de 2026</p>
                        </div>
                    </header>


                    {/* Lista dos agendamentos de hoje. */}
                    <div className="schedule-list">

                        {/* Percorre o array todayAppointments.
                            Para cada agendamento, cria um ScheduleRow. */}
                        {todayAppointments.map((appointment) => (
                            <ScheduleRow
                                // Cria uma identificação usando
                                // horário e fornecedor.
                                key={
                                    `${appointment.time}-${appointment.supplier}`
                                }

                                // Envia o objeto completo do agendamento
                                // para o componente ScheduleRow.
                                appointment={appointment}
                            />
                        ))}
                    </div>


                    {/* Link que leva o usuário para a Agenda Semanal. */}
                    <Link
                        className="panel__link"
                        to="/agenda-semanal"
                    >
                        Ver agenda completa
                    </Link>
                </article>


                {/* Segundo painel: próximas entregas confirmadas. */}
                <article className="panel">

                    {/* Cabeçalho do painel de próximas entregas. */}
                    <header className="panel__header">
                        <div>
                            <h2>Próximas entregas</h2>
                            <p>Programação confirmada</p>
                        </div>
                    </header>


                    {/* Lista das próximas entregas. */}
                    <div className="schedule-list">

                        {/* Percorre o array upcomingAppointments.
                            Para cada entrega, cria um ScheduleRow. */}
                        {upcomingAppointments.map((appointment) => (
                            <ScheduleRow
                                // Cria uma identificação usando
                                // a data e o horário.
                                key={
                                    `${appointment.date}-${appointment.time}`
                                }

                                // Envia os dados do agendamento.
                                appointment={appointment}

                                // Envia upcoming com o valor true.
                                // O ScheduleRow pode usar essa informação
                                // para mostrar que é uma entrega futura.
                                upcoming
                            />
                        ))}
                    </div>


                    {/* Link que leva para a página do calendário. */}
                    <Link
                        className="panel__link"
                        to="/calendario"
                    >
                        Ver todos os agendamentos
                    </Link>
                </article>
            </section>

        </main>
    )
}


// Exporta o componente para ser utilizado nas rotas do App.jsx.
export default Dashboard