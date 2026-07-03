import { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import { Plus, Search, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', sku: '', category: '', price: '', cost: '', description: '', sizes: '', colors: '' });

  const fetchProducts = async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '100' });
    if (search) params.append('search', search);
    const { data } = await api.get(`/products?${params}`);
    setProducts(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSearch = () => fetchProducts();

  const openCreate = () => { setEditing(null); setForm({ name: '', sku: '', category: '', price: '', cost: '', description: '', sizes: '', colors: '' }); setShowModal(true); };

  const openEdit = (product: any) => {
    setEditing(product);
    setForm({
      name: product.name, sku: product.sku, category: product.category || '',
      price: String(product.price), cost: String(product.cost || ''),
      description: product.description || '', sizes: product.sizes || '', colors: product.colors || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: parseFloat(form.price), cost: parseFloat(form.cost) || 0 };
      if (editing) {
        await api.put(`/products/${editing.id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this product?')) return;
    try { await api.delete(`/products/${id}`); toast.success('Product deactivated'); fetchProducts(); }
    catch { toast.error('Failed to deactivate'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-500">Manage product catalog</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4 mr-1" /> Add Product</button>
      </div>

      <div className="card p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input className="input pl-9" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </div>
          <button onClick={handleSearch} className="btn-secondary">Search</button>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">SKU</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Category</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Price</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Cost</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td></tr>
                : products.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-500">No products</td></tr>
                : products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{p.name}</td>
                      <td className="px-6 py-4 text-gray-500">{p.sku}</td>
                      <td className="px-6 py-4">{p.category || '-'}</td>
                      <td className="px-6 py-4 text-right">{formatCurrency(p.price)}</td>
                      <td className="px-6 py-4 text-right">{p.cost ? formatCurrency(p.cost) : '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => openEdit(p)} className="text-primary-600 hover:text-primary-800 mr-2"><Edit3 className="w-4 h-4 inline" /></button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4 inline" /></button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div><label className="label">SKU</label><input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Price</label><input type="number" className="input" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
                <div><label className="label">Cost</label><input type="number" className="input" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></div>
              </div>
              <div><label className="label">Category</label><input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div><label className="label">Sizes (comma separated)</label><input className="input" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} /></div>
              <div><label className="label">Colors (comma separated)</label><input className="input" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} /></div>
              <div><label className="label">Description</label><textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
