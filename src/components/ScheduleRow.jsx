import StatusBadge from "./StatusBadge"

function ScheduleRow({ appointment, upcoming = false }) {
    return (
        <div className="schedule-row">
            <div className="schedule-row__time">
                <span className={`status-dot status-dot--${appointment.status}`} />
                <strong>{upcoming ? appointment.date : appointment.time}</strong>
                {upcoming && <span>{appointment.time}</span>}
            </div>
            <div className="schedule-row__supplier">
                <strong>{appointment.supplier}</strong>
                <span>{appointment.dock}</span>
            </div>
            <StatusBadge status={appointment.status} />
        </div>
    )
}

export default ScheduleRow
