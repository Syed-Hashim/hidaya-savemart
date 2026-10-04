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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get('/products'),
      client.get('/categories'),
      client.get('/dashboard'),
    ]).then(([productsRes, categoriesRes, dashboardRes]) => {
      setProducts(productsRes.data.data);
      setCategories(categoriesRes.data.data);
      setStats(dashboardRes.data.data);
      setLoading(false);
    });
  }, []);

  const stockAlerts = useMemo(() => {
    const lowStock = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 10);
    const outOfStock = products.filter((p) => p.stock_quantity === 0);
    return { lowStock, outOfStock };
  }, [products]);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  const maxSale = Math.max(1, ...stats.sales_last_7_days.map((d) => d.total));
  const attention = [...stockAlerts.outOfStock, ...stockAlerts.lowStock].slice(0, 4);

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
          <small>Sales today</small>
          <b>Rs {Number(stats.sales_today).toLocaleString()}</b>
        </div>
        <div>
          <small>Orders today</small>
          <b>{stats.orders_today}</b>
          <em>{stats.new_orders} waiting to be accepted</em>
        </div>
        <div>
          <small>To pack</small>
          <b>{stats.to_pack}</b>
        </div>
        <div>
          <small>Low stock</small>
          <b>{stockAlerts.lowStock.length}</b>
          <em className={stockAlerts.lowStock.length ? 'warn' : ''}>
            {stockAlerts.lowStock.length ? 'Reorder soon' : 'All good'}
          </em>
        </div>
        <div>
          <small>Products</small>
          <b>{products.length}</b>
        </div>
        <div>
          <small>Categories</small>
          <b>{categories.length}</b>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <h4>
            Sales, last 7 days
            <span className="h4-note">Rs in totals</span>
          </h4>
          <div className="chart">
            {stats.sales_last_7_days.map((d, i) => (
              <div className={i === 6 ? 'chart-bar today' : 'chart-bar'} key={i}>
                <span>{Number(d.total).toLocaleString()}</span>
                <i style={{ height: `${Math.max(6, (d.total / maxSale) * 150)}px` }} />
                {d.label}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h4>Needs your attention</h4>
          <div className="attention-list">
            {stats.new_orders > 0 && (
              <div className="attention-row">
                <span className="attention-icon attention-icon-info">
                  <Icon name="box" size={16} />
                </span>
                <div>
                  <b>{stats.new_orders} new orders</b>
                  <small>Accept them to start packing</small>
                </div>
              </div>
            )}
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
            {stats.new_orders === 0 && attention.length === 0 && (
              <p className="empty-note">Everything looks good right now.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h4>
          Best sellers this week
          <Link to="/products" className="h4-link">
            View products
          </Link>
        </h4>
        <table>
          <tbody>
            {stats.best_sellers.length === 0 && (
              <tr>
                <td className="empty-note">No sales yet this week.</td>
              </tr>
            )}
            {stats.best_sellers.map((item) => (
              <tr key={item.product_name}>
                <td>{item.product_name}</td>
                <td style={{ textAlign: 'right', color: 'var(--muted)' }}>{item.sold} sold</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
