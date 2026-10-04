import { useEffect, useMemo, useState } from 'react';
import client from '../api/client';

const STATUSES = ['New', 'Packing', 'Out', 'Delivered'];
const NEXT_ACTION = {
  New: 'Accept & pack',
  Packing: 'Send out',
  Out: 'Mark delivered',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadOrders() {
    const res = await client.get('/orders');
    setOrders(res.data.data);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const tabs = useMemo(() => {
    return ['All', ...STATUSES].map((status) => ({
      status,
      count: status === 'All' ? orders.length : orders.filter((o) => o.status === status).length,
    }));
  }, [orders]);

  const visible = tab === 'All' ? orders : orders.filter((o) => o.status === tab);

  async function handleAdvance(order) {
    setError('');
    try {
      await client.post(`/orders/${order.id}/advance`);
      loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update order');
    }
  }

  async function handleDelete(order) {
    if (!confirm(`Delete order ${order.order_number}?`)) return;
    await client.delete(`/orders/${order.id}`);
    loadOrders();
  }

  if (loading) {
    return <p>Loading orders...</p>;
  }

  return (
    <div>
      <div className="mh">
        <div>
          <h2>Orders</h2>
          <p>Orders placed from the customer app land here automatically.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="card">
        <div className="tabs-row">
          {tabs.map((t) => (
            <button
              key={t.status}
              type="button"
              className={'tab-btn' + (tab === t.status ? ' active' : '')}
              onClick={() => setTab(t.status)}
            >
              {t.status}
              <span className="tab-count">{t.count}</span>
            </button>
          ))}
        </div>

        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Area</th>
              <th>Items</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} className="empty-note">
                  No orders in this status yet.
                </td>
              </tr>
            )}
            {visible.map((order) => (
              <tr key={order.id}>
                <td>
                  <b>{order.order_number}</b>
                  <br />
                  <small style={{ color: 'var(--muted)' }}>
                    {new Date(order.created_at).toLocaleString()}
                  </small>
                </td>
                <td>
                  {order.customer_name}
                  {order.customer_phone && (
                    <>
                      <br />
                      <small style={{ color: 'var(--muted)' }}>{order.customer_phone}</small>
                    </>
                  )}
                </td>
                <td>{order.delivery_zone?.name ?? 'Pickup'}</td>
                <td>{order.items.reduce((sum, i) => sum + i.quantity, 0)}</td>
                <td>{order.payment_method?.label}</td>
                <td>Rs {Number(order.total).toLocaleString()}</td>
                <td>
                  <span className={`pill status-${order.status}`}>{order.status}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  {NEXT_ACTION[order.status] && (
                    <button type="button" onClick={() => handleAdvance(order)}>
                      {NEXT_ACTION[order.status]}
                    </button>
                  )}
                  <button className="btn-danger" onClick={() => handleDelete(order)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
