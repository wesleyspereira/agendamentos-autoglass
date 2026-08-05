function Topbar() {
    return (
        <header className="topbar">
            <button type="button" className="icon-button" aria-label="Abrir menu lateral">☰</button>

            <div className="topbar__user">
                <button type="button" className="notification-button" aria-label="Notificações">
                    🔔
                    <span className="notification-button__dot" />
                </button>
                <span>Olá, Recebimento</span>
                <span aria-hidden="true">⌄</span>
            </div>
        </header>
    )
}

export default Topbar
