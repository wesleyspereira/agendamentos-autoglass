import FiscalFileField from "../components/FiscalFileField";
import { readRegistry, findSupplier, normalizeCnpj } from "../utils/registry";
import { validateFiscalFiles } from "../utils/fiscalDocuments";
import { storeFiscalFiles } from "../utils/fiscalStorage";
import "../styles/registrations.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import SupplierCargoCard from "../components/SupplierCargoCard";

import { useAppointments } from "../context/useAppointments";
import { transporters } from "../data/transporters";

import { localDateKey } from "../utils/appointmentDates";
import { AVAILABLE_TIMES, slotStatus } from "../utils/appointmentSlots";
import { cargoSummary } from "../utils/cargo";
import { createSupplier, readSupplier, sumSupplierCargo } from "../utils/supplierCargo";

import "../styles/cargo-form.css";
import "../styles/booking-steps.css";

const steps = ["Carga e transportadora", "Documentos fiscais", "Data e horário", "Revisão"];

const calendarWeekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

function formatDate(date) {
  return date.split("-").reverse().join("/");
}

function NewAppointment() {
  const navigate = useNavigate();
  const { appointments, setAppointments } = useAppointments();

  const stepTitle = useRef(null);
  const submittedRef = useRef(false);
  const [saving, setSaving] = useState(false);

  const [step, setStep] = useState(1);
  const [review, setReview] = useState(null);
  const [feedback, setFeedback] = useState("");

  const [selectedTransporterId, setSelectedTransporterId] = useState(transporters[0]?.id ?? "");

  // Cada fornecedor possui identificação, tipo de volume e quantidades.
  const [suppliers, setSuppliers] = useState(() => [createSupplier()]);

  const [expandedIds, setExpandedIds] = useState(() => [suppliers[0].id]);

  const [supplierErrors, setSupplierErrors] = useState({});

  const [documentFiles, setDocumentFiles] = useState([]);
  const [invoiceFiles, setInvoiceFiles] = useState([]);

  const today = localDateKey(new Date());

  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date();
    const lastTime = AVAILABLE_TIMES[AVAILABLE_TIMES.length - 1];

    // Se os horários de hoje terminaram, começa no próximo dia.
    if (slotStatus([], localDateKey(date), lastTime, date) === "past") {
      date.setDate(date.getDate() + 1);
    }

    return localDateKey(date);
  });

  const [selectedTime, setSelectedTime] = useState("09:30");

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const [year, month] = selectedDate.split("-").map(Number);
    return new Date(year, month - 1, 1);
  });

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

  const statuses = AVAILABLE_TIMES.map((time) => ({
    time,
    status: slotStatus(appointments, selectedDate, time),
  }));

  const freeCount = statuses.filter((item) => item.status === "available").length;

  const selectedTimeValid = statuses.some(
    (item) => item.time === selectedTime && item.status === "available",
  );

  useEffect(() => {
    stepTitle.current?.focus();
  }, [step]);

  useEffect(() => {
    // Na revisão, mantém o horário que o usuário acabou de conferir.
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

  function goToStep(next, message = "") {
    setFeedback(message);
    setStep(next);
  }

  function changeMonth(offset) {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function changeDate(value) {
    setSelectedDate(value);
    setFeedback("");

    if (value) {
      const [nextYear, nextMonth] = value.split("-").map(Number);
      setCalendarMonth(new Date(nextYear, nextMonth - 1, 1));
    }
  }

  function addSupplier() {
    const supplier = createSupplier();

    setSuppliers((current) => [...current, supplier]);

    // Abre o novo fornecedor e recolhe os anteriores sem apagar os dados.
    setExpandedIds([supplier.id]);
  }

  function updateSupplier(id, field, value) {
    let matched;
    if (field === "cnpj") {
      try {
        matched = findSupplier(readRegistry().suppliers, value);
      } catch {
        setFeedback("Não foi possível consultar os fornecedores.");
        return;
      }
    }
    setSuppliers((current) =>
      current.map((supplier) =>
        supplier.id === id
          ? { ...supplier, [field]: value, ...(field === "cnpj" && { name: matched?.name || "" }) }
          : supplier,
      ),
    );

    setSupplierErrors((current) => ({
      ...current,
      [id]: "",
    }));

    setFeedback("");
  }

  function toggleSupplier(id) {
    setExpandedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  function removeSupplier(id) {
    // O agendamento precisa ter pelo menos um fornecedor.
    if (suppliers.length === 1) return;

    const remaining = suppliers.filter((supplier) => supplier.id !== id);

    setSuppliers(remaining);

    setExpandedIds((current) => {
      const visible = current.filter((value) => value !== id);

      return visible.length ? visible : [remaining[0].id];
    });

    setSupplierErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  async function submitAppointment(event) {
    event.preventDefault();

    if (submittedRef.current) return;

    const formData = new FormData(event.currentTarget);

    const carrier = transporters.find((item) => item.id === selectedTransporterId);

    if (!carrier) {
      goToStep(1, "Selecione a transportadora.");
      return;
    }

    const supplierDetails = [];
    const errors = {};

    // Valida os dados de todos os fornecedores, inclusive os recolhidos.
    for (const supplier of suppliers) {
      try {
        const registered = findSupplier(readRegistry().suppliers, supplier.cnpj);
        if (!registered)
          throw new Error(
            "CNPJ não cadastrado. Confira o número ou solicite o cadastro do fornecedor.",
          );
        supplierDetails.push({
          ...readSupplier(
            { ...supplier, name: registered.name, cnpj: normalizeCnpj(supplier.cnpj) },
            true,
          ),
          supplierId: registered.id,
        });
      } catch (error) {
        errors[supplier.id] = error.message;
      }
    }

    setSupplierErrors(errors);

    if (Object.keys(errors).length) {
      // Abre os painéis com erro para facilitar a correção.
      setExpandedIds(Object.keys(errors));

      goToStep(1, "Revise os fornecedores destacados antes de continuar.");

      return;
    }

    let totals;

    try {
      totals = sumSupplierCargo(supplierDetails);
    } catch (error) {
      goToStep(1, error.message);
      return;
    }

    const { cargo, volumeTypes } = totals;

    if (step === 1) {
      goToStep(2);
      return;
    }

    try {
      validateFiscalFiles(invoiceFiles, documentFiles);
    } catch (error) {
      goToStep(2, error.message);
      return;
    }

    if (step === 2) {
      goToStep(3);
      return;
    }

    // Confere novamente a disponibilidade antes de revisar ou enviar.
    if (
      !selectedDate ||
      !selectedTime ||
      slotStatus(appointments, selectedDate, selectedTime) !== "available"
    ) {
      goToStep(3, "Esse horário não está disponível. Escolha uma data e um horário livres.");

      return;
    }

    const newAppointment = {
      date: formatDate(selectedDate),
      dateISO: selectedDate,
      time: selectedTime,

      carrierId: carrier.id,
      carrier: carrier.name,
      carrierCnpj: carrier.cnpj,

      // Preserva a lista de nomes utilizada pelas outras telas.
      suppliers: supplierDetails.map((supplier) => supplier.name),

      // Guarda a composição individual de cada fornecedor.
      supplierDetails,

      invoices: invoiceFiles.map((file) => file.name),

      documentFiles: documentFiles.map((file) => ({
        name: file.name,
        size: file.size,
      })),

      cargo,
      volumeTypes,

      ...(cargo.pallets || cargo.boxes
        ? {
            volumes: (cargo.pallets || 0) + (cargo.boxes || 0),
          }
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

    if (!review) {
      goToStep(3, "Revise o agendamento antes de enviar.");
      return;
    }

    const confirmed = {
      ...review,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    // Impede que cliques repetidos criem a mesma entrega duas vezes.
    submittedRef.current = true;

    setSaving(true);
    try {
      confirmed.fiscalAttachments = await storeFiscalFiles(invoiceFiles, documentFiles);
    } catch {
      submittedRef.current = false;
      setSaving(false);
      goToStep(
        2,
        "Não foi possível guardar os anexos neste navegador. Confira o espaço disponível e tente novamente.",
      );
      return;
    }
    setAppointments((current) => [confirmed, ...current]);

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
          {/* Etapa 1: transporte e carga por fornecedor. */}
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
              <SupplierCargoCard
                key={supplier.id}
                supplier={supplier}
                index={index}
                expanded={expandedIds.includes(supplier.id)}
                onToggle={() => toggleSupplier(supplier.id)}
                onChange={(field, value) => updateSupplier(supplier.id, field, value)}
                onRemove={suppliers.length > 1 ? () => removeSupplier(supplier.id) : undefined}
                error={supplierErrors[supplier.id]}
              />
            ))}

            <label className="transport-field">
              <span>Observações (opcional)</span>

              <textarea
                name="observations"
                rows="3"
                placeholder="Informe cuidados para o recebimento"
              />
            </label>
          </section>

          <section hidden={step !== 2} className="transport-booking-column">
            <div className="fiscal-file-grid">
              <FiscalFileField
                title="Notas fiscais (obrigatório)"
                files={invoiceFiles}
                setFiles={setInvoiceFiles}
                onError={setFeedback}
              />
              <FiscalFileField
                title="CT-e (opcional)"
                files={documentFiles}
                setFiles={setDocumentFiles}
                onError={setFeedback}
              />
            </div>
            <small className="transport-field__hint">
              Anexe pelo menos uma nota fiscal. Os arquivos ficam neste navegador.
            </small>
          </section>

          {/* Etapa 3: data da entrega. */}
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
                  if (!day) {
                    return <span key={`empty-${index}`} />;
                  }

                  const date = localDateKey(new Date(year, month, day));

                  return (
                    <button
                      key={date}
                      className={selectedDate === date ? "is-selected" : ""}
                      type="button"
                      onClick={() => changeDate(date)}
                      aria-pressed={selectedDate === date}
                      aria-label={formatDate(date)}
                      disabled={date < today}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Etapa 3: horário da entrega. */}
          <section hidden={step !== 3} className="transport-booking-column">
            <h2>Horários disponíveis</h2>

            <div className="booking-time-grid">
              {statuses.map(({ time, status }) => {
                const selected = selectedTime === time && status === "available";

                const statusLabel =
                  status === "occupied"
                    ? "Ocupado"
                    : status === "past"
                      ? "Horário encerrado"
                      : status === "available"
                        ? "Disponível"
                        : "Indisponível";

                return (
                  <button
                    key={time}
                    className={[
                      selected ? "is-selected" : "",
                      status === "occupied" ? "is-occupied" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    type="button"
                    onClick={() => {
                      setSelectedTime(time);
                      setFeedback("");
                    }}
                    aria-pressed={selected}
                    aria-label={`${time} - ${statusLabel}`}
                    title={statusLabel}
                    disabled={status !== "available"}
                  >
                    <span>{time}</span>

                    {status === "occupied" && <small>Ocupado</small>}

                    {status === "past" && <small>Encerrado</small>}
                  </button>
                );
              })}
            </div>

            <p className="booking-slots-counter" aria-live="polite">
              {freeCount > 0
                ? `${freeCount} ${
                    freeCount === 1 ? "horário disponível" : "horários disponíveis"
                  } nesta data.`
                : "Não há horários livres nesta data. Selecione outro dia."}
            </p>

            <div className="booking-selection-summary">
              <span>Entrega selecionada</span>

              <strong>{selectedDate ? formatDate(selectedDate) : "Selecione uma data"}</strong>

              <b>{selectedTimeValid ? selectedTime : "Sem horário"}</b>
            </div>
          </section>

          {/* Etapa 4: total da entrega e carga de cada fornecedor. */}
          {step === 4 && review && (
            <section className="booking-review">
              <p>Confira os dados antes de enviar o agendamento para aprovação.</p>

              <dl>
                {[
                  ["Transportadora", review.carrier],
                  ["Motorista / placa", [review.driver, review.plate].filter(Boolean).join(" · ")],
                  ["Fornecedores", review.suppliers.join(", ")],
                  ["Total da carga", cargoSummary(review)],

                  ...review.supplierDetails.map((supplier, index) => [
                    `Carga do fornecedor ${index + 1}`,
                    `${supplier.name} · ${cargoSummary(supplier)}`,
                  ]),

                  ["Observações", review.observations],
                  ["CT-e anexados", review.documentFiles.map((file) => file.name).join(", ")],
                  ["Notas fiscais", review.invoices.join(", ")],
                  ["Entrega", `${review.date} às ${review.time}`],
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
              disabled={saving}
              onClick={() => goToStep(step - 1)}
            >
              Voltar
            </button>
          )}

          <button
            className="button button--primary"
            type="submit"
            disabled={saving || (step === 3 && !selectedTimeValid)}
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
