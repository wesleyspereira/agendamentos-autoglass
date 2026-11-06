import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import { transporters } from "../data/transporters";
import { useAppointments } from "../context/AppointmentsContext";
import { AVAILABLE_TIMES, findSlotConflict, slotStatus } from "../utils/appointmentSlots";

const calendarWeekDays = ["D", "S", "T", "Q", "Q", "S", "S"];
// Usa a data local para evitar diferenças de dia causadas pelo fuso horário.
function toLocalDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDate(date) {
  return date.split("-").reverse().join("/");
}

function NewAppointment() {
  const navigate = useNavigate();
  const { appointments, setAppointments } = useAppointments();
  const submittedRef = useRef(false);
  const today = toLocalDate(new Date());

  // Estados dos campos e da seleção de documentos.
  const [selectedTransporterId, setSelectedTransporterId] = useState(
    transporters[0]?.id ?? "",
  );
  const [suppliers, setSuppliers] = useState([""]);
  const [volumeType, setVolumeType] = useState("Paletes");
  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date();
    const lastTime = AVAILABLE_TIMES[AVAILABLE_TIMES.length - 1];
    if (slotStatus([], toLocalDate(date), lastTime, date) === "past") {
      date.setDate(date.getDate() + 1);
    }
    return toLocalDate(date);
  });
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const [year, month] = selectedDate.split("-").map(Number);
    return new Date(year, month - 1, 1);
  });
  const [documentFiles, setDocumentFiles] = useState([]);
  const [invoiceFiles, setInvoiceFiles] = useState([]);

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const calendarCells = [
    ...Array(calendarMonth.getDay()).fill(null),
    ...Array.from(
      { length: new Date(year, month + 1, 0).getDate() },
      (_, index) => index + 1
    ),
  ];
  const monthLabel = calendarMonth.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  function changeMonth(offset) {
    setCalendarMonth((current) =>
      new Date(current.getFullYear(), current.getMonth() + offset, 1)
    );
  }

  function changeDate(value) {
    setSelectedDate(value);
    if (value) {
      const [nextYear, nextMonth] = value.split("-").map(Number);
      setCalendarMonth(new Date(nextYear, nextMonth - 1, 1));
    }
  }
  const [selectedTime, setSelectedTime] = useState("09:30");
  const [feedback, setFeedback] = useState("");

  // Atualiza os horários quando a data ou os agendamentos mudam.
  const statuses = AVAILABLE_TIMES.map((time) => ({
    time,
    status: slotStatus(appointments, selectedDate, time),
  }));
  const freeCount = statuses.filter((item) => item.status === "available").length;
  const selectedTimeValid = statuses.some(
    (item) => item.time === selectedTime && item.status === "available",
  );

  useEffect(() => {
    setSelectedTime((currentTime) => {
      if (slotStatus(appointments, selectedDate, currentTime) === "available") {
        return currentTime;
      }
      return AVAILABLE_TIMES.find(
        (time) => slotStatus(appointments, selectedDate, time) === "available",
      ) ?? "";
    });
  }, [appointments, selectedDate]);

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
    if (submittedRef.current) return;
    const formData = new FormData(event.currentTarget);
    const carrier = transporters.find((item) => item.id === selectedTransporterId);
    const cleanedSuppliers = suppliers.map((supplier) => supplier.trim());
    const documentNumber = String(formData.get("documentNumber") || "").trim();
    const quantity = Number(formData.get("volumes"));
    const documentKey = String(formData.get("documentKey") || "").trim();

    if (!carrier || !documentNumber || cleanedSuppliers.some((supplier) => !supplier)) {
      setFeedback("Preencha a transportadora, os fornecedores e o número do documento.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      setFeedback("Informe uma quantidade inteira de volumes maior que zero.");
      return;
    }

    if (!selectedDate || !selectedTime || slotStatus(appointments, selectedDate, selectedTime) !== "available") {
      setFeedback("Esse horário não está disponível. Escolha outra data ou horário livre.");
      return;
    }

    // Verificação extra antes de salvar para impedir agendamentos duplicados.
    if (findSlotConflict(appointments, selectedDate, selectedTime)) {
      setFeedback("Já existe um agendamento para esta data e horário.");
      return;
    }

    if (documentKey && !/^\d{44}$/.test(documentKey)) {
      setFeedback("A chave deve conter exatamente 44 números, ou ficar em branco.");
      return;
    }

    // Mantém o mesmo formato utilizado pelas outras telas do sistema.
    const newAppointment = {
      id: crypto.randomUUID(),
      date: formatDate(selectedDate),
      dateISO: selectedDate,
      time: selectedTime,
      carrierId: carrier.id,
      carrier: carrier.name,
      carrierCnpj: carrier.cnpj,
      suppliers: cleanedSuppliers,
      documentType: String(formData.get("documentType")),
      documentNumber,
      documentKey,
      invoices: invoiceFiles.map((file) => file.name),
      documentFiles: documentFiles.map((file) => ({ name: file.name, size: file.size })),
      volumeTypes: volumeType === "Ambos" ? ["Paletes", "Caixas"] : [volumeType],
      volumes: quantity,
      plate: String(formData.get("plate") || "").trim().toUpperCase(),
      driver: String(formData.get("driver") || "").trim(),
      observations: String(formData.get("observations") || "").trim(),
      status: "pending",
      verified: false,
      createdAt: new Date().toISOString(),
    };

    // O contexto salva a lista no navegador; a aprovação já usa essa mesma lista.
    submittedRef.current = true;
    setAppointments((currentAppointments) => [newAppointment, ...currentAppointments]);
    navigate("/aprovacao-agendamentos");
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
                Selecione a transportadora responsável pela entrega.
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
                <input name="volumes" type="number" min="1" step="1" placeholder="Ex.: 42" required />
              </label>

              <label className="transport-field">
                <span>Placa</span>
                <input name="plate" type="text" placeholder="ABC1D23" />
              </label>
            </div>

            <label className="transport-field">
              <span>Motorista</span>
              <input name="driver" type="text" placeholder="Nome do motorista" />
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
                name="observations"
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
                <select name="documentType" defaultValue="CT-e">
                  <option>CT-e</option>
                  <option>MDF-e</option>
                </select>
              </label>

              <label className="transport-field">
                <span>Número</span>
                <input name="documentNumber" type="text" placeholder="000184" required />
              </label>
            </div>

            <label className="transport-field">
              <span>Chave do CT-e / MDF-e</span>
              <input
                type="text"
                name="documentKey"
                inputMode="numeric"
                pattern="[0-9]{44}"
                title="Informe exatamente 44 números ou deixe em branco."
                maxLength="44"
                placeholder="Digite os 44 números"
              />
            </label>

            <label className="transport-upload transport-upload--compact">
              <span>Anexar CT-e / MDF-e</span>
              <strong>☁ Selecione o XML/PDF</strong>
              <input type="file" accept=".xml,.pdf" onChange={(event) => setDocumentFiles(Array.from(event.target.files || []))} />
            </label>

            <label className="transport-upload transport-upload--compact">
              <span>Anexar NF-e</span>
              <strong>☁ Selecione um ou mais arquivos</strong>
              <input type="file" accept=".xml,.pdf" multiple onChange={(event) => setInvoiceFiles(Array.from(event.target.files || []))} />
            </label>

            {[...documentFiles, ...invoiceFiles].map((file, index) => (
              <div className="transport-file-example" key={`${file.name}-${index}`}>
                <span aria-hidden="true">▤</span>
                <div>
                  <strong>{file.name}</strong>
                  <small>{(file.size / 1024).toFixed(1)} KB</small>
                </div>
              </div>
            ))}
            <p className="transport-field__hint">
              Nesta versão de demonstração, apenas os nomes dos documentos são
              registrados. Os arquivos não são enviados nem armazenados.
            </p>
          </section>

          {/* Coluna 3: seleção visual da data */}
          <section className="transport-booking-column">
            <h2>Selecione a data</h2>

            <label className="transport-field">
              <span>Data desejada</span>
              <input
                type="date"
                value={selectedDate}
                min={today}
                required
                onChange={(event) => changeDate(event.target.value)}
              />
            </label>

            <div
              className="booking-calendar"
              aria-label={`Calendário de ${monthLabel}`}
            >
              <header>
                <button type="button" aria-label="Mês anterior" onClick={() => changeMonth(-1)}>
                  ‹
                </button>
                <strong>{monthLabel}</strong>
                <button type="button" aria-label="Próximo mês" onClick={() => changeMonth(1)}>
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

                {calendarCells.map((day, index) => {
                  if (!day) return <span key={`empty-${index}`} />;
                  const date = toLocalDate(new Date(year, month, day));
                  return (
                    <button
                      className={selectedDate === date ? "is-selected" : ""}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      aria-pressed={selectedDate === date}
                      aria-label={formatDate(date)}
                      disabled={date < today}
                      key={date}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Coluna 4: horários disponíveis */}
          <section className="transport-booking-column">
            <h2>Horários disponíveis</h2>

            <div className="booking-time-grid">
              {statuses.map(({ time, status }) => (
                <button
                  className={`${selectedTime === time && status === "available" ? "is-selected" : ""} ${status === "occupied" ? "is-occupied" : ""}`.trim()}
                  type="button"
                  onClick={() => { setSelectedTime(time); setFeedback(""); }}
                  aria-pressed={selectedTime === time && status === "available"}
                  aria-label={`${time} - ${status === "occupied" ? "Ocupado" : status === "past" ? "Horário encerrado" : "Disponível"}`}
                  title={status === "occupied" ? "Já existe uma entrega neste horário" : status === "past" ? "Horário já passou" : "Disponível"}
                  disabled={status !== "available"}
                  key={time}
                >
                  <span>{time}</span>
                  {status === "occupied" && <small>Ocupado</small>}
                  {status === "past" && <small>Encerrado</small>}
                </button>
              ))}
            </div>

            <p className="booking-slots-counter" aria-live="polite">
              {freeCount > 0
                ? `${freeCount} ${freeCount === 1 ? "horário disponível" : "horários disponíveis"} nesta data.`
                : "Não há horários livres nesta data. Selecione outro dia."}
            </p>

            <div className="booking-selection-summary">
              <span>Entrega selecionada</span>
              <strong>{selectedDate ? formatDate(selectedDate) : "Selecione uma data"}</strong>
              <b>{selectedTimeValid ? selectedTime : "Sem horário"}</b>
            </div>
          </section>
        </div>

        <footer className="transport-form-footer">
          <span className="form-feedback" aria-live="polite">
            {feedback}
          </span>
          <button className="button button--primary" type="submit" disabled={!selectedTimeValid}>
            Enviar para aprovação
          </button>
        </footer>
      </form>
    </main>
  );
}

export default NewAppointment;
