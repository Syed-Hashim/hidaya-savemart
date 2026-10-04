import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <img src={logo} alt="Hidaya Save Mart" />
          <h2>Hidaya Save Mart</h2>
        </div>
        <Link to="/products">Products</Link>
        <Link to="/categories">Categories</Link>
        <button onClick={handleLogout}>Logout</button>
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
