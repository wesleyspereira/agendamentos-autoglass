import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import PageHeader from "../components/PageHeader"
import StatusBadge from "../components/StatusBadge"
import { useAppointments } from "../context/AppointmentsContext"
import "../styles/calendar-updates.css"

function AppointmentDetails() {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const { appointments, setAppointments } = useAppointments()
    const appointmentId = searchParams.get("id")
    // Aceita tanto IDs numéricos da demonstração como IDs dos novos registros.
    const appointment = appointments.find((item) => String(item.id) === appointmentId)

    if (!appointment) {
        return (
            <main className="page-content">
                <PageHeader title="Detalhes do Agendamento" subtitle="Selecione uma entrega pelo calendário." />
                <section className="panel">
                    <p>{appointmentId ? "Agendamento não encontrado." : "Nenhum agendamento selecionado."}</p>
                    <button className="button button--primary" type="button" onClick={() => navigate("/calendario")}>Abrir calendário</button>
                </section>
            </main>
        )
    }

    const dateISO = appointment.dateISO || appointment.date.split("/").reverse().join("-")
    const history = [...(appointment.createdAt ? [{
        id: `created-${appointment.id}`, title: "Agendamento criado", at: appointment.createdAt, tone: "blue"
    }] : []), ...(appointment.history || [])]

    // Registra somente ações realmente executadas; não cria um histórico fictício.
    function changeReceivingStatus(nextStatus) {
        const previousStatus = nextStatus === "progress" ? "approved" : nextStatus === "completed" ? "progress" : null
        if (!previousStatus) return
        const event = {
            id: crypto.randomUUID(),
            title: nextStatus === "progress" ? "Recebimento iniciado" : "Recebimento concluído",
            at: new Date().toISOString(),
            tone: nextStatus === "completed" ? "green" : "blue"
        }
        setAppointments((current) => current.map((item) =>
            item.id === appointment.id && item.status === previousStatus
                ? { ...item, status: nextStatus, history: [...(item.history || []), event] }
                : item
        ))
    }

    const documents = [
        ...(appointment.documentFiles || []).map((file) => file.name),
        ...appointment.invoices
    ]

    return (
        <main className="page-content">
            <PageHeader title="Detalhes do Agendamento" subtitle="Consulte os dados da carga e acompanhe o histórico desta entrega.">
                <button className="button button--outline" type="button" onClick={() => navigate(`/calendario?date=${encodeURIComponent(dateISO)}`)}>← Voltar ao calendário</button>
            </PageHeader>
            <section className="transport-details-grid details-connected">
                <article className="panel transport-details-card">
                    <div className="transport-details-summary">
                        <div className="transport-details-summary__icon">▣</div>
                        <div><strong>{appointment.time}</strong><span>{appointment.date}</span></div>
                        <b>{appointment.carrier}</b>
                        <StatusBadge status={appointment.status} />
                    </div>
                    <dl className="transport-details-list">
                        <div><dt>Transportadora</dt><dd>{appointment.carrier}</dd></div>
                        <div><dt>CNPJ</dt><dd>{appointment.carrierCnpj || "Não informado"}</dd></div>
                        <div><dt>CT-e / MDF-e</dt><dd>{appointment.documentType} {appointment.documentNumber}</dd></div>
                        <div className="transport-details-list__wide"><dt>Chave do CT-e / MDF-e</dt><dd>{appointment.documentKey || "Não informada"}</dd></div>
                        <div><dt>Fornecedores</dt><dd>{appointment.suppliers.join(", ")}</dd></div>
                        <div><dt>Data e horário</dt><dd>{appointment.date} às {appointment.time}</dd></div>
                        <div><dt>Tipo de volume</dt><dd>{appointment.volumeTypes.join(" + ")}</dd></div>
                        <div><dt>Quantidade</dt><dd>{appointment.volumes} volumes</dd></div>
                        <div><dt>Placa do veículo</dt><dd>{appointment.plate || "Não informada"}</dd></div>
                        <div><dt>Motorista</dt><dd>{appointment.driver || "Não informado"}</dd></div>
                        <div><dt>Conferência</dt><dd>{appointment.verified ? "Verificado" : "Ainda não verificado"}</dd></div>
                        <div className="transport-details-list__wide"><dt>Observações</dt><dd>{appointment.observations || "Nenhuma observação."}</dd></div>
                    </dl>
                    <section className="transport-documents">
                        <h2>Documentos registrados</h2>
                        <p className="document-storage-note">Esta demonstração registra os nomes dos documentos. Os arquivos não estão disponíveis para download.</p>
                        <div>
                            {documents.map((name, index) => <div className="registered-document" key={`${name}-${index}`}><span aria-hidden="true">▤</span><strong>{name}</strong></div>)}
                            {documents.length === 0 && <p>Nenhum arquivo registrado.</p>}
                        </div>
                    </section>
                    {location.state?.rescheduled && <p className="reschedule-success" role="status">Entrega reagendada com sucesso. Confira a nova data e o histórico.</p>}
                    <div className="transport-details-actions">
                        {["pending", "approved"].includes(appointment.status) && <button className="button button--outline" type="button" onClick={() => navigate(`/reagendar-agendamento?id=${encodeURIComponent(appointment.id)}`)}>Reagendar entrega</button>}
                        {appointment.status === "approved" && <button className="button button--primary" type="button" onClick={() => changeReceivingStatus("progress")}>Iniciar recebimento</button>}
                        {appointment.status === "progress" && <button className="button button--primary" type="button" onClick={() => changeReceivingStatus("completed")}>Concluir recebimento</button>}
                        {appointment.status === "pending" && <p>Aguardando aprovação para iniciar o recebimento.</p>}
                        {appointment.status === "rejected" && <p>Este agendamento foi recusado.</p>}
                        {appointment.status === "completed" && <p role="status">Recebimento concluído.</p>}
                    </div>
                </article>
                <aside className="panel transport-history-card">
                    <h2>Histórico</h2>
                    {history.length ? <ol className="transport-history-timeline">
                        {history.map((item) => <li className={`transport-history-item transport-history-item--${item.tone || "blue"}`} key={item.id}>
                            <strong>{item.title}</strong>
                            <span>{new Date(item.at).toLocaleString("pt-BR")}</span>
                            {item.details && <p className="transport-history-details">{item.details}</p>}
                        </li>)}
                    </ol> : <p className="history-empty">Nenhuma movimentação registrada para esta entrega.</p>}
                </aside>
            </section>
        </main>
    )
}

export default AppointmentDetails
