import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([client.get('/products'), client.get('/categories')]).then(
      ([productsRes, categoriesRes]) => {
        setProducts(productsRes.data.data);
        setCategories(categoriesRes.data.data);
        setLoading(false);
      }
    );
  }, []);

  const stats = useMemo(() => {
    const lowStock = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 10);
    const outOfStock = products.filter((p) => p.stock_quantity === 0);
    return { lowStock, outOfStock };
  }, [products]);

  const byCategory = useMemo(() => {
    const counts = categories.map((c) => ({
      name: c.name,
      count: products.filter((p) => p.category_id === c.id).length,
    }));
    const max = Math.max(1, ...counts.map((c) => c.count));
    return { counts, max };
  }, [products, categories]);

  const attention = [...stats.outOfStock, ...stats.lowStock].slice(0, 5);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div>
      <div className="mh">
        <div>
          <h2>
            {greeting()}
            {user?.name ? `, ${user.name}` : ''}
          </h2>
          <p>Here's what's happening at Hidaya Save Mart today.</p>
        </div>
        <Link to="/products">
          <button>Add a product</button>
        </Link>
      </div>

      <div className="card stats">
        <div>
          <small>Total products</small>
          <b>{products.length}</b>
        </div>
        <div>
          <small>Categories</small>
          <b>{categories.length}</b>
        </div>
        <div>
          <small>Low stock</small>
          <b>{stats.lowStock.length}</b>
          <em className={stats.lowStock.length ? 'warn' : ''}>
            {stats.lowStock.length ? 'Reorder soon' : 'All good'}
          </em>
        </div>
        <div>
          <small>Out of stock</small>
          <b>{stats.outOfStock.length}</b>
          <em className={stats.outOfStock.length ? 'warn' : ''}>
            {stats.outOfStock.length ? 'Needs restock' : 'All good'}
          </em>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <h4>Products by category</h4>
          <div className="bar-list">
            {byCategory.counts.length === 0 && <p className="empty-note">No categories yet.</p>}
            {byCategory.counts.map((c) => (
              <div className="bar-row" key={c.name}>
                <span className="bar-label">{c.name}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(c.count / byCategory.max) * 100}%` }}
                  />
                </div>
                <span className="bar-count">{c.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h4>Needs attention</h4>
          <div className="attention-list">
            {attention.length === 0 && <p className="empty-note">Stock levels look healthy.</p>}
            {attention.map((p) => (
              <div className="attention-row" key={p.id}>
                <span className="attention-icon">
                  <Icon name="alert" size={16} />
                </span>
                <div>
                  <b>{p.name}</b>
                  <small>
                    {p.stock_quantity === 0 ? 'Out of stock' : `Only ${p.stock_quantity} left`}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
