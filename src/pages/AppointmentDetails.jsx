import { OPENED } from "../utils/deliveryIssues";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useAppointments } from "../context/useAppointments";
import { appointmentDateKey } from "../utils/appointmentDates";
import { cargoSummary } from "../utils/cargo";
import { canReschedule } from "../utils/rescheduleAppointment";

import "../styles/calendar-updates.css";
import "../styles/operation.css";

// Datas ausentes em registros antigos ficam em branco; não usamos a data prevista como se fosse real.
function flowFor(item) {
  const log = item.history || [];
  const last = (name) =>
    log
      .slice()
      .reverse()
      .find((entry) => entry.title === name)?.at;
  const { status, gateEntryAt, shipment } = item;
  const approved = ["approved", "progress", "completed"].includes(status);
  const started = status === "progress" || status === "completed";
  const complete = status === "completed";
  const waiting = "Pendente";
  return [
    ["Entrega cadastrada", "Concluída", item.createdAt],
    [
      "Agendamento aprovado",
      approved ? "Concluída" : status === "rejected" ? "Recusada" : "Em análise",
      approved
        ? last("Agendamento aprovado")
        : status === "rejected"
          ? last("Agendamento recusado")
          : null,
    ],
    [
      "Entrada na portaria",
      started
        ? "Concluída"
        : gateEntryAt
          ? "Na portaria"
          : approved
            ? "Aguardando chegada"
            : waiting,
      gateEntryAt,
    ],
    [
      "Recebimento",
      complete ? "Concluída" : started ? "Em andamento" : waiting,
      complete ? last("Recebimento concluído") : started ? last("Recebimento iniciado") : null,
    ],
    ["Criar remessa", shipment ? "Concluída" : waiting, shipment?.createdAt],
  ];
}

function shortDate(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "—";
  return (
    date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) +
    " • " +
    date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function DocumentSearch({ appointments, navigate }) {
  const [query, setQuery] = useState("");
  const term = normalize(query);
  const matches = term
    ? appointments.filter((item) =>
        [
          [item.documentType, item.documentNumber].join(" "),
          item.documentKey,
          ...(item.invoices || []),
          ...(item.documentFiles || []).map((file) => file.name),
        ].some((value) => normalize(value).includes(term)),
      )
    : [];

  return (
    <div className="op-search">
      <input
        type="search"
        value={query}
        aria-label="Buscar CT-e, MDF-e ou NF-e"
        placeholder="Buscar CT-e, MDF-e ou NF-e"
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setQuery("");
        }}
      />
      {term && (
        <div className="op-results" aria-label="Resultados da busca">
          {!matches.length && <p>Nenhuma entrega encontrada.</p>}
          {matches.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setQuery("");
                navigate("/detalhes-agendamento?id=" + encodeURIComponent(item.id));
              }}
            >
              <strong>
                {item.documentType} {item.documentNumber}
              </strong>
              <small>
                {item.carrier} · {item.date} às {item.time}
              </small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// O arquivo da ressalva fica neste navegador; só a referência é gravada no agendamento.
async function localAttachment(id, file) {
  const db = await new Promise((resolve, reject) => {
    const open = indexedDB.open("agenda-ressalvas-v1", 1);
    open.onupgradeneeded = () => open.result.createObjectStore("arquivos");
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error);
  });
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("arquivos", file ? "readwrite" : "readonly");
      const store = tx.objectStore("arquivos");
      const req = file ? store.put(file, id) : store.get(id);
      tx.oncomplete = () => resolve(req.result);
      tx.onabort = () => reject(tx.error);
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

function Notes({ mode, close, onRecord }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const firstField = useRef(null);
  useEffect(() => {
    firstField.current?.focus();
  }, []);
  const attach = mode === "attachment";

  async function save(event) {
    event.preventDefault();
    if (saving.current) return;
    if ((attach && !file) || (!attach && !text.trim())) {
      setError(attach ? "Selecione o arquivo da ressalva." : "Descreva a ocorrência.");
      return;
    }
    saving.current = true;
    setBusy(true);
    const id = crypto.randomUUID();
    try {
      if (attach) await localAttachment(id, file);
      onRecord({
        id,
        at: new Date().toISOString(),
        title: attach ? "Ressalva anexada" : OPENED,
        tone: attach ? "blue" : "red",
        details: text.trim(),
        ...(attach && { attachmentName: file.name }),
      });
      close();
    } catch {
      setError("Não foi possível salvar o registro neste navegador. Tente novamente.");
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  return (
    <form className="op-card op-note" onSubmit={save}>
      <h2>{attach ? "Anexar ressalva" : "Registrar ocorrência"}</h2>
      {attach && (
        <label>
          Arquivo da ressalva
          <input
            type="file"
            ref={firstField}
            required
            onChange={(event) => setFile(event.target.files[0])}
          />
          <small>Disponível para baixar neste navegador.</small>
        </label>
      )}
      <label>
        {attach ? "Observação (opcional)" : "Descrição da ocorrência"}
        <textarea
          ref={attach ? undefined : firstField}
          rows="3"
          required={!attach}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </label>
      {error && <p role="alert">{error}</p>}
      <div className="op-buttons">
        <button type="submit" className="button button--primary" disabled={busy}>
          {busy ? "Salvando…" : "Salvar"}
        </button>
        <button type="button" className="button button--outline" disabled={busy} onClick={close}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function AppointmentDetails({ internal = false }) {
  const [params] = useSearchParams();
  return <Operation key={params.get("id")} appointmentId={params.get("id")} internal={internal} />;
}

function Operation({ appointmentId, internal }) {
  const [mode, setMode] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { appointments, setAppointments } = useAppointments();

  // A URL traz texto; a demonstração também usa IDs numéricos.
  const appointment = appointments.find((item) => String(item.id) === appointmentId);

  if (!appointment) {
    return (
      <main className="page-content">
        <PageHeader
          title="Status da Operação"
          subtitle="Selecione uma entrega na lista de recebimentos."
        />

        <section className="panel">
          <p>{appointmentId ? "Agendamento não encontrado." : "Nenhum agendamento selecionado."}</p>
          <button
            type="button"
            className="button button--primary"
            onClick={() => navigate("/recebimentos")}
          >
            Abrir recebimentos
          </button>
        </section>
      </main>
    );
  }

  const dateISO = appointmentDateKey(appointment);

  const history = [
    ...(appointment.createdAt
      ? [
          {
            id: `created-${appointment.id}`,
            title: "Agendamento criado",
            at: appointment.createdAt,
            tone: "blue",
          },
        ]
      : []),
    ...(appointment.history || []),
  ];

  const documents = [
    ...(appointment.documentFiles || []).map((file) => file.name),
    ...(appointment.invoices || []),
  ];

  // Registra a chegada uma única vez, sem iniciar o recebimento.
  function registerGateEntry() {
    const at = new Date().toISOString();
    const event = {
      id: crypto.randomUUID(),
      title: "Entrada na portaria",
      at,
      tone: "blue",
    };

    setAppointments((current) =>
      current.map((item) => {
        if (item.id !== appointment.id || item.status !== "approved" || item.gateEntryAt) {
          return item;
        }

        return {
          ...item,
          gateEntryAt: at,
          history: [...(item.history || []), event],
        };
      }),
    );
  }

  function changeReceivingStatus(nextStatus) {
    if (nextStatus !== "progress" && nextStatus !== "completed") return;

    const starting = nextStatus === "progress";
    const previousStatus = starting ? "approved" : "progress";
    const event = {
      id: crypto.randomUUID(),
      title: starting ? "Recebimento iniciado" : "Recebimento concluído",
      at: new Date().toISOString(),
      tone: starting ? "blue" : "green",
    };

    setAppointments((current) =>
      current.map((item) => {
        if (
          item.id !== appointment.id ||
          item.status !== previousStatus ||
          (starting && !item.gateEntryAt)
        ) {
          return item;
        }

        return {
          ...item,
          status: nextStatus,
          history: [...(item.history || []), event],
        };
      }),
    );
  }

  // Confere o estado mais recente para impedir duas remessas na mesma entrega.
  function createShipment() {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const shipment = {
      id,
      number: `REM-${id.slice(0, 8).toUpperCase()}`,
      createdAt,
    };
    const event = {
      id,
      title: "Remessa criada",
      details: `Número da remessa: ${shipment.number}`,
      at: createdAt,
      tone: "green",
    };

    setAppointments((current) =>
      current.map((item) => {
        if (item.id !== appointment.id || item.status !== "completed" || item.shipment) {
          return item;
        }

        return {
          ...item,
          shipment,
          history: [...(item.history || []), event],
        };
      }),
    );
  }

  const flow = flowFor(appointment);
  const { status, gateEntryAt, shipment } = appointment;
  const active =
    status === "pending"
      ? 1
      : status === "approved"
        ? 2
        : status === "progress"
          ? 3
          : status === "completed" && !shipment
            ? 4
            : -1;
  const instructions =
    status === "pending"
      ? ["Aguardar a aprovação do agendamento"]
      : status === "rejected"
        ? []
        : [
            ...(status === "approved" && !gateEntryAt ? ["Registrar entrada na portaria"] : []),
            ...(status === "approved" ? ["Iniciar recebimento"] : []),
            ...(["approved", "progress"].includes(status)
              ? ["Conferir a carga e concluir o recebimento"]
              : []),
            ...(!shipment ? ["Criar remessa"] : []),
          ];

  function addRecord(entry) {
    if (entry.title === OPENED && !internal) return;
    setAppointments((current) =>
      current.map((item) =>
        item.id === appointment.id ? { ...item, history: [...(item.history || []), entry] } : item,
      ),
    );
    setMessage(entry.title + ". Consulte o histórico abaixo.");
  }

  async function download(entry) {
    try {
      const blob = await localAttachment(entry.id);
      if (!blob) throw new Error("Arquivo indisponível");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = entry.attachmentName;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      setMessage("Arquivo não encontrado neste navegador.");
    }
  }

  return (
    <main className="page-content op-page">
      <header className="op-top">
        <h1>Status da Operação</h1>
        <DocumentSearch appointments={appointments} navigate={navigate} />
      </header>
      <section className="op-card" aria-label="Resumo da entrega">
        <div className="op-summary">
          <dl className="op-summary" style={{ flex: 1, margin: 0 }}>
            <div>
              <dt>CT-e / MDF-e</dt>
              <dd>
                {appointment.documentType} {appointment.documentNumber}
              </dd>
            </div>
            <div>
              <dt>Transportadora</dt>
              <dd>{appointment.carrier}</dd>
            </div>
            <div>
              <dt>Agendamento</dt>
              <dd>
                {appointment.date} às {appointment.time}
              </dd>
            </div>
            <div>
              <dt>Situação geral</dt>
              <dd>
                <StatusBadge
                  status={status}
                  label={
                    shipment
                      ? "Remessa criada"
                      : gateEntryAt && status === "approved"
                        ? "Na portaria"
                        : undefined
                  }
                />
              </dd>
            </div>
          </dl>
          <button
            type="button"
            className="button button--outline"
            onClick={() => setMode("attachment")}
          >
            Anexar ressalva
          </button>
        </div>
        <p className="op-meta">
          {cargoSummary(appointment)} • {(appointment.invoices || []).length} nota(s) fiscal(is)
        </p>
      </section>

      <section className="op-card">
        <h2>Fluxo de recebimento</h2>
        <ol className="op-flow">
          {flow.map(([name, state, at], index) => (
            <li
              key={name}
              className={
                state === "Concluída"
                  ? "done"
                  : state === "Recusada"
                    ? "blocked"
                    : index === active
                      ? "active"
                      : ""
              }
              aria-current={active === index ? "step" : undefined}
            >
              <span aria-hidden="true" className="dot">
                {state === "Concluída" ? "✓" : index + 1}
              </span>
              <strong>{name}</strong>
              <span className="tag">{state}</span>
              <small>{shortDate(at)}</small>
            </li>
          ))}
        </ol>
      </section>

      <section className="op-card">
        <h2>Próximas ações</h2>
        {instructions.length ? (
          <ol className="op-next">
            {instructions.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ol>
        ) : (
          <p>
            {shipment
              ? "Operação finalizada. Remessa: " + shipment.number
              : "Agendamento recusado."}
          </p>
        )}
      </section>

      <div className="op-buttons">
        <div>
          {status === "approved" && !gateEntryAt && (
            <button type="button" className="button button--primary" onClick={registerGateEntry}>
              Registrar entrada na portaria
            </button>
          )}
          {status === "approved" && gateEntryAt && (
            <button
              type="button"
              className="button op-green"
              onClick={() => changeReceivingStatus("progress")}
            >
              ▶ Iniciar recebimento
            </button>
          )}
          {status === "progress" && (
            <button
              type="button"
              className="button op-green"
              onClick={() => changeReceivingStatus("completed")}
            >
              Concluir recebimento
            </button>
          )}
          {status === "completed" && !shipment && (
            <button type="button" className="button button--primary" onClick={createShipment}>
              Criar remessa
            </button>
          )}
        </div>
        {internal && (
          <button type="button" className="button op-danger" onClick={() => setMode("occurrence")}>
            Registrar ocorrência
          </button>
        )}
      </div>
      {mode && (mode === "attachment" || internal) && (
        <Notes key={mode} mode={mode} close={() => setMode(null)} onRecord={addRecord} />
      )}
      {message && <p role="status">{message}</p>}
      {location.state?.rescheduled && (
        <p role="status">Entrega reagendada com sucesso. Confira a nova data e o histórico.</p>
      )}

      <details className="op-card">
        <summary>Dados da carga e documentos</summary>
        <dl className="transport-details-list">
          <div>
            <dt>Transportadora</dt>
            <dd>{appointment.carrier}</dd>
          </div>

          <div>
            <dt>CNPJ</dt>
            <dd>{appointment.carrierCnpj || "Não informado"}</dd>
          </div>

          <div>
            <dt>CT-e / MDF-e</dt>
            <dd>
              {appointment.documentType} {appointment.documentNumber}
            </dd>
          </div>

          <div className="transport-details-list__wide">
            <dt>Chave do CT-e / MDF-e</dt>
            <dd>{appointment.documentKey || "Não informada"}</dd>
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
            <dt>Composição da carga</dt>
            <dd>{cargoSummary(appointment)}</dd>
          </div>

          <div>
            <dt>Placa do veículo</dt>
            <dd>{appointment.plate || "Não informada"}</dd>
          </div>

          <div>
            <dt>Motorista</dt>
            <dd>{appointment.driver || "Não informado"}</dd>
          </div>

          <div>
            <dt>Conferência</dt>
            <dd>{appointment.verified ? "Verificado" : "Ainda não verificado"}</dd>
          </div>

          <div className="transport-details-list__wide">
            <dt>Observações</dt>
            <dd>{appointment.observations || "Nenhuma observação."}</dd>
          </div>
        </dl>

        <section className="transport-documents">
          <h2>Documentos registrados</h2>
          <p className="document-storage-note">
            Esta demonstração registra os nomes dos documentos. Os arquivos não estão disponíveis
            para download.
          </p>

          <div>
            {documents.map((name, index) => (
              <div key={`${name}-${index}`} className="registered-document">
                <span aria-hidden="true">▤</span>
                <strong>{name}</strong>
              </div>
            ))}
            {documents.length === 0 && <p>Nenhum arquivo registrado.</p>}
          </div>
        </section>
      </details>
      <details className="op-card">
        <summary>Histórico da operação ({history.length})</summary>
        {history.length ? (
          <ol className="op-history">
            {history.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.title}</strong>
                <time dateTime={entry.at}>{new Date(entry.at).toLocaleString("pt-BR")}</time>
                {entry.details && <p>{entry.details}</p>}
                {entry.attachmentName && (
                  <button
                    type="button"
                    className="button button--outline"
                    onClick={() => download(entry)}
                  >
                    Baixar {entry.attachmentName}
                  </button>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p>Nenhuma movimentação registrada para esta entrega.</p>
        )}
      </details>

      <nav className="op-secondary" aria-label="Navegação da entrega">
        <button
          type="button"
          className="button button--outline"
          onClick={() => navigate("/recebimentos")}
        >
          Voltar a Recebimentos
        </button>
        <button
          type="button"
          className="button button--outline"
          onClick={() => navigate("/calendario?date=" + encodeURIComponent(dateISO))}
        >
          Ver no calendário
        </button>
        {canReschedule(appointment) && !gateEntryAt && (
          <button
            type="button"
            className="button button--outline"
            onClick={() =>
              navigate("/reagendar-agendamento?id=" + encodeURIComponent(appointment.id))
            }
          >
            Reagendar entrega
          </button>
        )}
      </nav>
    </main>
  );
}

export default AppointmentDetails;
