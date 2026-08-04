import PageHeader from "../components/PageHeader"
import StatusBadge from "../components/StatusBadge"
import { calendarWeeks } from "../data/appointments"

const legends = [
    ["pending", "Pendente"], ["approved", "Aprovado"], ["progress", "Em andamento"],
    ["completed", "Concluído"], ["rejected", "Recusado"],
]

function Filter({ label, children }) {
    return (
        <label className="filter-field">
            <span>{label}</span>
            <select defaultValue="todos">{children}</select>
        </label>
    )
}

function CalendarPage() {
    return (
        <main className="page-content">
            <PageHeader title="Calendário de Agendamentos">
                <div className="filters">
                    <Filter label="Fornecedor"><option value="todos">Todos</option><option>Vidros Sul</option><option>Cristal Glass</option></Filter>
                    <Filter label="Status"><option value="todos">Todos</option><option>Pendente</option><option>Aprovado</option></Filter>
                    <Filter label="Doca"><option value="todos">Todas</option><option>Doca 01</option><option>Doca 02</option></Filter>
                </div>
            </PageHeader>

            <section className="calendar-panel">
                <div className="calendar-panel__main">
                    <div className="calendar-toolbar">
                        <div className="toolbar-group">
                            <button className="button button--outline" type="button">Hoje</button>
                            <button className="button button--icon" type="button" aria-label="Mês anterior">‹</button>
                            <button className="button button--icon" type="button" aria-label="Próximo mês">›</button>
                            <h2>Julho 2026</h2>
                        </div>
                        <div className="segmented-control">
                            <button className="is-active" type="button">Mês</button>
                            <button type="button">Semana</button>
                            <button type="button">Dia</button>
                        </div>
                    </div>

                    <div className="calendar-scroll">
                        <table className="calendar-table">
                            <thead><tr>{["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => <th key={day}>{day}</th>)}</tr></thead>
                            <tbody>{calendarWeeks.map((week, weekIndex) => (
                                <tr key={weekIndex}>{week.map((cell, dayIndex) => (
                                    <td key={`${weekIndex}-${dayIndex}`} className={cell.other ? "is-other-month" : ""}>
                                        <span className={`calendar-day${cell.today ? " is-today" : ""}`}>{cell.day}</span>
                                        {cell.event && <span className={`calendar-event calendar-event--${cell.event[2]}`}>{cell.event[0]} · {cell.event[1]}</span>}
                                    </td>
                                ))}</tr>
                            ))}</tbody>
                        </table>
                    </div>

                    <div className="legend">{legends.map(([status, label]) => <span key={status}><i className={`status-dot status-dot--${status}`} />{label}</span>)}</div>
                </div>

                <aside className="details-panel">
                    <div className="details-panel__header"><h2>Detalhes</h2><button type="button" aria-label="Fechar">×</button></div>
                    <StatusBadge status="approved" />
                    <div className="details-panel__time"><strong>09:30</strong><span>Cristal Glass</span></div>
                    <dl className="details-list">
                        <div><dt>Data</dt><dd>20/07/2026</dd></div>
                        <div><dt>Doca</dt><dd>Doca 01</dd></div>
                        <div><dt>Pedido</dt><dd>PC-000987/2026</dd></div>
                        <div><dt>Volumes</dt><dd>42 volumes</dd></div>
                        <div><dt>Notas fiscais</dt><dd>3 anexas</dd></div>
                    </dl>
                    <button className="button button--primary button--full" type="button">Ver detalhes completos</button>
                </aside>
            </section>
        </main>
    )
}

export default CalendarPage
