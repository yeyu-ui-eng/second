import { useState } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import toast from 'react-hot-toast';

const COLORS = ['#4c6ef5', '#fab005', '#40c057', '#fa5252', '#7950f2', '#fd7e14'];

export default function Reports() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async (type: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      const { data: result } = await api.get(`/reports/${type}?${params}`);
      setData(result);
    } catch { toast.error(t('reports.failed')); }
    setLoading(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setData(null);
    fetchReport(tab);
  };

  const exportCSV = async (type: string) => {
    try {
      const params = new URLSearchParams({ type });
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      const { data: blob } = await api.get(`/reports/export?${params}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report.csv`;
      a.click();
      toast.success(t('reports.exported'));
    } catch { toast.error(t('reports.exportFailed')); }
  };

  const tabs = [
    { id: 'sales', label: t('reports.sales') },
    { id: 'performance', label: t('reports.performance') },
    { id: 'revenue', label: t('reports.revenueTab') },
    { id: 'production-efficiency', label: t('reports.productionEfficiency') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-gray-100">{t('reports.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('reports.subtitle')}</p>
        </div>
      </div>

      <div className="card dark:bg-gray-900 dark:border-gray-800">
        <div className="card-header dark:border-gray-800">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <input type="date" className="input text-sm w-auto dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
              <span className="text-gray-400">{t('reports.to')}</span>
              <input type="date" className="input text-sm w-auto dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
              <button onClick={() => fetchReport(activeTab)} className="btn-primary btn-sm">{t('common.apply')}</button>
              <button onClick={() => exportCSV(activeTab === 'sales' ? 'orders' : 'sales')} className="btn-secondary btn-sm dark:border-gray-700 dark:text-gray-300"><Download className="w-4 h-4 mr-1" /> {t('reports.export')}</button>
            </div>
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
          ) : !data ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">{t('reports.selectReport')}</p>
          ) : activeTab === 'sales' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="card dark:bg-gray-900 dark:border-gray-800 p-4 text-center"><p className="text-2xl font-bold dark:text-gray-100">{formatCurrency(data.summary?.totalRevenue || 0)}</p><p className="text-sm text-gray-500">{t('reports.totalRevenue')}</p></div>
                <div className="card dark:bg-gray-900 dark:border-gray-800 p-4 text-center"><p className="text-2xl font-bold dark:text-gray-100">{data.summary?.totalOrders || 0}</p><p className="text-sm text-gray-500">{t('reports.totalOrders')}</p></div>
                <div className="card dark:bg-gray-900 dark:border-gray-800 p-4 text-center"><p className="text-2xl font-bold dark:text-gray-100">{formatCurrency(data.summary?.avgOrderValue || 0)}</p><p className="text-sm text-gray-500">{t('reports.avgOrderValue')}</p></div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.byEmployee || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="#4c6ef5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : activeTab === 'performance' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('reports.rank')}</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('reports.employee')}</th>
                    <th className="text-right px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('reports.orders')}</th>
                    <th className="text-right px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('reports.revenue')}</th>
                    <th className="text-right px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('reports.avgValue')}</th>
                    <th className="text-right px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('reports.commission')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {data.employees?.map((emp: any) => (
                    <tr key={emp.userId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 font-medium dark:text-gray-200">#{emp.rank}</td>
                      <td className="px-6 py-4 dark:text-gray-300">{emp.name}</td>
                      <td className="px-6 py-4 text-right dark:text-gray-200">{emp.totalOrders}</td>
                      <td className="px-6 py-4 text-right font-medium dark:text-gray-100">{formatCurrency(emp.revenue)}</td>
                      <td className="px-6 py-4 text-right dark:text-gray-200">{formatCurrency(emp.avgOrderValue)}</td>
                      <td className="px-6 py-4 text-right dark:text-gray-200">{formatCurrency(emp.commission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'revenue' ? (
            <div className="space-y-4">
              <div className="card dark:bg-gray-900 dark:border-gray-800 p-4"><p className="text-3xl font-bold dark:text-gray-100">{formatCurrency(data.totalRevenue || 0)}</p><p className="text-sm text-gray-500">{t('reports.totalRevenue')}</p></div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={Object.entries(data.monthly || {}).map(([month, value]) => ({ month, revenue: value }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="revenue" stroke="#4c6ef5" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="card dark:bg-gray-900 dark:border-gray-800 p-4 text-center"><p className="text-2xl font-bold dark:text-gray-100">{data.totalCompleted || 0}</p><p className="text-sm text-gray-500">{t('reports.completed')}</p></div>
              <div className="card dark:bg-gray-900 dark:border-gray-800 p-4 text-center"><p className="text-2xl font-bold dark:text-gray-100">{data.avgCompletionTimeHours || 0}h</p><p className="text-sm text-gray-500">{t('reports.avgTime')}</p></div>
              <div className="card dark:bg-gray-900 dark:border-gray-800 p-4 text-center"><p className="text-2xl font-bold dark:text-gray-100">{data.totalTasks || 0}</p><p className="text-sm text-gray-500">{t('reports.totalTasks')}</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
