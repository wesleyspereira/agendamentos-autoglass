// Importa o componente reutilizável de cabeçalho.
import PageHeader from "../components/PageHeader"

// Importa o componente que mostra o status do agendamento.
import StatusBadge from "../components/StatusBadge"

// Importa os dados das semanas que serão mostradas no calendário.
import { calendarWeeks } from "../data/appointments"

// Importa o Link para navegar entre páginas sem recarregar o site.
import { Link } from "react-router-dom"


// Lista das legendas dos status.
// Cada item possui o nome usado no CSS e o texto mostrado na tela.
const legends = [
    ["pending", "Pendente"],
    ["approved", "Aprovado"],
    ["progress", "Em andamento"],
    ["completed", "Concluído"],
    ["rejected", "Recusado"],
]


// Componente reutilizável responsável por criar um campo de filtro.
// Recebe label e children através das props.
function Filter({ label, children }) {
    return (
        <label className="filter-field">

            {/* Exibe o nome do filtro. */}
            <span>{label}</span>

            {/* Cria a caixa de seleção.
                defaultValue define "todos" como opção inicial.
                children representa as opções colocadas dentro de Filter. */}
            <select defaultValue="todos">
                {children}
            </select>
        </label>
    )
}


// Componente responsável pela tela do Calendário de Agendamentos.
function CalendarPage() {
    return (
        <main className="page-content">

            {/* Cabeçalho da página com os filtros dentro dele. */}
            <PageHeader title="Calendário de Agendamentos">
                <div className="filters">

                    {/* O conteúdo dentro de Filter é recebido
                        pelo componente por meio da prop children. */}
                    <Filter label="Fornecedor">
                        <option value="todos">Todos</option>
                        <option>Vidros Sul</option>
                        <option>Cristal Glass</option>
                    </Filter>

                    <Filter label="Status">
                        <option value="todos">Todos</option>
                        <option>Pendente</option>
                        <option>Aprovado</option>
                    </Filter>

                    <Filter label="Doca">
                        <option value="todos">Todas</option>
                        <option>Doca 01</option>
                        <option>Doca 02</option>
                    </Filter>
                </div>
            </PageHeader>


            {/* Seção principal que contém o calendário
                e o painel lateral de detalhes. */}
            <section className="calendar-panel">

                {/* Área principal do calendário. */}
                <div className="calendar-panel__main">

                    {/* Barra superior do calendário. */}
                    <div className="calendar-toolbar">

                        {/* Grupo de botões para navegar entre os meses. */}
                        <div className="toolbar-group">
                            <button
                                className="button button--outline"
                                type="button"
                            >
                                Hoje
                            </button>

                            <button
                                className="button button--icon"
                                type="button"
                                aria-label="Mês anterior"
                            >
                                ‹
                            </button>

                            <button
                                className="button button--icon"
                                type="button"
                                aria-label="Próximo mês"
                            >
                                ›
                            </button>

                            {/* Mês que está sendo exibido. */}
                            <h2>Julho 2026</h2>
                        </div>


                        {/* Botões para escolher a forma
                            de visualização do calendário. */}
                        <div className="segmented-control">
                            <button
                                className="is-active"
                                type="button"
                            >
                                Mês
                            </button>

                            <button type="button">
                                Semana
                            </button>

                            <button type="button">
                                Dia
                            </button>
                        </div>
                    </div>


                    {/* Permite que o calendário tenha rolagem
                        em telas menores. */}
                    <div className="calendar-scroll">
                        <table className="calendar-table">

                            {/* Cabeçalho da tabela com os dias da semana. */}
                            <thead>
                                <tr>
                                    {/* Percorre o array de dias.
                                        Para cada dia, cria uma coluna th. */}
                                    {[
                                        "Seg",
                                        "Ter",
                                        "Qua",
                                        "Qui",
                                        "Sex",
                                        "Sáb",
                                        "Dom"
                                    ].map((day) => (
                                        <th key={day}>
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>


                            {/* Corpo da tabela onde aparecem
                                as semanas do calendário. */}
                            <tbody>

                                {/* Percorre o array calendarWeeks.
                                    Cada week representa uma semana completa. */}
                                {calendarWeeks.map((week, weekIndex) => (
                                    <tr key={weekIndex}>

                                        {/* Percorre os dias da semana atual.
                                            Cada cell representa um dia. */}
                                        {week.map((cell, dayIndex) => (
                                            <td
                                                // Junta o número da semana
                                                // com a posição do dia.
                                                key={`${weekIndex}-${dayIndex}`}

                                                // Se o dia pertencer a outro mês,
                                                // adiciona uma classe diferente.
                                                className={
                                                    cell.other
                                                        ? "is-other-month"
                                                        : ""
                                                }
                                            >
                                                {/* Mostra o número do dia.
                                                    Se for hoje, adiciona
                                                    a classe is-today. */}
                                                <span
                                                    className={
                                                        `calendar-day${
                                                            cell.today
                                                                ? " is-today"
                                                                : ""
                                                        }`
                                                    }
                                                >
                                                    {cell.day}
                                                </span>


                                                {/* Renderização condicional:
                                                    o evento só aparece quando
                                                    cell.event existir. */}
                                                {cell.event && (
                                                    <span
                                                        className={
                                                            `calendar-event calendar-event--${cell.event[2]}`
                                                        }
                                                    >
                                                        {/* Posição 0: horário.
                                                            Posição 1: fornecedor. */}
                                                        {cell.event[0]} · {cell.event[1]}
                                                    </span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>


                    {/* Legenda com as cores dos status. */}
                    <div className="legend">

                        {/* Percorre o array legends.
                            A desestruturação separa cada item
                            nas variáveis status e label. */}
                        {legends.map(([status, label]) => (
                            <span key={status}>

                                {/* Círculo colorido do status. */}
                                <i
                                    className={
                                        `status-dot status-dot--${status}`
                                    }
                                />

                                {/* Nome do status. */}
                                {label}
                            </span>
                        ))}
                    </div>
                </div>


                {/* Painel lateral que mostra os dados
                    de um agendamento selecionado. */}
                <aside className="details-panel">

                    {/* Cabeçalho do painel lateral. */}
                    <div className="details-panel__header">
                        <h2>Detalhes</h2>

                        <button
                            type="button"
                            aria-label="Fechar"
                        >
                            ×
                        </button>
                    </div>


                    {/* Componente que mostra o status aprovado.
                        A prop status recebe o valor "approved". */}
                    <StatusBadge status="approved" />


                    {/* Horário e fornecedor do agendamento. */}
                    <div className="details-panel__time">
                        <strong>09:30</strong>
                        <span>Cristal Glass</span>
                    </div>


                    {/* Lista de informações do agendamento.
                        dl representa uma lista de descrição.
                        dt é o nome do campo.
                        dd é o valor do campo. */}
                    <dl className="details-list">
                        <div>
                            <dt>Data</dt>
                            <dd>20/07/2026</dd>
                        </div>

                        <div>
                            <dt>Doca</dt>
                            <dd>Doca 01</dd>
                        </div>

                        <div>
                            <dt>Pedido</dt>
                            <dd>PC-000987/2026</dd>
                        </div>

                        <div>
                            <dt>Volumes</dt>
                            <dd>42 volumes</dd>
                        </div>

                        <div>
                            <dt>Notas fiscais</dt>
                            <dd>3 anexas</dd>
                        </div>
                    </dl>


                    {/* Link para abrir a página
                        com todos os detalhes do agendamento. */}
                    <Link
                        to="/detalhes-agendamento"
                        className="button button--primary button--full"
                    >
                        Ver detalhes completos
                    </Link>
                </aside>
            </section>
        </main>
    )
}


// Exporta o componente para ser utilizado no App.jsx.
export default CalendarPage