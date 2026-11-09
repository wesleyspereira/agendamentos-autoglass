// Os símbolos acompanham os rótulos; o nome acessível vem do texto de cada opção.
export default function CargoIcon({ mode }) {
  const cube = (
    <>
      <path d="m3 7 9-4 9 4v10l-9 5-9-5Z" />
      <path d="m3 7 9 5 9-5m-9 5v10" />
    </>
  );
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {mode === "Palete" ? (
        <>
          <path d="M4 4h16v12H4zM4 10h16M2 18h20M4 18v3m8-3v3m8-3v3" />
        </>
      ) : mode === "Ambos" ? (
        <>
          <rect x="8.5" y="2" width="7" height="8" rx="1" />
          <rect x="3" y="13" width="8" height="8" rx="1" />
          <rect x="13" y="13" width="8" height="8" rx="1" />
        </>
      ) : (
        cube
      )}
    </svg>
  );
}
