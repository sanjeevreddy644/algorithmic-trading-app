function Navigation() {
  return (
    <header className="navigation">
      <div>
        <p className="eyebrow">Batch 1</p>
        <h1>Algorithmic Trading</h1>
      </div>

      <nav>
        <a href="#dashboard">Dashboard</a>
        <a href="#strategies">Strategies</a>
        <a href="#orders">Orders</a>
      </nav>
    </header>
  );
}

export default Navigation;
