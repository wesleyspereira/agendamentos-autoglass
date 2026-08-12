function PageHeader({ title, subtitle, children }) {
  return (
    <header className="page-heading">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="page-heading__actions">{children}</div>}
    </header>
  );
}

export default PageHeader;
