const KEY = "autoglass-cadastros-v1";
export function readRegistry() {
  const raw = localStorage.getItem(KEY);
  if (raw === null) return { suppliers: [], users: [] };
  const data = JSON.parse(raw);
  if (!Array.isArray(data?.suppliers) || !Array.isArray(data?.users)) {
    throw new Error("Não foi possível ler os cadastros deste navegador.");
  }
  return data;
}
export function writeRegistry(registry) {
  localStorage.setItem(KEY, JSON.stringify(registry));
}
export const normalizeCnpj = (value) =>
  String(value ?? "")
    .replace(/[./\s-]/g, "")
    .toUpperCase();
export function findSupplier(suppliers, value) {
  const cnpj = normalizeCnpj(value);
  return suppliers.find((item) => item.cnpjs.includes(cnpj));
}
export function saveSupplier(registry, draft) {
  const name = draft.name.trim();
  const cnpjs = draft.cnpjs.map(normalizeCnpj);
  if (!name) throw new Error("Informe o nome do fornecedor.");
  if (!cnpjs.length || cnpjs.some((v) => !/^[A-Z0-9]{12}[0-9]{2}$/.test(v))) {
    throw new Error("Informe o CNPJ completo em cada campo.");
  }
  if (new Set(cnpjs).size !== cnpjs.length) throw new Error("Há CNPJs repetidos neste fornecedor.");
  const other = registry.suppliers.filter((item) => item.id !== draft.id);
  for (const cnpj of cnpjs) {
    const owner = findSupplier(other, cnpj);
    if (owner) throw new Error("Este CNPJ já está vinculado a " + owner.name + ".");
  }
  return {
    ...registry,
    suppliers: [...other, { id: draft.id || crypto.randomUUID(), name, cnpjs }],
  };
}
export function saveUser(registry, draft) {
  const name = draft.name.trim();
  const email = draft.email.trim().toLowerCase();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("Informe nome e e-mail válidos.");
  if (registry.users.some((u) => u.email === email))
    throw new Error("Este e-mail já está cadastrado.");
  return { ...registry, users: [...registry.users, { id: crypto.randomUUID(), name, email }] };
}
