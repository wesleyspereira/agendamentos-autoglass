import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import Filter from "../components/Filter"
import PageHeader from "../components/PageHeader"
import PageToolbar from "../components/PageToolbar"
import StatusBadge from "../components/StatusBadge"
import { useAppointments } from "../context/AppointmentsContext"
import "../styles/calendar-updates.css"

const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
const statuses = {
    pending: "Pendente", approved: "Aprovado", progress: "Em andamento",
    completed: "Concluído", rejected: "Recusado"
}

// Mantém as datas no fuso local, sem converter meia-noite para UTC.
function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function appointmentDate(appointment) {
    return appointment.dateISO || appointment.date.split("/").reverse().join("-")
}

function parseDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null
    const [year, month, day] = value.split("-").map(Number)
    const date = new Date(year, month - 1, day)
    return dateKey(date) === value ? date : null
}

// Calcula os dias exibidos nas visões de mês, semana e dia.
function visibleDates(focusDate, view) {
    let start = new Date(focusDate.getFullYear(), focusDate.getMonth(), focusDate.getDate())
    let count = 1
    if (view === "month") {
        start.setDate(1)
        const offset = (start.getDay() + 6) % 7
        const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate()
        count = Math.ceil((offset + daysInMonth) / 7) * 7
        start.setDate(start.getDate() - offset)
    } else if (view === "week") {
        start.setDate(start.getDate() - (start.getDay() + 6) % 7)
        count = 7
    }
    return Array.from({ length: count }, (_, index) =>
        new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
    )
}

function CalendarPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { appointments } = useAppointments()
    const [focusDate, setFocusDate] = useState(() => parseDate(searchParams.get("date")) || new Date())
    const [calendarView, setCalendarView] = useState("month")
    const [selectedId, setSelectedId] = useState(null)
    const [carrierFilter, setCarrierFilter] = useState("")
    const [supplierFilter, setSupplierFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState("")

    const carriers = [...new Set(appointments.map((item) => item.carrier))].sort()
    const suppliers = [...new Set(appointments.flatMap((item) => item.suppliers))].sort()
    const dates = visibleDates(focusDate, calendarView)
    const dateKeys = new Set(dates.map(dateKey))
    const today = dateKey(new Date())

    const filteredAppointments = appointments.filter((item) =>
        (!carrierFilter || item.carrier === carrierFilter) &&
        (!supplierFilter || item.suppliers.includes(supplierFilter)) &&
        (!statusFilter || item.status === statusFilter)
    )
    const visibleAppointments = filteredAppointments
        .filter((item) => dateKeys.has(appointmentDate(item)))
        .sort((a, b) => `${appointmentDate(a)} ${a.time}`.localeCompare(`${appointmentDate(b)} ${b.time}`))

    // Não mantém detalhes de um registro escondido pelos filtros ou pelo período.
    const selectedAppointment = visibleAppointments.find((item) => item.id === selectedId) || null
    const periodLabel = calendarView === "month"
        ? focusDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
        : calendarView === "day"
            ? focusDate.toLocaleDateString("pt-BR")
            : `${dates[0].toLocaleDateString("pt-BR")} – ${dates[6].toLocaleDateString("pt-BR")}`

    function changePeriod(direction) {
        setFocusDate((current) => calendarView === "month"
            ? new Date(current.getFullYear(), current.getMonth() + direction, 1)
            : new Date(current.getFullYear(), current.getMonth(), current.getDate() + direction * (calendarView === "week" ? 7 : 1))
        )
    }

    return (
        <main className="page-content">
            <PageHeader title="Calendário de Agendamentos" subtitle="Consulte as entregas programadas por data, transportadora e fornecedor.">
                <button className="button button--primary" type="button" onClick={() => navigate("/novo-agendamento")}>
                    ＋ Novo agendamento
                </button>
            </PageHeader>

            <PageToolbar meta={`${visibleAppointments.length} agendamentos nos dias exibidos`}>
                <Filter label="Transportadora" value={carrierFilter} onChange={(event) => setCarrierFilter(event.target.value)}>
                    <option value="">Todas</option>
                    {carriers.map((carrier) => <option key={carrier} value={carrier}>{carrier}</option>)}
                </Filter>
                <Filter label="Fornecedor" value={supplierFilter} onChange={(event) => setSupplierFilter(event.target.value)}>
                    <option value="">Todos</option>
                    {suppliers.map((supplier) => <option key={supplier} value={supplier}>{supplier}</option>)}
                </Filter>
                <Filter label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    <option value="">Todos</option>
                    {Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </Filter>
            </PageToolbar>

            <section className="transport-calendar-panel calendar-connected">
                <div className="transport-calendar-main">
                    <div className="transport-calendar-toolbar">
                        <div>
                            <button className="button button--outline" type="button" onClick={() => setFocusDate(new Date())}>Hoje</button>
                            <button className="button button--icon" type="button" aria-label="Período anterior" onClick={() => changePeriod(-1)}>‹</button>
                            <button className="button button--icon" type="button" aria-label="Próximo período" onClick={() => changePeriod(1)}>›</button>
                            <h2>{periodLabel}</h2>
                        </div>
                        <div className="segmented-control">
                            {[["month", "Mês"], ["week", "Semana"], ["day", "Dia"]].map(([value, label]) => (
                                <button key={value} type="button" className={calendarView === value ? "is-active" : ""} aria-pressed={calendarView === value} onClick={() => setCalendarView(value)}>{label}</button>
                            ))}
                        </div>
                    </div>
                    <label className="calendar-date-picker">
                        Ir para a data
                        <input type="date" value={dateKey(focusDate)} onChange={(event) => {
                            const nextDate = parseDate(event.target.value)
                            if (nextDate) setFocusDate(nextDate)
                        }} />
                    </label>

                    {visibleAppointments.length === 0 && <p className="calendar-empty" role="status">Nenhum agendamento encontrado nos dias exibidos com esses filtros.</p>}

                    <div className={`transport-calendar-grid${calendarView === "day" ? " calendar-grid--day" : ""}`}>
                        {(calendarView === "day" ? [focusDate.toLocaleDateString("pt-BR", { weekday: "long" })] : weekDays).map((day) => <strong className="transport-calendar-weekday" key={day}>{day}</strong>)}
                        {dates.map((date) => {
                            const key = dateKey(date)
                            const dayAppointments = visibleAppointments.filter((item) => appointmentDate(item) === key)
                            return (
                                <div key={key} className={`transport-calendar-day${calendarView === "month" && date.getMonth() !== focusDate.getMonth() ? " is-other-month" : ""}${key === today ? " is-today" : ""}`}>
                                    <span>{date.getDate()}</span>
                                    {dayAppointments.map((item) => (
                                        <button key={item.id} className={`transport-calendar-event transport-calendar-event--${item.status}`} type="button" aria-pressed={selectedId === item.id} onClick={() => setSelectedId(item.id)}>
                                            {item.time} · {item.carrier}
                                        </button>
                                    ))}
                                </div>
                            )
                        })}
                    </div>
                </div>

                <aside className="transport-calendar-details">
                    <h2>Detalhes</h2>
                    {selectedAppointment ? <>
                        <StatusBadge status={selectedAppointment.status} />
                        <strong className="transport-calendar-details__time">{selectedAppointment.time}</strong>
                        <b>{selectedAppointment.carrier}</b>
                        <dl>
                            <div><dt>Data</dt><dd>{selectedAppointment.date}</dd></div>
                            <div><dt>CT-e / MDF-e</dt><dd>{selectedAppointment.documentType} {selectedAppointment.documentNumber}</dd></div>
                            <div><dt>Fornecedores</dt><dd>{selectedAppointment.suppliers.join(", ")}</dd></div>
                            <div><dt>Notas fiscais</dt><dd>{selectedAppointment.invoices.length} registradas</dd></div>
                            <div><dt>Volumes</dt><dd>{selectedAppointment.volumes} · {selectedAppointment.volumeTypes.join(" + ")}</dd></div>
                        </dl>
                        {/* O ID na URL identifica a entrega que a próxima tela deve abrir. */}
                        <button className="button button--primary button--full" type="button" onClick={() => navigate(`/detalhes-agendamento?id=${encodeURIComponent(selectedAppointment.id)}`)}>Ver detalhes completos</button>
                    </> : <p>Selecione uma entrega no calendário para consultar seus dados.</p>}
                </aside>
            </section>
        </main>
    )
}

export default CalendarPage
