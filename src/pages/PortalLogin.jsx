import { useState } from "react";
import { demoUserName } from "../utils/portalSession";
import "../styles/portal-login.css";

const highlights = [
  ["calendar", "Agendamento organizado", "Substitua solicitações por e-mail."],
  ["check", "Acompanhamento em tempo real", "Consulte o status de cada entrega."],
  ["file", "Notas fiscais centralizadas", "PDFs e XMLs em um único lugar."],
];

function Symbol({ type }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {type === "check" && <path d="m5 12 4.5 4.5L19 7" />}
      {type === "calendar" && (
        <>
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M7 3v4m10-4v4M3 10h18m-12 5h3" />
        </>
      )}
      {type === "file" && (
        <>
          <path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6m-6 4h6" />
        </>
      )}
    </svg>
  );
}

function Brand() {
  return (
    <div className="pl-brand">
      <span>
        <Symbol type="check" />
      </span>
      <strong>
        Agenda<small>Recebimento</small>
      </strong>
    </div>
  );
}

export default function PortalLogin({ onEnter }) {
  const [hint, setHint] = useState("");

  function enter(event) {
    event.preventDefault();
    // A demonstração usa apenas o nome antes do @. Não guarda CNPJ nem senha.
    const account = new FormData(event.currentTarget).get("account");
    onEnter(demoUserName(account));
  }

  return (
    <main className="pl-screen">
      <aside className="pl-intro">
        <Brand />
        <div className="pl-story">
          <h1>
            Agende suas entregas
            <br /> de forma simples e segura.
          </h1>
          <p>
            Anexe suas notas fiscais, escolha o melhor horário e acompanhe todas as etapas do
            recebimento.
          </p>
          <ul>
            {highlights.map(([type, title, text]) => (
              <li key={type}>
                <span className="pl-icon">
                  <Symbol type={type} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className="pl-access" aria-labelledby="pl-title">
        <div className="pl-card">
          <Brand />
          <h2 id="pl-title">Bem-vindo!</h2>
          <p className="pl-subtitle">Acesse o portal da transportadora</p>
          <form onSubmit={enter} noValidate autoComplete="off">
            <label>
              CNPJ
              <input type="text" placeholder="00.000.000/0000-00" maxLength={18} />
            </label>
            <label>
              E-mail
              <input
                type="text"
                name="account"
                inputMode="email"
                placeholder="contato@transportadora.com.br"
                maxLength={100}
              />
            </label>
            <label>
              Senha
              <input type="password" placeholder="••••••••" autoComplete="off" />
            </label>
            <button
              className="pl-link pl-forgot"
              type="button"
              onClick={() =>
                setHint("Nesta demonstração, basta clicar em Entrar. Nenhuma senha é necessária.")
              }
            >
              Esqueci minha senha
            </button>
            <button className="pl-submit" type="submit">
              Entrar
            </button>
            <p className="pl-subtitle">Modo demonstração: nenhum campo é obrigatório.</p>
          </form>
          <p className="pl-register">
            Ainda não possui acesso?{" "}
            <button
              type="button"
              className="pl-link"
              onClick={() =>
                setHint("O cadastro de empresas ainda não está disponível nesta demonstração.")
              }
            >
              Cadastre sua empresa
            </button>
          </p>
          <p className="pl-hint" role="status">
            {hint}
          </p>
        </div>
        <footer>Portal das transportadoras</footer>
      </section>
    </main>
  );
}
