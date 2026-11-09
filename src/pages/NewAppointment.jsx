import { readFiscalDocument } from "../utils/fiscalDocuments";
import { cargoModes, cargoSummary, readCargo } from "../utils/cargo";
import "../styles/cargo-form.css";
import "../styles/booking-steps.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import CargoIcon from "../components/CargoIcon";
import PageHeader from "../components/PageHeader";
import { transporters } from "../data/transporters";
import { useAppointments } from "../context/useAppointments";
import { localDateKey } from "../utils/appointmentDates";
import { AVAILABLE_TIMES, slotStatus } from "../utils/appointmentSlots";

const steps = ["Carga e transportadora", "Documentos fiscais", "Data e horário", "Revisão"];
const calendarWeekDays = ["D", "S", "T", "Q", "Q", "S", "S"];
function formatDate(date) {
  return date.split("-").reverse().join("/");
}

function NewAppointment({ internal = false }) {
  const navigate = useNavigate();
  const { appointments, setAppointments } = useAppointments();
  const [step, setStep] = useState(1);
  const [review, setReview] = useState(null);
  const stepTitle = useRef(null);
  function goToStep(next, message = "") {
    setFeedback(message);
    setStep(next);
  }
  useEffect(() => {
    stepTitle.current?.focus();
  }, [step]);
  const submittedRef = useRef(false);
  const today = localDateKey(new Date());

  // Estados dos campos e da seleção de documentos.
  const [selectedTransporterId, setSelectedTransporterId] = useState(transporters[0]?.id ?? "");
  const [suppliers, setSuppliers] = useState([{ name: "", cnpj: "" }]);
  const [volumeType, setVolumeType] = useState("Palete");
  const activeFields = cargoModes[volumeType];
  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date();
    const lastTime = AVAILABLE_TIMES[AVAILABLE_TIMES.length - 1];
    if (slotStatus([], localDateKey(date), lastTime, date) === "past") {
      date.setDate(date.getDate() + 1);
    }
    return localDateKey(date);
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
    ...Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, index) => index + 1),
  ];
  const monthLabel = calendarMonth.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  function changeMonth(offset) {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
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
    // A revisão deve mostrar exatamente o horário que será enviado.
    if (step === 4) return;
    setSelectedTime((currentTime) => {
      if (slotStatus(appointments, selectedDate, currentTime) === "available") {
        return currentTime;
      }
      return (
        AVAILABLE_TIMES.find(
          (time) => slotStatus(appointments, selectedDate, time) === "available",
        ) ?? ""
      );
    });
  }, [appointments, selectedDate, step]);

  function addSupplier() {
    setSuppliers((currentSuppliers) => [...currentSuppliers, { name: "", cnpj: "" }]);
  }

  function updateSupplier(index, field, value) {
    setSuppliers((currentSuppliers) =>
      currentSuppliers.map((supplier, supplierIndex) =>
        supplierIndex === index ? { ...supplier, [field]: value } : supplier,
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
    const cleanedSuppliers = suppliers.map((supplier) => supplier.name.trim());
    if (!carrier || cleanedSuppliers.some((name) => !name)) {
      goToStep(1, "Preencha a transportadora e o nome de cada fornecedor.");
      return;
    }

    let cargo;
    try {
      cargo = readCargo(volumeType, formData);
    } catch (error) {
      goToStep(1, error.message);
      return;
    }
    if (step === 1) {
      goToStep(2);
      return;
    }

    let fiscal;
    try {
      fiscal = readFiscalDocument(formData);
    } catch (error) {
      goToStep(2, error.message);
      return;
    }
    if (step === 2) {
      goToStep(3);
      return;
    }

    if (
      !selectedDate ||
      !selectedTime ||
      slotStatus(appointments, selectedDate, selectedTime) !== "available"
    ) {
      goToStep(3, "Esse horário não está disponível. Escolha uma data e um horário livres.");
      return;
    }

    // Mantém o mesmo formato utilizado pelas outras telas do sistema.
    const newAppointment = {
      date: formatDate(selectedDate),
      dateISO: selectedDate,
      time: selectedTime,
      carrierId: carrier.id,
      carrier: carrier.name,
      carrierCnpj: carrier.cnpj,
      suppliers: cleanedSuppliers,
      ...(internal && {
        supplierDetails: suppliers.map(({ name, cnpj }) => ({
          name: name.trim(),
          cnpj: cnpj.trim(),
        })),
      }),
      ...fiscal,
      invoices: invoiceFiles.map((file) => file.name),
      documentFiles: documentFiles.map((file) => ({ name: file.name, size: file.size })),
      cargo,
      volumeTypes:
        volumeType === "Ambos"
          ? ["Paletes", "Caixas"]
          : [volumeType === "Palete" ? "Paletes" : volumeType],
      ...(cargo.pallets || cargo.boxes
        ? { volumes: (cargo.pallets || 0) + (cargo.boxes || 0) }
        : {}),
      plate: String(formData.get("plate") || "")
        .trim()
        .toUpperCase(),
      driver: String(formData.get("driver") || "").trim(),
      observations: String(formData.get("observations") || "").trim(),
      status: "pending",
      verified: false,
    };

    if (step === 3) {
      setReview(newAppointment);
      goToStep(4);
      return;
    }
    const confirmed = { ...review, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    // O contexto salva a lista no navegador; a aprovação já usa essa mesma lista.
    submittedRef.current = true;
    setAppointments((currentAppointments) => [confirmed, ...currentAppointments]);
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
          Sair do formulário
        </button>
      </PageHeader>

      {/* Etapas do fluxo de criação do agendamento */}
      <ol className="transport-form-steps">
        {steps.map((label, index) => (
          <li
            key={label}
            aria-current={step === index + 1 ? "step" : undefined}
            className={step === index + 1 ? "is-active" : ""}
          >
            {index + 1} {label}
          </li>
        ))}
      </ol>

      <form
        className="panel transport-form transport-form--booking"
        noValidate
        onSubmit={submitAppointment}
      >
        <header className="booking-step-title">
          <small>
            ETAPA {step} DE {steps.length}
          </small>
          <h2 ref={stepTitle} tabIndex={-1}>
            {steps[step - 1]}
          </h2>
        </header>
        <div className={`cargo-booking booking-step-body booking-step-${step}`}>
          {/* Coluna 1: carga, transportadora e fornecedores */}
          <section hidden={step !== 1} className="transport-booking-column">
            <h2 className="cargo-title">
              <small>01</small> Identificação do transporte
            </h2>

            <label className="transport-field">
              <span>Transportadora</span>
              <select
                value={selectedTransporterId}
                onChange={(event) => setSelectedTransporterId(event.target.value)}
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

            <div className="cargo-pair">
              <label className="transport-field">
                <span>Motorista</span>
                <input name="driver" placeholder="Nome do motorista" />
              </label>
              <label className="transport-field">
                <span>Placa</span>
                <input name="plate" placeholder="ABC1D23" />
              </label>
            </div>
            <div className="cargo-heading">
              <h2 className="cargo-title">
                <small>02</small> Fornecedores
              </h2>
              <button type="button" onClick={addSupplier}>
                + Adicionar fornecedor
              </button>
            </div>
            {suppliers.map((supplier, index) => (
              <div key={index} className="cargo-supplier">
                {internal && (
                  <label className="transport-field">
                    <span>CNPJ</span>
                    <input
                      value={supplier.cnpj}
                      onChange={(e) => updateSupplier(index, "cnpj", e.target.value)}
                      placeholder="00.000.000/0000-00"
                    />
                  </label>
                )}
                <label className="transport-field">
                  <span>Fornecedor</span>
                  <input
                    value={supplier.name}
                    onChange={(e) => updateSupplier(index, "name", e.target.value)}
                    placeholder="Nome do fornecedor"
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
            <div className="cargo-heading">
              <h2 className="cargo-title">
                <small>03</small> Composição da carga
              </h2>
            </div>
            <fieldset className="cargo-modes">
              <legend>Tipo de volume</legend>
              <div>
                {Object.keys(cargoModes).map((mode) => (
                  <label key={mode}>
                    <input
                      type="radio"
                      name="volumeType"
                      value={mode}
                      checked={volumeType === mode}
                      onChange={() => {
                        setVolumeType(mode);
                        setFeedback("");
                      }}
                    />
                    <span>
                      <CargoIcon mode={mode} />
                      {mode}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="cargo-quantities">
              {activeFields.includes("pallets") && (
                <label key="pallets" className="transport-field">
                  <span>Quantidade de paletes</span>
                  <input name="pallets" type="number" min="1" step="1" required />
                </label>
              )}
              {activeFields.includes("boxes") && (
                <label key="boxes" className="transport-field">
                  <span>Quantidade de caixas</span>
                  <input name="boxes" type="number" min="1" step="1" required />
                </label>
              )}
              {activeFields.includes("cubicMeters") && (
                <label key="cubicMeters" className="transport-field cargo-meter">
                  <span>Metragem da carga</span>
                  <span className="cargo-meter-input">
                    <input
                      name="cubicMeters"
                      aria-label="Metragem da carga em metros cúbicos"
                      inputMode="decimal"
                      placeholder="Ex.: 42,50"
                      required
                    />
                    <b aria-hidden="true">m³ (metros cúbicos)</b>
                  </span>
                </label>
              )}
            </div>

            <label className="transport-field">
              <span>Observações (opcional)</span>
              <textarea
                name="observations"
                rows="3"
                placeholder="Informe cuidados para o recebimento"
              />
            </label>
          </section>

          {/* Coluna 2: documentos fiscais e anexos */}
          <section hidden={step !== 2} className="transport-booking-column">
            <p>Identifique o documento de transporte e selecione os arquivos da entrega.</p>

            <div className="transport-inline-fields">
              <label className="transport-field">
                <span>Tipo de documento</span>
                <select name="documentType" defaultValue="CT-e">
                  <option>CT-e</option>
                  <option>MDF-e</option>
                </select>
              </label>

              <label className="transport-field">
                <span>Número do documento</span>
                <input name="documentNumber" type="text" placeholder="000184" required />
              </label>
            </div>

            <label className="transport-field">
              <span>Chave de acesso (opcional)</span>
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
              <input
                type="file"
                accept=".xml,.pdf"
                onChange={(event) => setDocumentFiles(Array.from(event.target.files || []))}
              />
            </label>

            <label className="transport-upload transport-upload--compact">
              <span>Anexar NF-e</span>
              <strong>☁ Selecione um ou mais arquivos</strong>
              <input
                type="file"
                accept=".xml,.pdf"
                multiple
                onChange={(event) => setInvoiceFiles(Array.from(event.target.files || []))}
              />
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
              Nesta versão de demonstração, apenas os nomes dos documentos são registrados. Os
              arquivos não são enviados nem armazenados.
            </p>
          </section>

          {/* Coluna 3: seleção visual da data */}
          <section hidden={step !== 3} className="transport-booking-column">
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

            <div className="booking-calendar" aria-label={`Calendário de ${monthLabel}`}>
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
                  <span className="booking-calendar__weekday" key={`${day}-${index}`}>
                    {day}
                  </span>
                ))}

                {calendarCells.map((day, index) => {
                  if (!day) return <span key={`empty-${index}`} />;
                  const date = localDateKey(new Date(year, month, day));
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
          <section hidden={step !== 3} className="transport-booking-column">
            <h2>Horários disponíveis</h2>

            <div className="booking-time-grid">
              {statuses.map(({ time, status }) => (
                <button
                  className={`${selectedTime === time && status === "available" ? "is-selected" : ""} ${status === "occupied" ? "is-occupied" : ""}`.trim()}
                  type="button"
                  onClick={() => {
                    setSelectedTime(time);
                    setFeedback("");
                  }}
                  aria-pressed={selectedTime === time && status === "available"}
                  aria-label={`${time} - ${status === "occupied" ? "Ocupado" : status === "past" ? "Horário encerrado" : "Disponível"}`}
                  title={
                    status === "occupied"
                      ? "Já existe uma entrega neste horário"
                      : status === "past"
                        ? "Horário já passou"
                        : "Disponível"
                  }
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
          {step === 4 && review && (
            <section className="booking-review">
              <p>Confira os dados antes de enviar o agendamento para aprovação.</p>
              <dl>
                {[
                  ["Transportadora", review.carrier],
                  ["Motorista / placa", [review.driver, review.plate].filter(Boolean).join(" · ")],
                  ["Fornecedores", review.suppliers.join(", ")],
                  ["Carga", cargoSummary(review)],
                  ["Observações", review.observations],
                  ["Documento fiscal", review.documentType + " " + review.documentNumber],
                  ["Chave de acesso", review.documentKey],
                  ["Anexos de transporte", review.documentFiles.map((f) => f.name).join(", ")],
                  ["Notas fiscais", review.invoices.join(", ")],
                  ["Entrega", review.date + " às " + review.time],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value || "Não informado"}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>

        <footer className="transport-form-footer">
          <span className="form-feedback" aria-live="polite">
            {feedback}
          </span>
          {step > 1 && (
            <button
              className="button button--outline"
              type="button"
              onClick={() => goToStep(step - 1)}
            >
              Voltar
            </button>
          )}
          <button
            className="button button--primary"
            type="submit"
            disabled={step === 3 && !selectedTimeValid}
          >
            {
              [
                "Continuar para documentos",
                "Continuar para data e horário",
                "Revisar agendamento",
                "Enviar para aprovação",
              ][step - 1]
            }
          </button>
        </footer>
      </form>
    </main>
  );
}

export default NewAppointment;
