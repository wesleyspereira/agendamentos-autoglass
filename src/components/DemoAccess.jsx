import { createContext, useContext, useState } from "react";

const SESSION_KEY = "autoglass-nome-usuario";
const DemoUserContext = createContext(null);

export function useDemoUser() {
  return useContext(DemoUserContext);
}

export default function DemoAccess({ children }) {
  // Mantém o nome se a pessoa atualizar a página na mesma aba.
  const [userName, setUserName] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY)?.trim() || "";
    } catch {
      return "";
    }
  });

  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function enter(event) {
    event.preventDefault();

    const cleanName = name.trim();

    if (!cleanName) {
      setError("Digite o nome que deseja usar na Agenda.");
      return;
    }

    try {
      sessionStorage.setItem(SESSION_KEY, cleanName);
    } catch {
      // Mesmo sem armazenamento, permite usar a Agenda nesta página.
    }

    setUserName(cleanName);
    setError("");
  }

  function leave() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // O estado da tela também é limpo abaixo.
    }

    setUserName("");
    setName("");
    setError("");
  }

  if (userName) {
    return (
      <DemoUserContext.Provider value={{ userName, leave }}>
        {children}
      </DemoUserContext.Provider>
    );
  }

  return (
    <main className="demo-access">
      <section className="panel demo-access__card">
        <p className="demo-access__brand">Agenda de Recebimentos</p>

        <h1>Entrar na agenda</h1>
        <p>Como você quer ser chamado?</p>

        <form onSubmit={enter}>
          <label className="transport-field" htmlFor="demo-user-name">
            <span>Seu nome</span>
            <input
              id="demo-user-name"
              type="text"
              autoComplete="given-name"
              placeholder="Ex.: Wesley"
              maxLength={60}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              autoFocus
            />
          </label>

          {error && (
            <p className="form-feedback" role="alert">
              {error}
            </p>
          )}

          <button className="button button--primary" type="submit">
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}