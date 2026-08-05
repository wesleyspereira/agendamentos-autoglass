// Importa o componente reutilizável responsável pelo título da página.
import PageHeader from "../components/PageHeader"

function NewAppointment() {
    return (
        <main className="page-content">
            <PageHeader title="Novo Agendamento" />

            <section className="panel new-appointment">
                <h2>Dados do agendamento</h2>
            </section>
        </main>
    )
}
// Exporta o componente para ser utilizado nas rotas do App.jsx.
export default NewAppointment