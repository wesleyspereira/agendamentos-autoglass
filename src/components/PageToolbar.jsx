function PageToolbar({ description, children, meta, className = "" }) {
  const toolbarClassName = `page-toolbar${className ? ` ${className}` : ""}`;

  return (
    <section className={toolbarClassName} aria-label="Filtros e controles da página">
      <div className="page-toolbar__content">
        {description && <p className="page-toolbar__description">{description}</p>}

        <div className="page-toolbar__filters">{children}</div>
      </div>

      {meta && <div className="page-toolbar__meta">{meta}</div>}
    </section>
  );
}

export default PageToolbar;
