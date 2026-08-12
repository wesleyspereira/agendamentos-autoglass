import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useNavigate } from "react-router-dom";

import { transportAppointments } from "../data/transportAppointments";

const historyItems = [
  {
    id: 1,
    title: "Solicitado pela transportadora",
    date: "19/07/2026 · 14:32",
    tone: "blue",
  },
  {
    id: 2,
    title: "Documentos conferidos",
    date: "19/07/2026 · 15:20",
    tone: "green",
  },
  {
    id: 3,
    title: "Agendamento aprovado",
    date: "19/07/2026 · 16:45",
    tone: "green",
  },
  {
    id: 4,
    title: "Recebimento iniciado",
    date: "20/07/2026 · 08:02",
    tone: "blue",
  },
];

function AppointmentDetails() {
  const navigate = useNavigate();
  const appointment = transportAppointments[0];

  return (
    <main className="page-content">
      <PageHeader
        title="Detalhes do Agendamento"
        subtitle="Consulte os documentos, os dados da carga e o histórico desta entrega."
      >
        <button
          className="button button--outline"
          type="button"
          onClick={() => navigate("/calendario")}
        >
          <span aria-hidden="true">←</span>
          Voltar ao calendário
        </button>
      </PageHeader>

      <section className="transport-details-grid">
        <article className="panel transport-details-card">
          {/* Resumo e informações principais do agendamento */}
          <div className="transport-details-summary">
            <div className="transport-details-summary__icon">▣</div>
            <div>
              <strong>{appointment.time}</strong>
              <span>{appointment.date}</span>
            </div>
            <b>{appointment.carrier}</b>
            <StatusBadge status={appointment.status} />
          </div>

          <dl className="transport-details-list">
            <div>
              <dt>Transportadora</dt>
              <dd>{appointment.carrier}</dd>
            </div>
            <div>
              <dt>CNPJ</dt>
              <dd>{appointment.carrierCnpj}</dd>
            </div>
            <div>
              <dt>CT-e / MDF-e</dt>
              <dd>
                {appointment.documentType} {appointment.documentNumber}
              </dd>
            </div>
            <div className="transport-details-list__wide">
              <dt>Chave do CT-e / MDF-e</dt>
              <dd>{appointment.documentKey}</dd>
            </div>
            <div>
              <dt>Fornecedores</dt>
              <dd>{appointment.suppliers.join(", ")}</dd>
            </div>
            <div>
              <dt>Data e horário</dt>
              <dd>
                {appointment.date} às {appointment.time}
              </dd>
            </div>
            <div>
              <dt>Tipo de volume</dt>
              <dd>{appointment.volumeTypes.join(" + ")}</dd>
            </div>
            <div>
              <dt>Quantidade</dt>
              <dd>{appointment.volumes} volumes</dd>
            </div>
            <div>
              <dt>Placa do veículo</dt>
              <dd>{appointment.plate}</dd>
            </div>
            <div>
              <dt>Motorista</dt>
              <dd>{appointment.driver}</dd>
            </div>
          </dl>

          <section className="transport-documents">
            <h2>Documentos anexados</h2>
            <div>
              <button className="transport-document-card" type="button">
                <span
                  className="transport-document-card__icon"
                  aria-hidden="true"
                >
                  ▤
                </span>
                <span>
                  <strong>
                    {appointment.documentType} {appointment.documentNumber}.xml
                  </strong>
                  <small>1,2 MB · XML</small>
                </span>
              </button>
              {appointment.invoices.map((invoice, index) => (
                <button
                  className="transport-document-card"
                  type="button"
                  key={invoice}
                >
                  <span
                    className="transport-document-card__icon"
                    aria-hidden="true"
                  >
                    ▤
                  </span>
                  <span>
                    <strong>{invoice}.xml</strong>
                    <small>{index === 0 ? "1,0 MB" : "0,8 MB"} · XML</small>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div className="transport-details-actions">
            <button className="button button--primary" type="button">
              Iniciar recebimento
            </button>
            <button className="button button--warning" type="button">
              Solicitar ajuste
            </button>
            <button className="button button--danger" type="button">
              Cancelar agendamento
            </button>
          </div>
        </article>

        <aside className="panel transport-history-card">
          <h2>Histórico</h2>
          {/* Linha do tempo do processo de recebimento */}
          <ol className="transport-history-timeline">
            {historyItems.map((item) => (
              <li
                className={`transport-history-item transport-history-item--${item.tone}`}
                key={item.id}
              >
                <strong>{item.title}</strong>
                <span>{item.date}</span>
              </li>
            ))}
          </ol>
        </aside>
      </section>
    </main>
  );
}

export default AppointmentDetails;
