import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrency, formatDate, statusColor } from '../../utils/helpers';
import { Plus, Search, Eye } from 'lucide-react';

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [form, setForm] = useState({ customerId: '', productId: '', quantity: 1, unitPrice: 0, size: '', color: '', dueDate: '', notes: '' });

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      const { data } = await api.get(`/orders?${params}`);
      setOrders(data.data);
      setPagination(data.pagination);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [status]);

  const handleSearch = () => fetchOrders(1);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/orders', form);
      setShowCreate(false);
      setForm({ customerId: '', productId: '', quantity: 1, unitPrice: 0, size: '', color: '', dueDate: '', notes: '' });
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create order');
    }
  };

  const openCreateModal = async () => {
    const [p, c] = await Promise.all([api.get('/products?limit=100'), api.get('/customers?limit=100')]);
    setProducts(p.data.data);
    setCustomers(c.data.data);
    setShowCreate(true);
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    setForm({ ...form, productId, unitPrice: product?.price || 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-gray-500">Manage customer orders</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          <Plus className="w-4 h-4 mr-1" /> New Order
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                className="input pl-9"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PRODUCTION">In Production</option>
            <option value="READY">Ready</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button onClick={handleSearch} className="btn-secondary">Search</button>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Order #</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Customer</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Product</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Amount</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500">Status</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500">Payment</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-500">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-500">No orders found</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                  <td className="px-6 py-4">{order.customer?.firstName} {order.customer?.lastName}</td>
                  <td className="px-6 py-4">{order.product?.name} x{order.quantity}</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(order.totalPrice)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={statusColor(order.status)}>{order.status.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={statusColor(order.paymentStatus)}>{order.paymentStatus}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(order.orderDate)}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => navigate(`/orders/${order.id}`)} className="text-primary-600 hover:text-primary-800">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button disabled={pagination.page <= 1} onClick={() => fetchOrders(pagination.page - 1)} className="btn-secondary btn-sm">Previous</button>
              <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchOrders(pagination.page + 1)} className="btn-secondary btn-sm">Next</button>
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">New Order</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Customer</label>
                <select className="input" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} required>
                  <option value="">Select customer</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Product</label>
                <select className="input" value={form.productId} onChange={(e) => handleProductSelect(e.target.value)} required>
                  <option value="">Select product</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Quantity</label>
                  <input type="number" className="input" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} required />
                </div>
                <div>
                  <label className="label">Unit Price</label>
                  <input type="number" className="input" step="0.01" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: parseFloat(e.target.value) || 0 })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Size</label>
                  <input className="input" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
                </div>
                <div>
                  <label className="label">Color</label>
                  <input className="input" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Due Date</label>
                <input type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
