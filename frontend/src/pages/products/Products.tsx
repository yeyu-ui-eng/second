import { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import { Plus, Search, Edit3, Trash2 } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import toast from 'react-hot-toast';

export default function Products() {
  const { t } = useI18n();
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
        toast.success(t('products.updated'));
      } else {
        await api.post('/products', payload);
        toast.success(t('products.created'));
      }
      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.error || t('products.saveFailed'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDelete'))) return;
    try { await api.delete(`/products/${id}`); toast.success(t('products.deactivated')); fetchProducts(); }
    catch { toast.error(t('products.deactivateFailed')); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-gray-100">{t('products.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('products.subtitle')}</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4 mr-1" /> {t('products.add')}</button>
      </div>

      <div className="card dark:bg-gray-900 dark:border-gray-800 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input className="input pl-9 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" placeholder={t('products.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </div>
          <button onClick={handleSearch} className="btn-secondary dark:border-gray-700 dark:text-gray-300">{t('common.search')}</button>
        </div>
      </div>

      <div className="card dark:bg-gray-900 dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('products.name')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('products.sku')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('products.category')}</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('products.price')}</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('products.cost')}</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? <tr><td colSpan={6} className="text-center py-8 text-gray-500">{t('common.loading')}</td></tr>
                : products.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">{t('products.noProducts')}</td></tr>
                : products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 font-medium dark:text-gray-200">{p.name}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{p.sku}</td>
                      <td className="px-6 py-4 dark:text-gray-300">{p.category || '-'}</td>
                      <td className="px-6 py-4 text-right dark:text-gray-200">{formatCurrency(p.price)}</td>
                      <td className="px-6 py-4 text-right dark:text-gray-200">{p.cost ? formatCurrency(p.cost) : '-'}</td>
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">{editing ? t('products.editTitle') : t('products.createTitle')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label dark:text-gray-300">{t('products.name')}</label><input className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div><label className="label dark:text-gray-300">{t('products.sku')}</label><input className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label dark:text-gray-300">{t('products.price')}</label><input type="number" className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
                <div><label className="label dark:text-gray-300">{t('products.cost')}</label><input type="number" className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></div>
              </div>
              <div><label className="label dark:text-gray-300">{t('products.category')}</label><input className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div><label className="label dark:text-gray-300">{t('products.sizes')}</label><input className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} /></div>
              <div><label className="label dark:text-gray-300">{t('products.colors')}</label><input className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} /></div>
              <div><label className="label dark:text-gray-300">{t('products.description')}</label><textarea className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary dark:border-gray-700">{t('common.cancel')}</button>
                <button type="submit" className="btn-primary">{editing ? t('common.update') : t('common.create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
