import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { formatDate, statusColor } from '../../utils/helpers';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const stages = ['WAITING', 'ASSIGNED', 'CUTTING', 'SEWING', 'QUALITY_CHECK', 'PACKAGING', 'READY', 'DELIVERED'];

export default function Production() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({ orderId: '', assignedTo: '' });
  const [stageFilter, setStageFilter] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const params = new URLSearchParams({ limit: '50' });
        if (stageFilter) params.append('stage', stageFilter);
        const { data } = await api.get(`/production?${params}`);
        setTasks(data.data);
      } else {
        const { data } = await api.get('/production/my-tasks');
        setTasks(data);
      }
    } catch {}
    setLoading(false);
  };

  const fetchAssignData = async () => {
    const [ordersRes, usersRes] = await Promise.all([
      api.get('/orders?limit=100&status=NEW'),
      api.get('/users?limit=100&role=PRODUCTION'),
    ]);
    setUsers(usersRes.data.data);
    setAssignForm({ ...assignForm, orderId: ordersRes.data.data[0]?.id || '' });
    setShowAssign(true);
  };

  useEffect(() => { fetchTasks(); }, [stageFilter]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/production/assign', assignForm);
      toast.success('Task assigned');
      setShowAssign(false);
      fetchTasks();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Assignment failed'); }
  };

  const handleStageUpdate = async (taskId: string, stage: string) => {
    try {
      await api.put(`/production/${taskId}`, { stage });
      toast.success(`Stage updated to ${stage}`);
      fetchTasks();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Update failed'); }
  };

  const nextStage = (current: string) => {
    const idx = stages.indexOf(current);
    return idx < stages.length - 1 ? stages[idx + 1] : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Production</h1>
          <p className="text-gray-500">Manage production workflow</p>
        </div>
        {isAdmin && (
          <button onClick={fetchAssignData} className="btn-primary"><Plus className="w-4 h-4 mr-1" /> Assign Task</button>
        )}
      </div>

      {isAdmin && (
        <div className="card p-4">
          <select className="input w-auto" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
            <option value="">All Stages</option>
            {stages.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Order #</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Product</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Customer</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Assigned To</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500">Stage</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500">Started</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? <tr><td colSpan={7} className="text-center py-8">Loading...</td></tr>
                : tasks.length === 0 ? <tr><td colSpan={7} className="text-center py-8 text-gray-500">No tasks</td></tr>
                : tasks.map((task: any) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{task.order?.orderNumber}</td>
                      <td className="px-6 py-4">{task.order?.product?.name}</td>
                      <td className="px-6 py-4">{task.order?.customer?.firstName} {task.order?.customer?.lastName}</td>
                      <td className="px-6 py-4">{task.assignedUser?.firstName} {task.assignedUser?.lastName}</td>
                      <td className="px-6 py-4 text-center"><span className={statusColor(task.stage)}>{task.stage.replace('_', ' ')}</span></td>
                      <td className="px-6 py-4 text-center text-gray-500">{task.startedAt ? formatDate(task.startedAt) : '-'}</td>
                      <td className="px-6 py-4 text-center">
                        {task.stage !== 'DELIVERED' && task.stage !== 'READY' && nextStage(task.stage) && (
                          <button onClick={() => handleStageUpdate(task.id, nextStage(task.stage)!)} className="btn-primary btn-sm">
                            Move to {nextStage(task.stage)!.replace('_', ' ')}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAssign && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAssign(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">Assign Production Task</h2>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="label">Order</label>
                <select className="input" value={assignForm.orderId} onChange={(e) => setAssignForm({ ...assignForm, orderId: e.target.value })} required>
                  <option value="">Select order</option>
                  {tasks.filter((t: any) => t.order).map((t: any) => (
                    <option key={t.order.id} value={t.order.id}>{t.order.orderNumber} - {t.order.product?.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Production Staff</label>
                <select className="input" value={assignForm.assignedTo} onChange={(e) => setAssignForm({ ...assignForm, assignedTo: e.target.value })} required>
                  <option value="">Select staff</option>
                  {users.map((u: any) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowAssign(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
