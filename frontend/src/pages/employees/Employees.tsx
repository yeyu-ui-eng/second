import { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { Plus, Edit3, UserX } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import toast from 'react-hot-toast';

export default function Employees() {
  const { t } = useI18n();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'SALES', phone: '' });

  const fetchEmployees = async () => {
    setLoading(true);
    const { data } = await api.get('/users?limit=100');
    setEmployees(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchEmployees(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ email: '', password: '', firstName: '', lastName: '', role: 'SALES', phone: '' });
    setShowModal(true);
  };

  const openEdit = (emp: any) => {
    setEditing(emp);
    setForm({ email: emp.email, password: '', firstName: emp.firstName, lastName: emp.lastName, role: emp.role, phone: emp.phone || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        const payload: any = { firstName: form.firstName, lastName: form.lastName, role: form.role, phone: form.phone };
        await api.put(`/users/${editing.id}`, payload);
        toast.success(t('employees.updated'));
      } else {
        await api.post('/users', form);
        toast.success(t('employees.created'));
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err: any) { toast.error(err.response?.data?.error || t('employees.saveFailed')); }
  };

  const handleToggleStatus = async (emp: any) => {
    const action = emp.isActive ? t('employees.disabled') : t('employees.enabled');
    if (!confirm(t('employees.toggleConfirm', { action, firstName: emp.firstName, lastName: emp.lastName }))) return;
    try {
      await api.put(`/users/${emp.id}`, { isActive: !emp.isActive });
      toast.success(`${emp.firstName} ${emp.lastName} ${action}`);
      fetchEmployees();
    } catch { toast.error(t('employees.saveFailed')); }
  };

  const roleColor = (role: string) => {
    const colors: Record<string, string> = { ADMIN: 'badge-red', SALES: 'badge-blue', PRODUCTION: 'badge-green' };
    return colors[role] || 'badge-gray';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-gray-100">{t('employees.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('employees.subtitle')}</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4 mr-1" /> {t('employees.add')}</button>
      </div>

      <div className="card dark:bg-gray-900 dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('employees.name')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('employees.email')}</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('employees.role')}</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('employees.status')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('employees.joined')}</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? <tr><td colSpan={6} className="text-center py-8">{t('common.loading')}</td></tr>
                : employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 font-medium dark:text-gray-200">{emp.firstName} {emp.lastName}</td>
                      <td className="px-6 py-4 dark:text-gray-300">{emp.email}</td>
                      <td className="px-6 py-4 text-center"><span className={roleColor(emp.role)}>{emp.role}</span></td>
                      <td className="px-6 py-4 text-center">
                        <span className={emp.isActive ? 'badge-green' : 'badge-red'}>{emp.isActive ? t('employees.active') : t('employees.inactive')}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{formatDate(emp.createdAt)}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => openEdit(emp)} className="text-primary-600 hover:text-primary-800 mr-2"><Edit3 className="w-4 h-4 inline" /></button>
                        <button onClick={() => handleToggleStatus(emp)} className="text-red-600 hover:text-red-800"><UserX className="w-4 h-4 inline" /></button>
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
            <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">{editing ? t('employees.updated') : t('employees.created')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label dark:text-gray-300">{t('customers.firstName')}</label><input className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></div>
                <div><label className="label dark:text-gray-300">{t('customers.lastName')}</label><input className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></div>
              </div>
              {!editing && (
                <div><label className="label dark:text-gray-300">{t('employees.email')}</label><input type="email" className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
              )}
              {!editing && (
                <div><label className="label dark:text-gray-300">{t('login.password')}</label><input type="password" className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} /></div>
              )}
              <div>
                <label className="label dark:text-gray-300">{t('employees.role')}</label>
                <select className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="SALES">SALES</option>
                  <option value="PRODUCTION">PRODUCTION</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div><label className="label dark:text-gray-300">{t('common.phone')}</label><input className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
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
