import { Navigate, Route, Routes } from "react-router-dom";

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
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />

        <Route path="calendario" element={<CalendarPage />} />

        <Route path="verificacao-agendamentos" element={<AppointmentVerification />} />

        <Route path="detalhes-agendamento" element={<AppointmentDetails internal />} />

        <Route path="novo-agendamento" element={<NewAppointment internal />} />

        <Route path="reagendar-agendamento" element={<RescheduleAppointment />} />

        <Route path="aprovacao-agendamentos" element={<AppointmentApproval />} />

        <Route path="recebimentos" element={<Receiving />} />

        <Route path="ocorrencias" element={<DeliveryIssues internal />} />

        <Route path="relatorios" element={<Reports />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
