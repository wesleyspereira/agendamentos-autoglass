const labels = {
    approved: "Aprovado",
    pending: "Pendente",
    progress: "Em andamento",
    completed: "Concluído",
    rejected: "Recusado",
}

function StatusBadge({ status, label = labels[status] }) {
    return <span className={`status-badge status-badge--${status}`}>{label}</span>
}

export default StatusBadge
