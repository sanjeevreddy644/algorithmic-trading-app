export default function Sidebar({ active, onNavigate, open }) {
  const items = [["dashboard","Dashboard","▦"],["positions","Positions","◒"],["trades","Trades","⇄"],["backtests","Backtests","◫"],["strategy","Strategy","⚙"]];
  return <aside className={`sidebar ${open ? "open" : ""}`}><div className="sidebar-label">Workspace</div>{items.map(([id,label,icon]) => <button key={id} className={`side-link ${active===id?"active":""}`} onClick={() => onNavigate(id)}><span>{icon}</span>{label}</button>)}<div className="sidebar-note">Paper-first safeguards<br/>are enabled by default.</div></aside>;
}
