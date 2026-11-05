import { createContext, useContext, useEffect, useState } from "react"
import { transportAppointments } from "../data/transportAppointments"

// Nome usado para guardar os dados no navegador.
const STORAGE_KEY = "autoglass-agendamentos-v1"

// Cria o contexto que compartilhará os dados entre as páginas.
const AppointmentsContext = createContext(null)

function loadAppointments() {
    try {
        const savedAppointments = localStorage.getItem(STORAGE_KEY)

        if (savedAppointments) {
            const parsedAppointments = JSON.parse(savedAppointments)

            if (Array.isArray(parsedAppointments)) {
                return parsedAppointments
            }
        }
    } catch (error) {
        console.error("Não foi possível carregar os agendamentos.", error)
    }

    // Na primeira utilização, começa com os dados demonstrativos.
    return transportAppointments
}

export function AppointmentsProvider({ children }) {
    const [appointments, setAppointments] = useState(loadAppointments)
    const [storageError, setStorageError] = useState("")

    // Salva novamente sempre que a lista é alterada.
    useEffect(() => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(appointments)
            )

            setStorageError("")
        } catch (error) {
            console.error("Não foi possível salvar os agendamentos.", error)

            setStorageError(
                "As alterações estão na tela, mas não puderam ser salvas neste navegador."
            )
        }
    }, [appointments])

    return (
        <AppointmentsContext.Provider
            value={{ appointments, setAppointments, storageError }}
        >
            {storageError && <p role="alert">{storageError}</p>}
            {children}
        </AppointmentsContext.Provider>
    )
}

// As páginas usarão esta função para acessar a lista compartilhada.
export function useAppointments() {
    const context = useContext(AppointmentsContext)

    if (!context) {
        throw new Error(
            "useAppointments deve ser usado dentro de AppointmentsProvider."
        )
    }

    return context
}