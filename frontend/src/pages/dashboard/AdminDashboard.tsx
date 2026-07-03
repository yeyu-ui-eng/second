import { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import { TrendingUp, ShoppingBag, DollarSign, Clock, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useI18n } from '../../i18n/I18nContext';

const COLORS = ['#4c6ef5', '#fab005', '#40c057', '#fa5252', '#7950f2'];

export default function AdminDashboard() {
  const { t } = useI18n();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/admin').then(({ data }) => {
      setData(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!data) return <p className="text-gray-500 dark:text-gray-400">{t('dashboard.failed')}</p>;

  const revenueChartData = Object.entries(data.revenueByMonth || {}).map(([month, value]) => ({
    month, revenue: value as number,
  }));

  const stats = [
    { label: t('dashboard.totalRevenue'), value: formatCurrency(data.summary?.totalSales || 0), icon: DollarSign, color: 'bg-green-500' },
    { label: t('dashboard.today'), value: formatCurrency(data.summary?.dailySales?.total || 0), icon: TrendingUp, color: 'bg-blue-500' },
    { label: t('dashboard.thisWeek'), value: formatCurrency(data.summary?.weeklySales?.total || 0), icon: ShoppingBag, color: 'bg-purple-500' },
    { label: t('dashboard.thisMonth'), value: formatCurrency(data.summary?.monthlySales?.total || 0), icon: Clock, color: 'bg-orange-500' },
    { label: t('dashboard.inProduction'), value: data.production?.inProgress || 0, icon: Package, color: 'bg-yellow-500' },
    { label: t('dashboard.completed'), value: data.production?.completed || 0, icon: CheckCircle, color: 'bg-green-500' },
    { label: t('dashboard.pending'), value: data.production?.pending || 0, icon: AlertCircle, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-gray-100">{t('dashboard.adminTitle')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('dashboard.adminSubtitle')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card dark:bg-gray-900 dark:border-gray-800 p-4">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold dark:text-gray-100">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card dark:bg-gray-900 dark:border-gray-800">
          <div className="card-header dark:border-gray-800"><h3 className="font-semibold dark:text-gray-100">{t('dashboard.revenueTrend')}</h3></div>
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

        <div className="card dark:bg-gray-900 dark:border-gray-800">
          <div className="card-header dark:border-gray-800"><h3 className="font-semibold dark:text-gray-100">{t('dashboard.salesByEmployee')}</h3></div>
          <div className="card-body">
            <div className="space-y-3">
              {data.salesByEmployee?.map((emp: any) => (
                <div key={emp.userId} className="flex items-center justify-between">
                  <span className="text-sm font-medium dark:text-gray-200">{emp.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{emp.orders} {t('dashboard.orders')}</span>
                    <span className="text-sm font-semibold dark:text-gray-100">{formatCurrency(emp.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card dark:bg-gray-900 dark:border-gray-800">
        <div className="card-header dark:border-gray-800"><h3 className="font-semibold dark:text-gray-100">{t('dashboard.recentOrders')}</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('dashboard.order')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('dashboard.customer')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('dashboard.product')}</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('orders.amount')}</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('orders.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {data.recentOrders?.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 font-medium dark:text-gray-200">{order.orderNumber}</td>
                  <td className="px-6 py-4 dark:text-gray-300">{order.customer?.firstName} {order.customer?.lastName}</td>
                  <td className="px-6 py-4 dark:text-gray-300">{order.product?.name}</td>
                  <td className="px-6 py-4 text-right dark:text-gray-200">{formatCurrency(order.totalPrice)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="badge-blue">{t(`status.${order.status}`)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
