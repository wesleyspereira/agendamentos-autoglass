import { NavLink } from "react-router-dom";

const menuItems = [
  { to: "/", icon: "⌂", label: "Início", end: true },
  { to: "/calendario", icon: "▣", label: "Calendário" },
  { to: "/verificacao-agendamentos", icon: "☷", label: "Agendamentos" },
  { to: "/aprovacao-agendamentos", icon: "✓", label: "Aprovação" },
  { to: "/recebimentos", icon: "□", label: "Recebimentos" },
  { to: "/ocorrencias", icon: "△", label: "Ocorrências" },
  { to: "/relatorios", icon: "▤", label: "Relatórios" },
];

const futureItems = [{ icon: "◇", label: "Cadastros" }];

function Sidebar({ hidden }) {
  return (
    <aside className="sidebar" id="menu-principal" hidden={hidden}>
      <NavLink to="/" className="brand" aria-label="Ir para a visão geral">
        <span className="brand__icon" aria-hidden="true">
          ✓
        </span>
        <span className="brand__text">
          <strong>Agenda</strong>
          <small>Recebimento</small>
        </span>
      </NavLink>

      <nav className="sidebar__menu" aria-label="Menu principal">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            aria-label={item.label}
            title={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `menu-item${isActive ? " menu-item--active" : ""}`}
          >
            <span className="menu-item__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {futureItems.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled
            aria-label={item.label + " (em breve)"}
            title={item.label + " (em breve)"}
            className="menu-item menu-item--button"
          >
            <span className="menu-item__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
