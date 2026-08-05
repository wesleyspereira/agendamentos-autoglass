// Importa o cabeçalho reutilizável das páginas.
import PageHeader from "../components/PageHeader"

// Importa o componente responsável por exibir o status.
import StatusBadge from "../components/StatusBadge"


// Array com o histórico de alterações do agendamento.
const historyItems = [
    {
        title: "Solicitado",
        date: "19/07/2026 • 14:32",
        status: "blue"
    },
    {
        title: "Aprovado",
        date: "19/07/2026 • 16:45",
        status: "green"
    },
    {
        title: "Recebimento iniciado",
        date: "20/07/2026 • 08:42",
        status: "blue"
    }
]


// Componente responsável pela tela de detalhes do agendamento.
function AppointmentDetails() {
    return (
        <main className="page-content">

            {/* Cabeçalho da página. */}
            <PageHeader title="Detalhes do Agendamento">

                {/* Este botão ainda é apenas visual.
                    Depois poderá navegar para o calendário. */}
                <button
                    className="button button--outline"
                    type="button"
                >
                    Ver no calendário
                </button>
            </PageHeader>


            {/* Grade principal dividida entre os detalhes
                e o histórico do agendamento. */}
            <section className="appointment-details-grid">

                {/* Card com as informações do agendamento. */}
                <article className="panel appointment-card">

                    {/* Resumo principal do agendamento. */}
                    <div className="appointment-summary">

                        {/* Ícone visual do agendamento. */}
                        <div className="appointment-summary__icon">
                            ▣
                        </div>

                        {/* Horário e data. */}
                        <div className="appointment-summary__time">
                            <strong>09:30</strong>
                            <span>20/07/2026</span>
                        </div>

                        {/* Nome do fornecedor. */}
                        <strong className="appointment-summary__supplier">
                            Cristal Glass
                        </strong>

                        {/* Componente que mostra o status aprovado.
                            status é uma prop enviada para StatusBadge. */}
                        <StatusBadge status="approved" />
                    </div>


                    {/* Lista com as informações detalhadas.
                        dl representa uma lista de descrição.
                        dt é o nome do campo.
                        dd é o valor do campo. */}
                    <dl className="appointment-info">
                        <div>
                            <dt>Fornecedor</dt>
                            <dd>Cristal Glass</dd>
                        </div>

                        <div>
                            <dt>CNPJ</dt>
                            <dd>12.345.678/0001-90</dd>
                        </div>

                        <div>
                            <dt>Pedido</dt>
                            <dd>PC-000987/2026</dd>
                        </div>

                        <div>
                            <dt>Data</dt>
                            <dd>20/07/2026</dd>
                        </div>

                        <div>
                            <dt>Horário</dt>
                            <dd>09:30</dd>
                        </div>

                        <div>
                            <dt>Doca</dt>
                            <dd>Doca 01</dd>
                        </div>

                        <div>
                            <dt>Quantidade de volumes</dt>
                            <dd>42 volumes</dd>
                        </div>

                        <div>
                            <dt>Observações</dt>
                            <dd>Entregar no palete padrão.</dd>
                        </div>
                    </dl>


                    {/* Seção com todos os arquivos de notas fiscais.
                        Os três arquivos foram agrupados na mesma seção. */}
                    <section className="invoice-section">
                        <h3>Notas fiscais anexadas</h3>

                        <div className="invoice-grid">

                            {/* Primeiro arquivo anexado. */}
                            <article className="invoice-file">
                                <strong>▣ NF_001234567.pdf</strong>
                                <span>1.2 MB ↓</span>
                            </article>

                            {/* Segundo arquivo anexado. */}
                            <article className="invoice-file">
                                <strong>▣ NF_001234569.xml</strong>
                                <span>0.8 MB ↓</span>
                            </article>

                            {/* Terceiro arquivo anexado. */}
                            <article className="invoice-file">
                                <strong>▣ NF_001234568.pdf</strong>
                                <span>1.0 MB ↓</span>
                            </article>
                        </div>
                    </section>
                </article>


                {/* Card lateral com o histórico do agendamento. */}
                <article className="panel history-card">
                    <h2>Histórico</h2>

                    <div className="timeline">

                        {/* Percorre o array historyItems.
                            Para cada item, cria um registro na linha do tempo. */}
                        {historyItems.map((item) => (
                            <div
                                className="timeline-item"

                                // A key ajuda o React a identificar cada item.
                                key={item.title}
                            >
                                {/* A cor do ponto muda de acordo
                                    com o status do histórico. */}
                                <span
                                    className={
                                        `timeline-item__dot timeline-item__dot--${item.status}`
                                    }
                                />

                                {/* Título e data do histórico. */}
                                <div>
                                    <strong>{item.title}</strong>
                                    <span>{item.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>
            </section>


            {/* Área com as ações disponíveis para o agendamento. */}
            <div className="appointment-actions">

                {/* Futuramente iniciará o processo de recebimento. */}
                <button
                    className="button button--primary"
                    type="button"
                >
                    Iniciar recebimento
                </button>

                {/* Futuramente abrirá a solicitação de ajuste. */}
                <button
                    className="button button--warning"
                    type="button"
                >
                    Solicitar ajuste
                </button>

                {/* Futuramente cancelará o agendamento. */}
                <button
                    className="button button--danger"
                    type="button"
                >
                    Cancelar agendamento
                </button>
            </div>
        </main>
    )
}


// Exporta o componente para ser utilizado nas rotas.
export default AppointmentDetails