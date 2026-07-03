import { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import { TrendingUp, ShoppingBag, DollarSign, Clock, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#4c6ef5', '#fab005', '#40c057', '#fa5252', '#7950f2'];

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/admin').then(({ data }) => {
      setData(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!data) return <p className="text-gray-500">Failed to load dashboard.</p>;

  const revenueChartData = Object.entries(data.revenueByMonth || {}).map(([month, value]) => ({
    month,
    revenue: value as number,
  }));

  const statusChartData = (data.summary?.totalOrders > 0 ? data.salesByEmployee : []).slice(0, 5);

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(data.summary?.totalSales || 0), icon: DollarSign, color: 'bg-green-500' },
    { label: 'Today', value: formatCurrency(data.summary?.dailySales?.total || 0), icon: TrendingUp, color: 'bg-blue-500' },
    { label: 'This Week', value: formatCurrency(data.summary?.weeklySales?.total || 0), icon: ShoppingBag, color: 'bg-purple-500' },
    { label: 'This Month', value: formatCurrency(data.summary?.monthlySales?.total || 0), icon: Clock, color: 'bg-orange-500' },
    { label: 'In Production', value: data.production?.inProgress || 0, icon: Package, color: 'bg-yellow-500' },
    { label: 'Completed', value: data.production?.completed || 0, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Pending', value: data.production?.pending || 0, icon: AlertCircle, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500">Overview of sales and production</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header"><h3 className="font-semibold">Revenue Trend</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#4c6ef5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="font-semibold">Sales by Employee</h3></div>
          <div className="card-body">
            <div className="space-y-3">
              {data.salesByEmployee?.map((emp: any) => (
                <div key={emp.userId} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{emp.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{emp.orders} orders</span>
                    <span className="text-sm font-semibold">{formatCurrency(emp.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="font-semibold">Recent Orders</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Order</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Customer</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Product</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Amount</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.recentOrders?.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                  <td className="px-6 py-4">{order.customer?.firstName} {order.customer?.lastName}</td>
                  <td className="px-6 py-4">{order.product?.name}</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(order.totalPrice)}</td>
                  <td className="px-6 py-4 text-center"><span className="badge-blue">{order.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
