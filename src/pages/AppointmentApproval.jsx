import { useState } from "react"
import { Link } from "react-router-dom"
import PageHeader from "../components/PageHeader"
import StatusBadge from "../components/StatusBadge"
import { useAppointments } from "../context/AppointmentsContext"
import { appointmentDateKey } from "../utils/appointmentDates"
import { findSlotConflict } from "../utils/appointmentSlots"

function AppointmentApproval() {
    // Usa a lista compartilhada, salva pelo contexto no navegador.
    const { appointments, setAppointments } = useAppointments()

    // A seleção pertence apenas a esta página.
    const [selectedId, setSelectedId] = useState(
        appointments[0]?.id ?? null
    )
    const [actionFeedback, setActionFeedback] = useState("")

    // Se a seleção não existir, mostra o primeiro registro disponível.
    const selectedAppointment =
        appointments.find((appointment) => appointment.id === selectedId) ??
        appointments[0] ??
        null

    // Calcula os indicadores a partir de toda a lista.
    const pendingCount = appointments.filter(
        (appointment) => appointment.status === "pending"
    ).length

    const approvedCount = appointments.filter(
        (appointment) => appointment.status === "approved"
    ).length

    const rejectedCount = appointments.filter(
        (appointment) => appointment.status === "rejected"
    ).length

    // Cada decisão registra um evento no histórico, assim como a conferência
    // e o recebimento. Registros que não estão pendentes não podem ser alterados.
    function updateAppointmentStatus(newStatus) {
        if (!selectedAppointment || selectedAppointment.status !== "pending") return
        if (newStatus !== "approved" && newStatus !== "rejected") return

        // Protege também registros antigos que eventualmente tenham horários duplicados.
        // Outro agendamento pendente não impede a primeira aprovação,
        // mas um já aprovado/em andamento/concluído impede a segunda.
        if (newStatus === "approved") {
            const conflict = findSlotConflict(
                appointments,
                appointmentDateKey(selectedAppointment),
                selectedAppointment.time,
                selectedAppointment.id,
                ["approved", "progress", "completed"]
            )
            if (conflict) {
                setActionFeedback(`Não é possível aprovar: ${conflict.carrier} já utiliza ${selectedAppointment.date} às ${selectedAppointment.time}.`)
                return
            }
        }

        setActionFeedback("")
        const appointmentId = selectedAppointment.id
        const event = {
            id: crypto.randomUUID(),
            title: newStatus === "approved" ? "Agendamento aprovado" : "Agendamento recusado",
            at: new Date().toISOString(),
            tone: newStatus === "approved" ? "green" : "red"
        }

        setAppointments((currentAppointments) =>
            currentAppointments.map((appointment) => {
                if (appointment.id !== appointmentId || appointment.status !== "pending") {
                    return appointment
                }

                return {
                    ...appointment,
                    status: newStatus,
                    history: [...(appointment.history || []), event]
                }
            })
        )
    }

    const latestDecision = ["approved", "rejected"].includes(selectedAppointment?.status) && selectedAppointment?.history?.findLast((event) =>
        event.title === "Agendamento aprovado" || event.title === "Agendamento recusado"
    )

    return (
        <main className="page-content">
            <PageHeader
                title="Aprovação de Agendamentos"
                subtitle="Analise os dados enviados pelas transportadoras."
            />

            {/* Indicadores atualizados sempre que a lista muda. */}
            <section className="approval-stats">
                <article className="stat-card">
                    <span>Aguardando aprovação</span>
                    <strong className="text-pending">
                        {pendingCount}
                    </strong>
                </article>

                <article className="stat-card">
                    <span>Aprovados</span>
                    <strong className="text-approved">
                        {approvedCount}
                    </strong>
                </article>

                <article className="stat-card">
                    <span>Recusados</span>
                    <strong className="text-rejected">
                        {rejectedCount}
                    </strong>
                </article>

                <article className="stat-card">
                    <span>Total de agendamentos</span>
                    <strong className="text-progress">
                        {appointments.length}
                    </strong>
                </article>
            </section>

            <section className="approval-layout">
                <article className="panel approval-list">
                    <div className="approval-list__header">
                        <h2>Agendamentos</h2>
                        <span>{appointments.length} agendamentos</span>
                    </div>

                    <div className="table-container">
                        <table className="approval-table">
                            <thead>
                                <tr>
                                    <th>Transportadora</th>
                                    <th>CT-e / MDF-e</th>
                                    <th>Data</th>
                                    <th>Horário</th>
                                    <th>NF-e</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                {appointments.map((appointment) => (
                                    <tr
                                        key={appointment.id}
                                        className={
                                            selectedAppointment?.id === appointment.id
                                                ? "is-selected"
                                                : ""
                                        }
                                    >
                                        <td>
                                            <strong>
                                                {appointment.carrier}
                                            </strong>

                                            <span className="table-secondary-text">
                                                {appointment.suppliers.join(", ")}
                                            </span>
                                        </td>

                                        <td>
                                            {appointment.documentType}{" "}
                                            {appointment.documentNumber}
                                        </td>

                                        <td>{appointment.date}</td>
                                        <td>{appointment.time}</td>

                                        <td>
                                            {appointment.invoices.length} anexas
                                        </td>

                                        <td>
                                            <StatusBadge
                                                status={appointment.status}
                                            />
                                        </td>

                                        <td>
                                            <button
                                                className="approval-select-button"
                                                type="button"
                                                onClick={() => {
                                                    setSelectedId(appointment.id)
                                                    setActionFeedback("")
                                                }}
                                                aria-label={`Ver agendamento da ${appointment.carrier}`}
                                            >
                                                Ver
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {/* Mensagem exibida quando não há registros. */}
                                {appointments.length === 0 && (
                                    <tr>
                                        <td colSpan={7}>
                                            Nenhum agendamento cadastrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </article>

                <aside className="panel approval-details">
                    <h2>Detalhes do agendamento</h2>

                    {selectedAppointment ? (
                        <div className="approval-details__content">
                            <h3>{selectedAppointment.carrier}</h3>

                            <StatusBadge
                                status={selectedAppointment.status}
                            />

                            <dl>
                                <dt>Documento</dt>
                                <dd>
                                    {selectedAppointment.documentType}{" "}
                                    {selectedAppointment.documentNumber}
                                </dd>

                                <dt>Data</dt>
                                <dd>{selectedAppointment.date}</dd>

                                <dt>Horário</dt>
                                <dd>{selectedAppointment.time}</dd>

                                <dt>Fornecedores</dt>
                                <dd>
                                    {selectedAppointment.suppliers.join(", ")}
                                </dd>

                                <dt>Notas fiscais</dt>
                                <dd>
                                    {selectedAppointment.invoices.length} anexas
                                </dd>

                                <dt>Volumes</dt>
                                <dd>
                                    {selectedAppointment.volumes} ·{" "}
                                    {selectedAppointment.volumeTypes.join(" + ")}
                                </dd>
                            </dl>

                            {/* Bloqueia as ações após aprovar ou recusar. */}
                            {actionFeedback && <p className="approval-action-feedback" role="alert">{actionFeedback}</p>}
                            <div className="approval-details__actions">
                                <button
                                    type="button"
                                    onClick={() =>
                                        updateAppointmentStatus("approved")
                                    }
                                    disabled={
                                        selectedAppointment.status !== "pending"
                                    }
                                >
                                    Aprovar
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        updateAppointmentStatus("rejected")
                                    }
                                    disabled={
                                        selectedAppointment.status !== "pending"
                                    }
                                >
                                    Recusar
                                </button>
                            </div>

                            {latestDecision && (
                                <p className="approval-decision-info" role="status">
                                    {latestDecision.title} em {new Date(latestDecision.at).toLocaleString("pt-BR")}.
                                </p>
                            )}

                            {["pending", "approved"].includes(selectedAppointment.status) && (
                                <Link
                                    className="approval-history-link"
                                    to={`/reagendar-agendamento?id=${encodeURIComponent(selectedAppointment.id)}`}
                                >
                                    Reagendar entrega →
                                </Link>
                            )}

                            <Link
                                className="approval-history-link"
                                to={`/detalhes-agendamento?id=${encodeURIComponent(selectedAppointment.id)}`}
                            >
                                Ver detalhes e histórico completo →
                            </Link>
                        </div>
                    ) : (
                        <p>Nenhum agendamento disponível para análise.</p>
                    )}
                </aside>
            </section>
        </main>
    )
}

export default AppointmentApproval