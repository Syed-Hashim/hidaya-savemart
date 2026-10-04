import { useEffect, useState } from 'react';
import client from '../api/client';

const emptyZone = { name: '', fee: '', minimum_order: '', eta_text: '' };
const emptyMethod = { key: '', label: '', description: '' };

export default function DeliveryPaymentsPage() {
  const [zones, setZones] = useState([]);
  const [zoneForm, setZoneForm] = useState(emptyZone);
  const [editingZoneId, setEditingZoneId] = useState(null);

  const [methods, setMethods] = useState([]);
  const [methodForm, setMethodForm] = useState(emptyMethod);
  const [editingMethodId, setEditingMethodId] = useState(null);

  const [error, setError] = useState('');

  async function loadZones() {
    const res = await client.get('/delivery-zones');
    setZones(res.data.data);
  }

  async function loadMethods() {
    const res = await client.get('/payment-methods');
    setMethods(res.data.data);
  }

  useEffect(() => {
    loadZones();
    loadMethods();
  }, []);

  async function handleZoneSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingZoneId) {
        await client.post(`/delivery-zones/${editingZoneId}`, zoneForm);
      } else {
        await client.post('/delivery-zones', zoneForm);
      }
      setZoneForm(emptyZone);
      setEditingZoneId(null);
      loadZones();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  }

  function startEditZone(zone) {
    setEditingZoneId(zone.id);
    setZoneForm({
      name: zone.name,
      fee: zone.fee,
      minimum_order: zone.minimum_order,
      eta_text: zone.eta_text ?? '',
    });
  }

  function cancelEditZone() {
    setEditingZoneId(null);
    setZoneForm(emptyZone);
  }

  async function toggleZone(zone) {
    await client.post(`/delivery-zones/${zone.id}`, { is_active: !zone.is_active });
    loadZones();
  }

  async function deleteZone(zone) {
    if (!confirm(`Delete "${zone.name}"?`)) return;
    await client.delete(`/delivery-zones/${zone.id}`);
    loadZones();
  }

  async function handleMethodSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingMethodId) {
        await client.post(`/payment-methods/${editingMethodId}`, methodForm);
      } else {
        await client.post('/payment-methods', methodForm);
      }
      setMethodForm(emptyMethod);
      setEditingMethodId(null);
      loadMethods();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  }

  function startEditMethod(method) {
    setEditingMethodId(method.id);
    setMethodForm({
      key: method.key,
      label: method.label,
      description: method.description ?? '',
    });
  }

  function cancelEditMethod() {
    setEditingMethodId(null);
    setMethodForm(emptyMethod);
  }

  async function toggleMethod(method) {
    await client.post(`/payment-methods/${method.id}`, { is_active: !method.is_active });
    loadMethods();
  }

  async function deleteMethod(method) {
    if (!confirm(`Delete "${method.label}"?`)) return;
    await client.delete(`/payment-methods/${method.id}`);
    loadMethods();
  }

  return (
    <div>
      <div className="mh">
        <div>
          <h2>Delivery &amp; Payments</h2>
          <p>Decide where you deliver and how customers can pay.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="card" style={{ marginBottom: 20 }}>
        <h4>Delivery areas</h4>
        <form className="inline-form" onSubmit={handleZoneSubmit} style={{ padding: '14px 18px 0' }}>
          <input
            type="text"
            placeholder="Area name"
            value={zoneForm.name}
            onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Fee"
            min="0"
            step="0.01"
            value={zoneForm.fee}
            onChange={(e) => setZoneForm({ ...zoneForm, fee: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Minimum order"
            min="0"
            step="0.01"
            value={zoneForm.minimum_order}
            onChange={(e) => setZoneForm({ ...zoneForm, minimum_order: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Delivery time, e.g. 30-45 min"
            value={zoneForm.eta_text}
            onChange={(e) => setZoneForm({ ...zoneForm, eta_text: e.target.value })}
          />
          <button type="submit">{editingZoneId ? 'Update' : 'Add'}</button>
          {editingZoneId && (
            <button type="button" onClick={cancelEditZone}>
              Cancel
            </button>
          )}
        </form>

        <table style={{ marginTop: 14 }}>
          <thead>
            <tr>
              <th>Area</th>
              <th>Fee</th>
              <th>Minimum order</th>
              <th>Delivery time</th>
              <th>Available</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {zones.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-note">
                  No delivery areas yet — add one above.
                </td>
              </tr>
            )}
            {zones.map((zone) => (
              <tr key={zone.id}>
                <td>{zone.name}</td>
                <td>Rs {Number(zone.fee).toLocaleString()}</td>
                <td>Rs {Number(zone.minimum_order).toLocaleString()}</td>
                <td>{zone.eta_text || '-'}</td>
                <td>
                  <button
                    type="button"
                    className={'switch' + (zone.is_active ? ' on' : '')}
                    role="switch"
                    aria-checked={zone.is_active}
                    aria-label={zone.name}
                    onClick={() => toggleZone(zone)}
                  />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button type="button" onClick={() => startEditZone(zone)}>
                    Edit
                  </button>
                  <button className="btn-danger" onClick={() => deleteZone(zone)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h4>Payment methods</h4>
        <form className="inline-form" onSubmit={handleMethodSubmit} style={{ padding: '14px 18px 0' }}>
          <input
            type="text"
            placeholder="Key, e.g. cod"
            value={methodForm.key}
            onChange={(e) => setMethodForm({ ...methodForm, key: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Label, e.g. Cash on delivery"
            value={methodForm.label}
            onChange={(e) => setMethodForm({ ...methodForm, label: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={methodForm.description}
            onChange={(e) => setMethodForm({ ...methodForm, description: e.target.value })}
          />
          <button type="submit">{editingMethodId ? 'Update' : 'Add'}</button>
          {editingMethodId && (
            <button type="button" onClick={cancelEditMethod}>
              Cancel
            </button>
          )}
        </form>

        <div className="setting-list">
          {methods.length === 0 && <p className="empty-note">No payment methods yet.</p>}
          {methods.map((method) => (
            <div className="setting-row" key={method.id}>
              <span>
                <b>{method.label}</b>
                <small>{method.description}</small>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button type="button" onClick={() => startEditMethod(method)}>
                  Edit
                </button>
                <button className="btn-danger" onClick={() => deleteMethod(method)}>
                  Delete
                </button>
                <button
                  type="button"
                  className={'switch' + (method.is_active ? ' on' : '')}
                  role="switch"
                  aria-checked={method.is_active}
                  aria-label={method.label}
                  onClick={() => toggleMethod(method)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
