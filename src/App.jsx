import { useState } from "react";
import PortalLogin from "./pages/PortalLogin";
import Registrations from "./pages/Registrations";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { AppointmentsProvider } from "./context/AppointmentsContext";
import { readPortalName, savePortalName } from "./utils/portalSession";

import Receiving from "./pages/Receiving";
import DeliveryIssues from "./pages/DeliveryIssues";
import Reports from "./pages/Reports";
import AppLayout from "./components/AppLayout";

import AppointmentDetails from "./pages/AppointmentDetails";
import AppointmentVerification from "./pages/AppointmentVerification";
import CalendarPage from "./pages/CalendarPage";
import Dashboard from "./pages/Dashboard";
import NewAppointment from "./pages/NewAppointment";
import AppointmentApproval from "./pages/AppointmentApproval";
import RescheduleAppointment from "./pages/RescheduleAppointment";

function App() {
  const navigate = useNavigate();
  const [name, setName] = useState(readPortalName);
  function identify(value) {
    savePortalName(value);
    setName(value);
    navigate("/", { replace: true });
  }
  if (!name) return <PortalLogin onEnter={identify} />;

  return (
    <AppointmentsProvider>
      <Routes>
        <Route element={<AppLayout userName={name} onLeave={() => identify("")} />}>
          <Route index element={<Dashboard />} />

          <Route path="calendario" element={<CalendarPage />} />

          <Route path="verificacao-agendamentos" element={<AppointmentVerification />} />

          <Route path="detalhes-agendamento" element={<AppointmentDetails internal />} />

          <Route path="novo-agendamento" element={<NewAppointment />} />

          <Route path="reagendar-agendamento" element={<RescheduleAppointment />} />

          <Route path="aprovacao-agendamentos" element={<AppointmentApproval />} />

          <Route path="recebimentos" element={<Receiving />} />

          <Route path="ocorrencias" element={<DeliveryIssues internal />} />

          <Route path="cadastros" element={<Registrations />} />
          <Route path="relatorios" element={<Reports />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AppointmentsProvider>
  );
}

export default App;
