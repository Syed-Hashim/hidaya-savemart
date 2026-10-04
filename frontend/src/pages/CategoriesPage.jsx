import { useEffect, useState } from 'react';
import client from '../api/client';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  async function loadCategories() {
    const res = await client.get('/categories');
    setCategories(res.data.data);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await client.post(`/categories/${editingId}`, { name });
      } else {
        await client.post('/categories', { name });
      }
      setName('');
      setEditingId(null);
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  }

  function startEdit(category) {
    setEditingId(category.id);
    setName(category.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setName('');
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category?')) return;
    await client.delete(`/categories/${id}`);
    loadCategories();
  }

  return (
    <div>
      <div className="mh">
        <div>
          <h2>Categories</h2>
          <p>Group products so shoppers can browse by section.</p>
        </div>
      </div>

      <form className="inline-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">{editingId ? 'Update' : 'Add'}</button>
        {editingId && (
          <button type="button" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </form>
      {error && <p className="error">{error}</p>}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
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
                <td>
                  <button type="button" onClick={() => startEdit(category)}>
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
    </div>
  );
}
