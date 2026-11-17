export default function FiscalFileField({ title, files, setFiles, onError }) {
  function add(event) {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    if (selected.some((f) => !/\.(pdf|xml)$/i.test(f.name) || !f.size)) {
      onError("Selecione arquivos PDF ou XML não vazios.");
      return;
    }
    setFiles((current) => {
      const next = [...current];
      for (const file of selected) {
        if (
          !next.some(
            (f) =>
              f.name === file.name && f.size === file.size && f.lastModified === file.lastModified,
          )
        )
          next.push(file);
      }
      return next;
    });
    onError("");
  }
  return (
    <section>
      <label className="transport-upload transport-upload--compact">
        <strong>{title}</strong>
        <span>Selecionar PDF ou XML</span>
        <input type="file" multiple accept=".pdf,.xml" onChange={add} />
      </label>
      <ul aria-label={title}>
        {files.map((file, i) => (
          <li key={i}>
            <span>{file.name}</span>
            <button
              type="button"
              className="button button--outline"
              aria-label={"Remover " + file.name}
              onClick={() => setFiles((items) => items.filter((_, j) => j !== i))}
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
