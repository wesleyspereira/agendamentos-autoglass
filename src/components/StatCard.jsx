function StatCard({ title, value, tone, comparison, positive = false }) {
    return (
        <article className={`stat-card stat-card--${tone}`}>
            <span className="stat-card__title">{title}</span>
            <strong className="stat-card__value">{value}</strong>
            <span className={`stat-card__comparison${positive ? " is-positive" : ""}`}>
                {comparison}{positive && " ↑"}
            </span>
        </article>
    )
}

export default StatCard
