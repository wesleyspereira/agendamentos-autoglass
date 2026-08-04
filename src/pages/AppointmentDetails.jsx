import PageHeader from "../components/PageHeader"
import StatusBadge from "../components/StatusBadge"

function AppointmentDetails() {
    return (
        <main className="page-content">

            <PageHeader title="Detalhes do Agendamento">
                <button className="button button--outline" type="button">
                    Ver no calendário
                </button>
            </PageHeader>
            <section className="appointment-details-grid">
                <article className="panel appointment-card">
                    <div className="appointment-summary">
                        <div className="appointment-summary__icon">▣</div>

                        <div className="appointment-summary__time">
                            <strong>09:30</strong>
                            <span>20/07/2026</span>
                        </div>

                        <strong className="appointment-summary__supplier">
                            Cristal Glass
                        </strong>

                        <StatusBadge status="approved" />
                    </div>
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
                    <section className="invoice-section">
                        <h3>Notas fiscais anexadas</h3>

                        <div className="invoice-grid">
                            <article className="invoice-file">
                                <strong>▣ NF_001234567.pdf</strong>
                                <span>1.2 MB ↓</span>
                            </article>
                        </div>
                    </section>
                    <section className="invoice-section">
                        <h3>Notas fiscais anexadas</h3>

                        <div className="invoice-grid">
                            <article className="invoice-file">
                                <strong>▣ NF_001234569.xml</strong>
                                <span>0.8 MB ↓</span>
                            </article>
                        </div>
                    </section>
                    <section className="invoice-section">
                        <h3>Notas fiscais anexadas</h3>

                        <div className="invoice-grid">
                            <article className="invoice-file">
                                <strong>▣ NF_001234568.pdf</strong>
                                <span>1.0 MB ↓</span>
                            </article>
                        </div>
                    </section>
                </article>

                <article className="panel history-card">
                    <h2>Histórico</h2>
                </article>
            </section>
        </main>
    )
}

export default AppointmentDetails
