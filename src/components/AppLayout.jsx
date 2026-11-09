import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(true);
  return (
    <div className="app-shell">
      <Sidebar hidden={!menuOpen} />
      <div className="app-shell__main">
        <Topbar menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((open) => !open)} />
        <Outlet />
      </div>
    </div>
  );
}

export default AppLayout;
