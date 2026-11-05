import { Navigate, Route, Routes } from "react-router-dom"
import AppLayout from "./components/AppLayout"
import CalendarPage from "./pages/CalendarPage"
import Dashboard from "./pages/Dashboard"
import WeeklySchedule from "./pages/WeeklySchedule"
import AppointmentDetails from "./pages/AppointmentDetails"
import NewAppointment from "./pages/NewAppointment"

function App() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="calendario" element={<CalendarPage />} />
                <Route path="agenda-semanal" element={<WeeklySchedule />} />
                <Route path="detalhes-agendamento" element={<AppointmentDetails />} />
                <Route path="*" element={<Navigate to="/" replace />} />
                <Route path="novo-agendamento" element={<NewAppointment />} />
            </Route>
        </Routes>
    )
}

export default App;
