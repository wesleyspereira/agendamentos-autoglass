import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { readRegistry, writeRegistry, saveSupplier, saveUser } from "../utils/registry";
import "../styles/registrations.css";

const blankSupplier = () => ({ name: "", cnpjs: [""] });
export default function Registrations() {
  const [data, setData] = useState(() => {
    try {
      return readRegistry();
    } catch {
      return null;
    }
  });
  const [tab, setTab] = useState("suppliers");
  const [draft, setDraft] = useState(blankSupplier);
  const [user, setUser] = useState({ name: "", email: "" });
  const [message, setMessage] = useState("");
  const isSupplier = tab === "suppliers";
  function submit(event) {
    event.preventDefault();
    try {
      const current = readRegistry();
      const next = isSupplier ? saveSupplier(current, draft) : saveUser(current, user);
      writeRegistry(next);
      setData(next);
      if (isSupplier) setDraft(blankSupplier());
      else setUser({ name: "", email: "" });
      setMessage(isSupplier ? "Fornecedor salvo." : "Usuário cadastrado.");
    } catch (error) {
      setMessage(
        error.name === "Error" ? error.message : "Não foi possível salvar neste navegador.",
      );
    }
  }
  return (
    <main className="page-content registry-page">
      <PageHeader
        title="Cadastros"
        subtitle="Gerencie os fornecedores e os usuários da operação."
      />
      {!data ? (
        <p role="alert">Não foi possível ler os cadastros. Nenhum dado foi alterado.</p>
      ) : (
        <>
          <nav className="registry-tabs" aria-label="Tipo de cadastro">
            {[
              ["suppliers", "Fornecedores"],
              ["users", "Usuários"],
            ].map(([key, label]) => (
              <button
                type="button"
                key={key}
                aria-pressed={tab === key}
                className={"button button--" + (tab === key ? "primary" : "outline")}
                onClick={() => {
                  setTab(key);
                  setMessage("");
                }}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="registry-layout">
            <form className="panel registry-form" onSubmit={submit}>
              <h2>
                {isSupplier ? (draft.id ? "Editar fornecedor" : "Novo fornecedor") : "Novo usuário"}
              </h2>
              {isSupplier ? (
                <>
                  <label className="transport-field">
                    Nome do fornecedor
                    <input
                      required
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    />
                  </label>
                  {draft.cnpjs.map((value, i) => (
                    <div className="registry-row" key={i}>
                      <label className="transport-field">
                        CNPJ {i + 1}
                        <input
                          required
                          value={value}
                          placeholder="00.000.000/0000-00"
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              cnpjs: draft.cnpjs.map((v, j) => (j === i ? e.target.value : v)),
                            })
                          }
                        />
                      </label>
                      {draft.cnpjs.length > 1 && (
                        <button
                          type="button"
                          className="button button--outline"
                          aria-label={"Remover CNPJ " + (i + 1)}
                          onClick={() =>
                            setDraft({ ...draft, cnpjs: draft.cnpjs.filter((_, j) => j !== i) })
                          }
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="button button--outline"
                    onClick={() => setDraft({ ...draft, cnpjs: [...draft.cnpjs, ""] })}
                  >
                    + Adicionar CNPJ
                  </button>
                </>
              ) : (
                <>
                  <label className="transport-field">
                    Nome do usuário
                    <input
                      required
                      value={user.name}
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                    />
                  </label>
                  <label className="transport-field">
                    E-mail
                    <input
                      type="email"
                      required
                      value={user.email}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                    />
                  </label>
                </>
              )}
              <div className="registry-tabs">
                <button className="button button--primary" type="submit">
                  {isSupplier ? "Salvar fornecedor" : "Cadastrar usuário"}
                </button>
                {isSupplier && draft.id && (
                  <button
                    type="button"
                    className="button button--outline"
                    onClick={() => {
                      setDraft(blankSupplier());
                      setMessage("");
                    }}
                  >
                    Cancelar edição
                  </button>
                )}
              </div>
              <p aria-live="polite">{message}</p>
            </form>
            <section className="panel registry-list">
              <h2>{isSupplier ? "Fornecedores cadastrados" : "Usuários cadastrados"}</h2>
              {!data[tab].length && <p>Nenhum cadastro por enquanto.</p>}
              {data[tab].map((item) => (
                <article key={item.id}>
                  <strong>{item.name}</strong>
                  <p>{isSupplier ? item.cnpjs.join(" · ") : item.email}</p>
                  {isSupplier && (
                    <button
                      type="button"
                      className="button button--outline"
                      onClick={() => {
                        setDraft({ ...item, cnpjs: [...item.cnpjs] });
                        setMessage("");
                      }}
                    >
                      Editar fornecedor
                    </button>
                  )}
                </article>
              ))}
            </section>
          </div>
        </>
      )}
    </main>
  );
}
