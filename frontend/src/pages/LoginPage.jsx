import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const CATEGORIES = ['Groceries', 'Cosmetics', 'Utensils', 'Toys'];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-brand">
        <img src={logo} alt="Hidaya Save Mart" />
        <h1>Hidaya Save Mart</h1>
        <p>Manage products, categories and stock for your store from one place.</p>
        <div className="login-badges">
          {CATEGORIES.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-card">
          <p className="eyebrow">Admin Panel</p>
          <h2>Welcome back</h2>
          <p className="sub">Sign in to manage your store.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <p className="error">{error}</p>}
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
