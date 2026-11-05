import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import PageHeader from "../components/PageHeader"
import StatusBadge from "../components/StatusBadge"
import { useAppointments } from "../context/AppointmentsContext"
import { appointmentDateKey, localDateKey } from "../utils/appointmentDates"
import { AVAILABLE_TIMES, isPastSlot } from "../utils/appointmentSlots"
import {
  canReschedule,
  formatRescheduleDate,
  prepareReschedule,
  rescheduleSlotStatus,
} from "../utils/rescheduleAppointment"
import "../styles/calendar-updates.css"

function initialDate(appointment) {
  const original = appointmentDateKey(appointment)
  const now = new Date()
  const lastTime = AVAILABLE_TIMES.at(-1)
  if (original >= localDateKey(now) && !isPastSlot(original, lastTime, now)) return original
  if (!isPastSlot(localDateKey(now), lastTime, now)) return localDateKey(now)
  now.setDate(now.getDate() + 1)
  return localDateKey(now)
}

function RescheduleForm({ appointment, appointments, setAppointments }) {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(() => initialDate(appointment))
  const [selectedTime, setSelectedTime] = useState(() => appointment.time)
  const [reason, setReason] = useState("")
  const [feedback, setFeedback] = useState("")
  const dateISO = appointmentDateKey(appointment)
  const statuses = AVAILABLE_TIMES.map((time) => ({
    time,
    status: rescheduleSlotStatus(appointments, appointment, selectedDate, time),
  }))
  const selectedStatus = rescheduleSlotStatus(appointments, appointment, selectedDate, selectedTime)
  const canSubmit = selectedStatus === "available"
  const freeCount = statuses.filter(({ status }) => status === "available").length
  const today = localDateKey()

  // Seleciona uma opção livre ao mudar a data ou quando o horário fica ocupado.
  useEffect(() => {
    setSelectedTime((currentTime) => {
      const currentStatus = rescheduleSlotStatus(appointments, appointment, selectedDate, currentTime)
      if (currentStatus === "available" || currentStatus === "current") return currentTime
      return AVAILABLE_TIMES.find((time) =>
        rescheduleSlotStatus(appointments, appointment, selectedDate, time) === "available"
      ) ?? ""
    })
  }, [appointments, appointment, selectedDate])

  function save(event) {
    event.preventDefault()
    const outcome = prepareReschedule(appointments, appointment.id, selectedDate, selectedTime, reason)
    if (outcome.error) {
      setFeedback(outcome.error)
      return
    }
    setAppointments(outcome.appointments)
    navigate(`/detalhes-agendamento?id=${encodeURIComponent(appointment.id)}`, {
      replace: true,
      state: { rescheduled: true },
    })
  }

  return (
    <main className="page-content">
      <PageHeader title="Reagendar entrega" subtitle="Altere somente a data e o horário, mantendo os dados já cadastrados.">
        <button className="button button--outline" type="button" onClick={() => navigate(`/detalhes-agendamento?id=${encodeURIComponent(appointment.id)}`)}>
          ← Voltar aos detalhes
        </button>
      </PageHeader>

      <section className="panel reschedule-summary">
        <div>
          <span className="reschedule-label">Transportadora</span>
          <h2>{appointment.carrier}</h2>
          <p>{appointment.documentType} {appointment.documentNumber} · {appointment.suppliers.join(", ")}</p>
        </div>
        <div className="reschedule-current">
          <span className="reschedule-label">Agendamento atual</span>
          <strong>{appointment.date} às {appointment.time}</strong>
          <StatusBadge status={appointment.status} />
        </div>
      </section>

      <form className="panel reschedule-form" onSubmit={save}>
        <h2>Nova data e horário</h2>
        <p className="reschedule-help">Escolha uma data e depois um horário livre. A vaga antiga será liberada automaticamente.</p>
        <div className="reschedule-layout">
          <div>
            <label className="transport-field">
              <span>Nova data da entrega</span>
              <input type="date" value={selectedDate} min={today} required onChange={(event) => { setSelectedDate(event.target.value); setFeedback("") }} />
            </label>
            <label className="transport-field reschedule-reason">
              <span>Motivo do reagendamento (opcional)</span>
              <textarea rows="4" maxLength="400" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Ex.: transportadora solicitou nova data" />
            </label>
          </div>
          <div>
            <h3>Horários disponíveis</h3>
            <div className="booking-time-grid reschedule-time-grid">
              {statuses.map(({ time, status }) => (
                <button
                  type="button"
                  className={`${selectedTime === time && (status === "available" || status === "current") ? "is-selected" : ""} ${status === "occupied" ? "is-occupied" : ""}`.trim()}
                  aria-pressed={selectedTime === time}
                  aria-label={`${time} - ${status === "occupied" ? "Ocupado" : status === "past" ? "Encerrado" : status === "current" ? "Horário atual" : "Disponível"}`}
                  disabled={status !== "available" && status !== "current"}
                  onClick={() => { setSelectedTime(time); setFeedback("") }}
                  key={time}
                >
                  <span>{time}</span>
                  {status === "occupied" && <small>Ocupado</small>}
                  {status === "past" && <small>Encerrado</small>}
                  {status === "current" && <small>Atual</small>}
                </button>
              ))}
            </div>
            <p className="booking-slots-counter" aria-live="polite">{freeCount ? `${freeCount} horários livres nesta data.` : "Nenhum novo horário livre nesta data."}</p>
          </div>
        </div>
        <div className="reschedule-preview">
          <div><span>De</span><strong>{appointment.date} · {appointment.time}</strong></div>
          <span aria-hidden="true">→</span>
          <div><span>Para</span><strong>{selectedDate ? formatRescheduleDate(selectedDate) : "Escolha uma data"} · {selectedTime || "—"}</strong></div>
        </div>
        {appointment.status === "approved" && <p className="reschedule-warning">Ao reagendar uma entrega aprovada, o status voltará para <strong>Pendente</strong> e será necessária uma nova aprovação.</p>}
        <footer className="reschedule-footer">
          <p role="alert" className="form-feedback">{feedback}</p>
          <Link className="button button--outline" to={`/detalhes-agendamento?id=${encodeURIComponent(appointment.id)}`}>Cancelar</Link>
          <button className="button button--primary" type="submit" disabled={!canSubmit}>Confirmar reagendamento</button>
        </footer>
      </form>
    </main>
  )
}

function RescheduleAppointment() {
  const [searchParams] = useSearchParams()
  const appointmentId = searchParams.get("id")
  const { appointments, setAppointments } = useAppointments()
  const appointment = appointments.find((item) => String(item.id) === String(appointmentId))

  if (!appointment) return (
    <main className="page-content">
      <PageHeader title="Reagendar entrega" subtitle="Não foi possível localizar esta entrega." />
      <section className="panel reschedule-message"><p>Agendamento não encontrado.</p><Link className="button button--primary" to="/calendario">Voltar ao calendário</Link></section>
    </main>
  )

  if (!canReschedule(appointment)) return (
    <main className="page-content">
      <PageHeader title="Reagendar entrega" subtitle="Esta entrega não pode mais ser reagendada." />
      <section className="panel reschedule-message"><p>Somente entregas <strong>pendentes ou aprovadas</strong> podem ser reagendadas. Recebimentos iniciados, concluídos ou recusados não podem mudar de horário.</p><Link className="button button--primary" to={`/detalhes-agendamento?id=${encodeURIComponent(appointment.id)}`}>Ver detalhes</Link></section>
    </main>
  )

  return <RescheduleForm key={appointment.id} appointment={appointment} appointments={appointments} setAppointments={setAppointments} />
}

export default RescheduleAppointment
