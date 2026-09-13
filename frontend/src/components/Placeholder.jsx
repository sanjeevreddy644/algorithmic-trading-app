function Placeholder({ title, description }) {
  return (
    <article className="placeholder-card">
      <span className="status-dot" />
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="coming-soon">Planned</span>
    </article>
  );
}

export default Placeholder;
