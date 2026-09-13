import Placeholder from "./Placeholder";

function Dashboard() {
  return (
    <section id="dashboard" className="dashboard">
      <div className="hero-panel">
        <p className="eyebrow">Trading control center</p>
        <h2>Application scaffolding is ready.</h2>
        <p>
          The backend, frontend, MongoDB connection placeholder, and local
          development workflow are configured for the next batch.
        </p>
      </div>

      <div className="card-grid">
        <Placeholder
          title="Strategies"
          description="Strategy management will be added in a future batch."
        />
        <Placeholder
          title="Paper Trading"
          description="Paper trading functionality is not implemented yet."
        />
        <Placeholder
          title="Broker Integration"
          description="Broker adapters, including Zerodha, are not implemented yet."
        />
      </div>
    </section>
  );
}

export default Dashboard;
