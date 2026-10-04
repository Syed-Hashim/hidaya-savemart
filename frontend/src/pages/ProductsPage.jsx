import { useEffect, useState } from 'react';
import client from '../api/client';

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
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
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
    loadProducts();
    loadCategories();
  }, []);

  function handleChange(e) {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

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
      setForm(emptyForm);
      setEditingId(null);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      category_id: product.category_id,
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      stock_quantity: product.stock_quantity,
      image: null,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    await client.delete(`/products/${id}`);
    loadProducts();
  }

  return (
    <div>
      <div className="mh">
        <div>
          <h2>Products</h2>
          <p>Add and update what's available in the store.</p>
        </div>
      </div>

      <form className="product-form" onSubmit={handleSubmit}>
        <select
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          required
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="name"
          placeholder="Product name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          step="0.01"
          min="0"
          value={form.price}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="stock_quantity"
          placeholder="Stock quantity"
          min="0"
          value={form.stock_quantity}
          onChange={handleChange}
          required
        />
        <input type="file" name="image" accept="image/*" onChange={handleChange} />
        <button type="submit">{editingId ? 'Update' : 'Add'} Product</button>
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
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-note">
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
                  <button type="button" onClick={() => startEdit(product)}>
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
    </div>
  );
}
