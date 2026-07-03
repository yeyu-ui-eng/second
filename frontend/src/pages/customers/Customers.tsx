import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Search, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import toast from 'react-hot-toast';

export default function Customers() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', city: '', notes: '' });

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '10' });
    if (search) params.append('search', search);
    const { data } = await api.get(`/customers?${params}`);
    setCustomers(data.data);
    setPagination(data.pagination);
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleSearch = () => fetchCustomers(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customers', form);
      toast.success(t('customers.created'));
      setShowModal(false);
      setForm({ firstName: '', lastName: '', email: '', phone: '', city: '', notes: '' });
      fetchCustomers();
    } catch (err: any) { toast.error(err.response?.data?.error || t('customers.saveFailed')); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-gray-100">{t('customers.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('customers.subtitle')}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4 mr-1" /> {t('customers.add')}</button>
      </div>

      <div className="card dark:bg-gray-900 dark:border-gray-800 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input className="input pl-9 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" placeholder={t('customers.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </div>
          <button onClick={handleSearch} className="btn-secondary dark:border-gray-700 dark:text-gray-300">{t('common.search')}</button>
        </div>
      </div>

      <div className="card dark:bg-gray-900 dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('customers.name')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('customers.email')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('customers.phone')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('customers.city')}</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('customers.orders')}</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? <tr><td colSpan={6} className="text-center py-8">{t('common.loading')}</td></tr>
                : customers.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">{t('customers.noCustomers')}</td></tr>
                : customers.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 font-medium dark:text-gray-200">{c.firstName} {c.lastName}</td>
                      <td className="px-6 py-4 dark:text-gray-300">{c.email || '-'}</td>
                      <td className="px-6 py-4 dark:text-gray-300">{c.phone || '-'}</td>
                      <td className="px-6 py-4 dark:text-gray-300">{c.city || '-'}</td>
                      <td className="px-6 py-4 text-center dark:text-gray-300">{c._count?.orders || 0}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => navigate(`/orders?customer=${c.id}`)} className="text-primary-600 hover:text-primary-800"><Eye className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t dark:border-gray-800">
            <p className="text-sm text-gray-500">{t('common.pageOf', { page: pagination.page, total: pagination.totalPages })}</p>
            <div className="flex gap-2">
              <button disabled={pagination.page <= 1} onClick={() => fetchCustomers(pagination.page - 1)} className="btn-secondary btn-sm dark:border-gray-700">{t('common.previous')}</button>
              <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchCustomers(pagination.page + 1)} className="btn-secondary btn-sm dark:border-gray-700">{t('common.next')}</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">{t('customers.createTitle')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label dark:text-gray-300">{t('customers.firstName')}</label><input className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></div>
                <div><label className="label dark:text-gray-300">{t('customers.lastName')}</label><input className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label dark:text-gray-300">{t('customers.email')}</label><input type="email" className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><label className="label dark:text-gray-300">{t('customers.phone')}</label><input className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <div><label className="label dark:text-gray-300">{t('customers.city')}</label><input className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div><label className="label dark:text-gray-300">{t('customers.notes')}</label><textarea className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary dark:border-gray-700">{t('common.cancel')}</button>
                <button type="submit" className="btn-primary">{t('common.create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
