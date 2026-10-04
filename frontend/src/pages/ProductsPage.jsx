import { useEffect, useState } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';

const emptyForm = {
  category_id: '',
  name: '',
  description: '',
  price: '',
  stock_quantity: '',
  image: null,
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadProducts() {
    const res = await client.get('/products');
    setProducts(res.data.data);
  }

  async function loadCategories() {
    const res = await client.get('/categories');
    setCategories(res.data.data);
  }

  useEffect(() => {
    Promise.all([loadProducts(), loadCategories()]).then(() => setLoading(false));
  }, []);

  function handleChange(e) {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  }

  function openEdit(product) {
    setEditingId(product.id);
    setForm({
      category_id: product.category_id,
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      stock_quantity: product.stock_quantity,
      image: null,
    });
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const data = new FormData();
    data.append('category_id', form.category_id);
    data.append('name', form.name);
    data.append('description', form.description);
    data.append('price', form.price);
    data.append('stock_quantity', form.stock_quantity);
    if (form.image) {
      data.append('image', form.image);
    }

    try {
      if (editingId) {
        await client.post(`/products/${editingId}`, data);
      } else {
        await client.post('/products', data);
      }
      setShowModal(false);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(product) {
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_active: !p.is_active } : p))
    );
    try {
      await client.post(`/products/${product.id}`, { is_active: !product.is_active });
    } catch {
      loadProducts();
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    await client.delete(`/products/${id}`);
    loadProducts();
  }

  if (loading) {
    return <p>Loading products...</p>;
  }

  return (
    <div>
      <div className="mh">
        <div>
          <h2>Products</h2>
          <p>Changes appear in the customer app straight away.</p>
        </div>
        <button onClick={openAdd}>Add product</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>In stock</th>
              <th>Show in app</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-note">
                  No products yet — add your first one above.
                </td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="product-cell">
                    {product.image ? (
                      <img
                        className="product-thumb"
                        src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${product.image}`}
                        alt={product.name}
                      />
                    ) : (
                      <span className="product-thumb product-thumb-placeholder">?</span>
                    )}
                    <span>{product.name}</span>
                  </div>
                </td>
                <td>{product.category?.name}</td>
                <td>Rs {Number(product.price).toLocaleString()}</td>
                <td>
                  {product.stock_quantity}
                  {product.stock_quantity === 0 && <span className="pill pill-danger">Out</span>}
                  {product.stock_quantity > 0 && product.stock_quantity <= 10 && (
                    <span className="pill pill-warn">Low</span>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className={'switch' + (product.is_active ? ' on' : '')}
                    role="switch"
                    aria-checked={product.is_active}
                    aria-label={`Show ${product.name} in app`}
                    onClick={() => toggleActive(product)}
                  />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button type="button" onClick={() => openEdit(product)}>
                    Edit
                  </button>
                  <button className="btn-danger" onClick={() => handleDelete(product.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editingId ? 'Edit product' : 'Add product'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            {error && <p className="error">{error}</p>}

            <label>
              Product name
              <input
                type="text"
                name="name"
                placeholder="e.g. Basmati Rice 5kg"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                placeholder="Optional"
                value={form.description}
                onChange={handleChange}
              />
            </label>

            <label>
              Category
              <select name="category_id" value={form.category_id} onChange={handleChange} required>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="field-row">
              <label>
                Price (Rs)
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Stock
                <input
                  type="number"
                  name="stock_quantity"
                  min="0"
                  value={form.stock_quantity}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <label>
              Image
              <input type="file" name="image" accept="image/*" onChange={handleChange} />
            </label>

            <div className="modal-actions">
              <button type="button" onClick={() => setShowModal(false)} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save product'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
