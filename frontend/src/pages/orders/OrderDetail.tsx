import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrency, formatDate, formatDateTime, statusColor } from '../../utils/helpers';
import { ArrowLeft, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => {
      setOrder(data);
      setForm({
        status: data.status, paymentStatus: data.paymentStatus,
        quantity: data.quantity, unitPrice: data.unitPrice, notes: data.notes || '',
      });
      setLoading(false);
    }).catch(() => { setLoading(false); navigate('/orders'); });
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/orders/${id}`, form);
      setOrder(data);
      setEditing(false);
      toast.success('Order updated');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this order?')) return;
    try {
      await api.delete(`/orders/${id}`);
      toast.success('Order deleted');
      navigate('/orders');
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!order) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/orders')} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
            <p className="text-gray-500">Created {formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="btn-secondary"><Edit3 className="w-4 h-4 mr-1" /> Edit</button>
          <button onClick={handleDelete} className="btn-danger"><Trash2 className="w-4 h-4 mr-1" /> Delete</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-header"><h3 className="font-semibold">Order Details</h3></div>
            <div className="card-body">
              {editing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Status</label>
                      <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        {['NEW', 'CONFIRMED', 'IN_PRODUCTION', 'READY', 'DELIVERED', 'CANCELLED'].map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Payment</label>
                      <select className="input" value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}>
                        {['PENDING', 'PARTIAL', 'PAID', 'REFUNDED'].map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="label">Quantity</label><input type="number" className="input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} /></div>
                    <div><label className="label">Unit Price</label><input type="number" className="input" step="0.01" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: parseFloat(e.target.value) || 0 })} /></div>
                  </div>
                  <div><label className="label">Notes</label><textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                  <div className="flex gap-2"><button type="submit" className="btn-primary">Save</button><button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button></div>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div><p className="text-sm text-gray-500">Status</p><span className={statusColor(order.status)}>{order.status.replace('_', ' ')}</span></div>
                  <div><p className="text-sm text-gray-500">Payment</p><span className={statusColor(order.paymentStatus)}>{order.paymentStatus}</span></div>
                  <div><p className="text-sm text-gray-500">Quantity</p><p className="font-medium">{order.quantity}</p></div>
                  <div><p className="text-sm text-gray-500">Total Price</p><p className="font-medium">{formatCurrency(order.totalPrice)}</p></div>
                  {order.size && <div><p className="text-sm text-gray-500">Size</p><p className="font-medium">{order.size}</p></div>}
                  {order.color && <div><p className="text-sm text-gray-500">Color</p><p className="font-medium">{order.color}</p></div>}
                  {order.dueDate && <div><p className="text-sm text-gray-500">Due Date</p><p className="font-medium">{formatDate(order.dueDate)}</p></div>}
                  {order.deliveredAt && <div><p className="text-sm text-gray-500">Delivered</p><p className="font-medium">{formatDate(order.deliveredAt)}</p></div>}
                  {order.notes && <div className="col-span-2"><p className="text-sm text-gray-500">Notes</p><p className="font-medium">{order.notes}</p></div>}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="font-semibold">Production Tasks</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Stage</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Assigned To</th>
                    <th className="text-center px-6 py-3 font-medium text-gray-500">Started</th>
                    <th className="text-center px-6 py-3 font-medium text-gray-500">Completed</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.productionTasks?.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4 text-gray-500">No production tasks yet</td></tr>
                  ) : order.productionTasks?.map((task: any) => (
                    <tr key={task.id}>
                      <td className="px-6 py-4"><span className={statusColor(task.stage)}>{task.stage}</span></td>
                      <td className="px-6 py-4">{task.assignedUser?.firstName} {task.assignedUser?.lastName}</td>
                      <td className="px-6 py-4 text-center text-gray-500">{task.startedAt ? formatDate(task.startedAt) : '-'}</td>
                      <td className="px-6 py-4 text-center text-gray-500">{task.completedAt ? formatDate(task.completedAt) : '-'}</td>
                      <td className="px-6 py-4 text-gray-500">{task.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-header"><h3 className="font-semibold">Customer</h3></div>
            <div className="card-body space-y-2">
              <p className="font-medium">{order.customer?.firstName} {order.customer?.lastName}</p>
              {order.customer?.email && <p className="text-sm text-gray-500">{order.customer.email}</p>}
              {order.customer?.phone && <p className="text-sm text-gray-500">{order.customer.phone}</p>}
              {order.customer?.city && <p className="text-sm text-gray-500">{order.customer.city}</p>}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="font-semibold">Product</h3></div>
            <div className="card-body space-y-2">
              <p className="font-medium">{order.product?.name}</p>
              <p className="text-sm text-gray-500">SKU: {order.product?.sku}</p>
              <p className="text-sm text-gray-500">Category: {order.product?.category}</p>
              <p className="text-sm text-gray-500">Price: {formatCurrency(order.product?.price)}</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="font-semibold">Sales Rep</h3></div>
            <div className="card-body">
              <p className="font-medium">{order.user?.firstName} {order.user?.lastName}</p>
              <p className="text-sm text-gray-500">{order.user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
