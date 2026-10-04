import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';
import logo from '../assets/logo.png';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: 'home' },
  { to: '/products', label: 'Products', icon: 'grid' },
  { to: '/categories', label: 'Categories', icon: 'tag' },
];

export default function Layout() {
  const { user, logout } = useAuth();
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

        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
          >
            <Icon name={item.icon} />
            {item.label}
          </NavLink>
        ))}

        <div className="sidebar-foot">
          <div className="sidebar-user">
            <Icon name="user" size={16} />
            <div>
              <b>{user?.name ?? 'Admin'}</b>
              <small>{user?.email ?? ''}</small>
            </div>
          </div>
          <button onClick={handleLogout}>
            <Icon name="logout" size={16} />
            Logout
          </button>
        </div>
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
