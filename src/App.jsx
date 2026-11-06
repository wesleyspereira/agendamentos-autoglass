import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/AppLayout";

import AppointmentDetails from "./pages/AppointmentDetails";
import AppointmentVerification from "./pages/AppointmentVerification";
import CalendarPage from "./pages/CalendarPage";
import Dashboard from "./pages/Dashboard";
import NewAppointment from "./pages/NewAppointment";
import AppointmentApproval from "./pages/AppointmentApproval"
import RescheduleAppointment from "./pages/RescheduleAppointment"

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />

        <Route path="calendario" element={<CalendarPage />} />

        <Route path="verificacao-agendamentos" element={<AppointmentVerification />}  />

        <Route path="detalhes-agendamento" element={<AppointmentDetails />} />

        <Route path="novo-agendamento" element={<NewAppointment />} />

        <Route path="reagendar-agendamento" element={<RescheduleAppointment />} />

        <Route path="aprovacao-agendamentos" element={<AppointmentApproval />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
