// Os arquivos ficam no IndexedDB; o agendamento guarda apenas as referências.
async function transaction(mode, operation) {
  const db = await new Promise((resolve, reject) => {
    const open = indexedDB.open("autoglass-anexos-fiscais-v1", 1);
    open.onupgradeneeded = () => open.result.createObjectStore("arquivos");
    open.onerror = () => reject(open.error);
    open.onsuccess = () => resolve(open.result);
  });
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("arquivos", mode);
      let result;
      tx.oncomplete = () => resolve(result);
      tx.onabort = () => reject(tx.error);
      operation(tx.objectStore("arquivos"), (value) => {
        result = value;
      });
    });
  } finally {
    db.close();
  }
}
export async function storeFiscalFiles(invoices, transport) {
  const entries = [
    ...invoices.map((file) => ({ file, kind: "NF-e" })),
    ...transport.map((file) => ({ file, kind: "CT-e" })),
  ];
  const refs = entries.map(({ file, kind }) => ({
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    kind,
  }));
  await transaction("readwrite", (store) =>
    entries.forEach(({ file }, i) => store.add(file, refs[i].id)),
  );
  return refs;
}
export function loadFiscalFile(id) {
  return transaction("readonly", (store, done) => {
    const req = store.get(id);
    req.onsuccess = () => done(req.result);
  });
}
