import { useEffect, useState } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadCategories() {
    const res = await client.get('/categories');
    setCategories(res.data.data);
  }

  useEffect(() => {
    loadCategories().then(() => setLoading(false));
  }, []);

  function openAdd() {
    setEditingId(null);
    setName('');
    setError('');
    setShowModal(true);
  }

  function openEdit(category) {
    setEditingId(category.id);
    setName(category.name);
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (editingId) {
        await client.post(`/categories/${editingId}`, { name });
      } else {
        await client.post('/categories', { name });
      }
      setShowModal(false);
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category?')) return;
    await client.delete(`/categories/${id}`);
    loadCategories();
  }

  if (loading) {
    return <p>Loading categories...</p>;
  }

  return (
    <div>
      <div className="mh">
        <div>
          <h2>Categories</h2>
          <p>Group products so shoppers can browse by section.</p>
        </div>
        <button onClick={openAdd}>Add category</button>
      </div>

      {error && !showModal && <p className="error">{error}</p>}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td colSpan={2} className="empty-note">
                  No categories yet — add your first one above.
                </td>
              </tr>
            )}
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td style={{ textAlign: 'right' }}>
                  <button type="button" onClick={() => openEdit(category)}>
                    Edit
                  </button>
                  <button className="btn-danger" onClick={() => handleDelete(category.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editingId ? 'Edit category' : 'Add category'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            {error && <p className="error">{error}</p>}

            <label>
              Category name
              <input
                type="text"
                placeholder="e.g. Groceries"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

            <div className="modal-actions">
              <button type="button" onClick={() => setShowModal(false)} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save category'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
