import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import { transporters } from "../data/transporters";

const calendarWeekDays = ["D", "S", "T", "Q", "Q", "S", "S"];
const julyCalendarCells = [
  null,
  null,
  null,
  ...Array.from({ length: 31 }, (_, index) => index + 1),
];
const availableTimes = [
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "12:30",
  "14:00",
  "15:30",
  "16:00",
];

function NewAppointment() {
  const navigate = useNavigate();

  // Estados que futuramente receberão dados da API e da tela de cadastro.
  const [selectedTransporterId, setSelectedTransporterId] = useState(
    transporters[0]?.id ?? "",
  );
  const [suppliers, setSuppliers] = useState([""]);
  const [volumeType, setVolumeType] = useState("Paletes");
  const [selectedDay, setSelectedDay] = useState(20);
  const [selectedTime, setSelectedTime] = useState("09:30");
  const [feedback, setFeedback] = useState("");

  function addSupplier() {
    setSuppliers((currentSuppliers) => [...currentSuppliers, ""]);
  }

  function updateSupplier(index, value) {
    setSuppliers((currentSuppliers) =>
      currentSuppliers.map((supplier, supplierIndex) =>
        supplierIndex === index ? value : supplier,
      ),
    );
  }

  function removeSupplier(index) {
    setSuppliers((currentSuppliers) =>
      currentSuppliers.filter((_, supplierIndex) => supplierIndex !== index),
    );
  }

  function submitAppointment(event) {
    event.preventDefault();
    setFeedback("Agendamento enviado para aprovação.");
  }

  return (
    <main className="page-content">
      <PageHeader
        title="Novo Agendamento"
        subtitle="Informe a carga, anexe os documentos e escolha a data ideal para a entrega."
      >
        <button
          className="button button--outline"
          type="button"
          onClick={() => navigate("/verificacao-agendamentos")}
        >
          <span aria-hidden="true">←</span>
          Voltar
        </button>
      </PageHeader>

      {/* Etapas do fluxo de criação do agendamento */}
      <ol className="transport-form-steps">
        <li className="is-active">1 Carga e transportadora</li>
        <li>2 Documentos fiscais</li>
        <li>3 Data e horário</li>
        <li>4 Revisão</li>
      </ol>

      <form
        className="panel transport-form transport-form--booking"
        onSubmit={submitAppointment}
      >
        <div className="transport-booking-grid">
          {/* Coluna 1: carga, transportadora e fornecedores */}
          <section className="transport-booking-column">
            <h2>Carga e transportadora</h2>

            <label className="transport-field">
              <span>Transportadora</span>
              <select
                value={selectedTransporterId}
                onChange={(event) =>
                  setSelectedTransporterId(event.target.value)
                }
                required
              >
                {transporters.map((transporter) => (
                  <option value={transporter.id} key={transporter.id}>
                    {transporter.name}
                  </option>
                ))}
              </select>
              <small className="transport-field__hint">
                Lista preparada para receber os cadastros do sistema.
              </small>
            </label>

            <div className="transport-compact-heading">
              <span>Fornecedores</span>
              <button
                className="button button--icon button--small"
                type="button"
                onClick={addSupplier}
                aria-label="Adicionar fornecedor"
                title="Adicionar fornecedor"
              >
                ＋
              </button>
            </div>

            <div className="transport-suppliers-list transport-suppliers-list--compact">
              {suppliers.map((supplier, index) => (
                <div key={index}>
                  <label className="transport-field">
                    <span>Fornecedor {index + 1}</span>
                    <input
                      type="text"
                      value={supplier}
                      onChange={(event) =>
                        updateSupplier(index, event.target.value)
                      }
                      placeholder="Digite o fornecedor"
                      required
                    />
                  </label>

                  {suppliers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSupplier(index)}
                      aria-label={`Remover fornecedor ${index + 1}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="transport-inline-fields">
              <label className="transport-field">
                <span>Quantidade</span>
                <input type="number" min="1" placeholder="Ex.: 42" required />
              </label>

              <label className="transport-field">
                <span>Placa</span>
                <input type="text" placeholder="ABC1D23" />
              </label>
            </div>

            <label className="transport-field">
              <span>Motorista</span>
              <input type="text" placeholder="Nome do motorista" />
            </label>

            <fieldset className="transport-volume-selector">
              <legend>Tipo de volume</legend>
              <div>
                {["Paletes", "Caixas", "Ambos"].map((type) => (
                  <label
                    className={volumeType === type ? "is-selected" : ""}
                    key={type}
                  >
                    <input
                      type="radio"
                      name="volume-type"
                      value={type}
                      checked={volumeType === type}
                      onChange={() => setVolumeType(type)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="transport-field">
              <span>Observações</span>
              <textarea
                rows="3"
                placeholder="Informe cuidados para o recebimento"
              />
            </label>
          </section>

          {/* Coluna 2: documentos fiscais e anexos */}
          <section className="transport-booking-column">
            <h2>Documentos fiscais</h2>

            <div className="transport-inline-fields">
              <label className="transport-field">
                <span>Tipo</span>
                <select defaultValue="CT-e">
                  <option>CT-e</option>
                  <option>MDF-e</option>
                </select>
              </label>

              <label className="transport-field">
                <span>Número</span>
                <input type="text" placeholder="000184" required />
              </label>
            </div>

            <label className="transport-field">
              <span>Chave do CT-e / MDF-e</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength="44"
                placeholder="Digite os 44 números"
              />
            </label>

            <label className="transport-upload transport-upload--compact">
              <span>Anexar CT-e / MDF-e</span>
              <strong>☁ Arraste ou selecione o XML/PDF</strong>
              <input type="file" accept=".xml,.pdf" />
            </label>

            <label className="transport-upload transport-upload--compact">
              <span>Anexar NF-e</span>
              <strong>☁ Selecione um ou mais arquivos</strong>
              <input type="file" accept=".xml,.pdf" multiple />
            </label>

            <div
              className="transport-file-example"
              aria-label="Exemplo de arquivo anexado"
            >
              <span>▤</span>
              <div>
                <strong>NF-e-0010458.xml</strong>
                <small>1,2 MB</small>
              </div>
            </div>
          </section>

          {/* Coluna 3: seleção visual da data */}
          <section className="transport-booking-column">
            <h2>Selecione a data</h2>

            <label className="transport-field">
              <span>Data desejada</span>
              <input
                type="date"
                value={`2026-07-${String(selectedDay).padStart(2, "0")}`}
                onChange={(event) => {
                  const day = Number(event.target.value.split("-")[2]);
                  if (day) setSelectedDay(day);
                }}
              />
            </label>

            <div
              className="booking-calendar"
              aria-label="Calendário de julho de 2026"
            >
              <header>
                <button type="button" aria-label="Mês anterior">
                  ‹
                </button>
                <strong>Julho 2026</strong>
                <button type="button" aria-label="Próximo mês">
                  ›
                </button>
              </header>

              <div className="booking-calendar__grid">
                {calendarWeekDays.map((day, index) => (
                  <span
                    className="booking-calendar__weekday"
                    key={`${day}-${index}`}
                  >
                    {day}
                  </span>
                ))}

                {julyCalendarCells.map((day, index) =>
                  day ? (
                    <button
                      className={selectedDay === day ? "is-selected" : ""}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      aria-pressed={selectedDay === day}
                      key={day}
                    >
                      {day}
                    </button>
                  ) : (
                    <span key={`empty-${index}`} />
                  ),
                )}
              </div>
            </div>
          </section>

          {/* Coluna 4: horários disponíveis */}
          <section className="transport-booking-column">
            <h2>Horários disponíveis</h2>

            <div className="booking-time-grid">
              {availableTimes.map((time) => (
                <button
                  className={selectedTime === time ? "is-selected" : ""}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  aria-pressed={selectedTime === time}
                  key={time}
                >
                  {time}
                </button>
              ))}
            </div>

            <div className="booking-selection-summary">
              <span>Entrega selecionada</span>
              <strong>{String(selectedDay).padStart(2, "0")}/07/2026</strong>
              <b>{selectedTime}</b>
            </div>
          </section>
        </div>

        <footer className="transport-form-footer">
          <span className="form-feedback" aria-live="polite">
            {feedback}
          </span>
          <button className="button button--primary" type="submit">
            Enviar para aprovação
          </button>
        </footer>
      </form>
    </main>
  );
}

export default NewAppointment;
