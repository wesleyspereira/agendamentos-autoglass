function Topbar({ menuOpen, onToggleMenu }) {
  return (
    <header className="topbar">
      <button
        type="button"
        className="icon-button"
        aria-controls="menu-principal"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Recolher menu lateral" : "Abrir menu lateral"}
        onClick={onToggleMenu}
      >
        ☰
      </button>

      <div className="topbar__user">
        <button type="button" className="notification-button" aria-label="Notificações">
          🔔
          <span className="notification-button__dot" />
        </button>
        <span>Olá, Recebimento</span>
        <span aria-hidden="true">⌄</span>
      </div>
    </header>
  );
}

export default Topbar;
