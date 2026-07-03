import { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import { DollarSign, ShoppingBag, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';

export default function SalesDashboard() {
  const { t } = useI18n();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/sales').then(({ data }) => {
      setData(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!data) return <p className="text-gray-500 dark:text-gray-400">{t('dashboard.failed')}</p>;

  const stats = [
    { label: t('dashboard.totalSales'), value: formatCurrency(data.totalSales || 0), icon: DollarSign, color: 'bg-green-500' },
    { label: t('dashboard.monthlyRevenue'), value: formatCurrency(data.monthlyPerformance?.revenue || 0), icon: TrendingUp, color: 'bg-blue-500' },
    { label: t('dashboard.commission'), value: formatCurrency(data.commission || 0), icon: DollarSign, color: 'bg-purple-500' },
    { label: t('dashboard.activeOrders'), value: data.activeOrders || 0, icon: Clock, color: 'bg-yellow-500' },
    { label: t('dashboard.completed'), value: data.completedOrders || 0, icon: CheckCircle, color: 'bg-green-500' },
    { label: t('dashboard.totalOrders'), value: data.totalOrders || 0, icon: ShoppingBag, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-gray-100">{t('dashboard.salesTitle')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('dashboard.salesSubtitle')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

      <div className="card dark:bg-gray-900 dark:border-gray-800">
        <div className="card-header dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold dark:text-gray-100">{t('dashboard.myRecentOrders')}</h3>
          <Link to="/orders" className="text-sm text-primary-600 hover:underline">{t('dashboard.viewAll')}</Link>
        </div>
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
                  <td className="px-6 py-4 text-center"><span className="badge-blue">{t(`status.${order.status}`)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
