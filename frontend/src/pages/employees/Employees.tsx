import { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { Plus, Edit3, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Employees() {
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
        toast.success('Employee updated');
      } else {
        await api.post('/users', form);
        toast.success('Employee created');
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleToggleStatus = async (emp: any) => {
    if (!confirm(`${emp.isActive ? 'Disable' : 'Enable'} ${emp.firstName} ${emp.lastName}?`)) return;
    try {
      await api.put(`/users/${emp.id}`, { isActive: !emp.isActive });
      toast.success(`User ${emp.isActive ? 'disabled' : 'enabled'}`);
      fetchEmployees();
    } catch { toast.error('Failed'); }
  };

  const roleColor = (role: string) => {
    const colors: Record<string, string> = { ADMIN: 'badge-red', SALES: 'badge-blue', PRODUCTION: 'badge-green' };
    return colors[role] || 'badge-gray';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-gray-500">Manage system users</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4 mr-1" /> Add Employee</button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Email</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500">Role</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Joined</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
                : employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{emp.firstName} {emp.lastName}</td>
                      <td className="px-6 py-4">{emp.email}</td>
                      <td className="px-6 py-4 text-center"><span className={roleColor(emp.role)}>{emp.role}</span></td>
                      <td className="px-6 py-4 text-center">
                        <span className={emp.isActive ? 'badge-green' : 'badge-red'}>{emp.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(emp.createdAt)}</td>
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit Employee' : 'Add Employee'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">First Name</label><input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></div>
                <div><label className="label">Last Name</label><input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></div>
              </div>
              <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={!!editing} /></div>
              {!editing && <div><label className="label">Password</label><input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} /></div>}
              <div><label className="label">Role</label><select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="SALES">Sales</option><option value="PRODUCTION">Production</option><option value="ADMIN">Admin</option></select></div>
              <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
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
