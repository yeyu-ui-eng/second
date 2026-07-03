import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrency, formatDate, statusColor } from '../../utils/helpers';
import { ArrowLeft, Edit3, Trash2 } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import toast from 'react-hot-toast';

const orderStatuses = ['NEW', 'CONFIRMED', 'IN_PRODUCTION', 'READY', 'DELIVERED', 'CANCELLED'];
const paymentStatuses = ['PENDING', 'PARTIAL', 'PAID', 'REFUNDED'];

export default function OrderDetail() {
  const { t } = useI18n();
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
      toast.success(t('orderDetail.updated'));
    } catch (err: any) {
      toast.error(err.response?.data?.error || t('orderDetail.updateFailed'));
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('common.confirmDelete'))) return;
    try {
      await api.delete(`/orders/${id}`);
      toast.success(t('orderDetail.deleted'));
      navigate('/orders');
    } catch { toast.error(t('orderDetail.deleteFailed')); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!order) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/orders')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><ArrowLeft className="w-5 h-5 dark:text-gray-300" /></button>
          <div>
            <h1 className="text-2xl font-bold dark:text-gray-100">{order.orderNumber}</h1>
            <p className="text-gray-500 dark:text-gray-400">{t('orderDetail.created')} {formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="btn-secondary dark:border-gray-700 dark:text-gray-300"><Edit3 className="w-4 h-4 mr-1" /> {t('orderDetail.edit')}</button>
          <button onClick={handleDelete} className="btn-danger"><Trash2 className="w-4 h-4 mr-1" /> {t('orderDetail.delete')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card dark:bg-gray-900 dark:border-gray-800">
            <div className="card-header dark:border-gray-800"><h3 className="font-semibold dark:text-gray-100">{t('orderDetail.orderDetails')}</h3></div>
            <div className="card-body">
              {editing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label dark:text-gray-300">{t('orderDetail.status')}</label>
                      <select className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        {orderStatuses.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label dark:text-gray-300">{t('orderDetail.payment')}</label>
                      <select className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}>
                        {paymentStatuses.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="label dark:text-gray-300">{t('orderDetail.quantity')}</label><input type="number" className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} /></div>
                    <div><label className="label dark:text-gray-300">{t('orderDetail.totalPrice')}</label><input type="number" className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" step="0.01" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: parseFloat(e.target.value) || 0 })} /></div>
                  </div>
                  <div><label className="label dark:text-gray-300">{t('common.notes')}</label><textarea className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                  <div className="flex gap-2"><button type="submit" className="btn-primary">{t('orderDetail.save')}</button><button type="button" onClick={() => setEditing(false)} className="btn-secondary dark:border-gray-700">{t('common.cancel')}</button></div>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div><p className="text-sm text-gray-500 dark:text-gray-400">{t('orderDetail.status')}</p><span className={statusColor(order.status)}>{t(`status.${order.status}`)}</span></div>
                  <div><p className="text-sm text-gray-500 dark:text-gray-400">{t('orderDetail.payment')}</p><span className={statusColor(order.paymentStatus)}>{t(`status.${order.paymentStatus}`)}</span></div>
                  <div><p className="text-sm text-gray-500 dark:text-gray-400">{t('orderDetail.quantity')}</p><p className="font-medium dark:text-gray-200">{order.quantity}</p></div>
                  <div><p className="text-sm text-gray-500 dark:text-gray-400">{t('orderDetail.totalPrice')}</p><p className="font-medium dark:text-gray-200">{formatCurrency(order.totalPrice)}</p></div>
                  {order.size && <div><p className="text-sm text-gray-500 dark:text-gray-400">{t('orderDetail.size')}</p><p className="font-medium dark:text-gray-200">{order.size}</p></div>}
                  {order.color && <div><p className="text-sm text-gray-500 dark:text-gray-400">{t('orderDetail.color')}</p><p className="font-medium dark:text-gray-200">{order.color}</p></div>}
                  {order.dueDate && <div><p className="text-sm text-gray-500 dark:text-gray-400">{t('orderDetail.dueDate')}</p><p className="font-medium dark:text-gray-200">{formatDate(order.dueDate)}</p></div>}
                  {order.deliveredAt && <div><p className="text-sm text-gray-500 dark:text-gray-400">{t('orderDetail.delivered')}</p><p className="font-medium dark:text-gray-200">{formatDate(order.deliveredAt)}</p></div>}
                  {order.notes && <div className="col-span-2"><p className="text-sm text-gray-500 dark:text-gray-400">{t('orderDetail.notes')}</p><p className="font-medium dark:text-gray-200">{order.notes}</p></div>}
                </div>
              )}
            </div>
          </div>

          <div className="card dark:bg-gray-900 dark:border-gray-800">
            <div className="card-header dark:border-gray-800"><h3 className="font-semibold dark:text-gray-100">{t('orderDetail.productionTasks')}</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('orderDetail.stage')}</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('orderDetail.assignedTo')}</th>
                    <th className="text-center px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('orderDetail.started')}</th>
                    <th className="text-center px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('orderDetail.completed')}</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('orderDetail.notes')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {order.productionTasks?.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4 text-gray-500 dark:text-gray-400">{t('orderDetail.noTasks')}</td></tr>
                  ) : order.productionTasks?.map((task: any) => (
                    <tr key={task.id}>
                      <td className="px-6 py-4"><span className={statusColor(task.stage)}>{t(`status.${task.stage}`)}</span></td>
                      <td className="px-6 py-4 dark:text-gray-300">{task.assignedUser?.firstName} {task.assignedUser?.lastName}</td>
                      <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">{task.startedAt ? formatDate(task.startedAt) : '-'}</td>
                      <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">{task.completedAt ? formatDate(task.completedAt) : '-'}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{task.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card dark:bg-gray-900 dark:border-gray-800">
            <div className="card-header dark:border-gray-800"><h3 className="font-semibold dark:text-gray-100">{t('orderDetail.customerInfo')}</h3></div>
            <div className="card-body space-y-2">
              <p className="font-medium dark:text-gray-200">{order.customer?.firstName} {order.customer?.lastName}</p>
              {order.customer?.email && <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer.email}</p>}
              {order.customer?.phone && <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer.phone}</p>}
              {order.customer?.city && <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer.city}</p>}
            </div>
          </div>

          <div className="card dark:bg-gray-900 dark:border-gray-800">
            <div className="card-header dark:border-gray-800"><h3 className="font-semibold dark:text-gray-100">{t('orderDetail.productInfo')}</h3></div>
            <div className="card-body space-y-2">
              <p className="font-medium dark:text-gray-200">{order.product?.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('orderDetail.sku')} {order.product?.sku}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('orderDetail.category')} {order.product?.category}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('orderDetail.price')} {formatCurrency(order.product?.price)}</p>
            </div>
          </div>

          <div className="card dark:bg-gray-900 dark:border-gray-800">
            <div className="card-header dark:border-gray-800"><h3 className="font-semibold dark:text-gray-100">{t('orderDetail.salesRep')}</h3></div>
            <div className="card-body">
              <p className="font-medium dark:text-gray-200">{order.user?.firstName} {order.user?.lastName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{order.user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
