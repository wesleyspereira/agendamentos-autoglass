const SESSION_KEY = "agenda-portal-nome";

// A sessão da demonstração guarda apenas o nome exibido no cabeçalho.
export function readPortalName() {
  try {
    return sessionStorage.getItem(SESSION_KEY)?.trim() || "";
  } catch {
    return "";
  }
}

export function savePortalName(name) {
  try {
    if (name) sessionStorage.setItem(SESSION_KEY, name);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // A entrada continua disponível mesmo quando o armazenamento é bloqueado.
  }
}

export function demoUserName(account) {
  const first = String(account ?? "")
    .trim()
    .split("@")[0]
    .split(/[._+\s-]+/)
    .filter(Boolean)[0];
  return first ? first.charAt(0).toLocaleUpperCase("pt-BR") + first.slice(1) : "Visitante";
}
