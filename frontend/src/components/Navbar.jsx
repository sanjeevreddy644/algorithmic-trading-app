import { useAuth } from "../context/AuthContext";
export default function Navbar({ onMenu }) {
  const { user, signOut } = useAuth();
  return <header className="navbar"><button className="icon-button mobile-only" onClick={onMenu}>☰</button><div className="brand"><span className="brand-mark">AT</span><span>Algorithmic Trading</span></div><div className="navbar-right"><span className="user-chip">{user?.displayName || user?.email}</span><button className="button ghost" onClick={signOut}>Logout</button></div></header>;
}
