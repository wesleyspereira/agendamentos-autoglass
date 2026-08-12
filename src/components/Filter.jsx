function Filter({ label, children, ...selectProps }) {
  return (
    <label className="filter">
      <span>{label}</span>

      <select {...selectProps}>{children}</select>
    </label>
  );
}

export default Filter;
