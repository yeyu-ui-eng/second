import { useState } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#4c6ef5', '#fab005', '#40c057', '#fa5252', '#7950f2', '#fd7e14'];

export default function Reports() {
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
    } catch { toast.error('Failed to load report'); }
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
      toast.success('Report exported');
    } catch { toast.error('Export failed'); }
  };

  const tabs = [
    { id: 'sales', label: 'Sales Report' },
    { id: 'performance', label: 'Employee Performance' },
    { id: 'revenue', label: 'Revenue Report' },
    { id: 'production-efficiency', label: 'Production Efficiency' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-gray-500">Generate and export reports</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-white shadow-sm text-primary-700' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <input type="date" className="input text-sm w-auto" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
              <span className="text-gray-400">to</span>
              <input type="date" className="input text-sm w-auto" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
              <button onClick={() => fetchReport(activeTab)} className="btn-primary btn-sm">Apply</button>
              <button onClick={() => exportCSV(activeTab === 'sales' ? 'orders' : 'sales')} className="btn-secondary btn-sm"><Download className="w-4 h-4 mr-1" /> Export</button>
            </div>
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
          ) : !data ? (
            <p className="text-center text-gray-500 py-12">Select a report type to view data</p>
          ) : activeTab === 'sales' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="card p-4 text-center"><p className="text-2xl font-bold">{formatCurrency(data.summary?.totalRevenue || 0)}</p><p className="text-sm text-gray-500">Total Revenue</p></div>
                <div className="card p-4 text-center"><p className="text-2xl font-bold">{data.summary?.totalOrders || 0}</p><p className="text-sm text-gray-500">Total Orders</p></div>
                <div className="card p-4 text-center"><p className="text-2xl font-bold">{formatCurrency(data.summary?.avgOrderValue || 0)}</p><p className="text-sm text-gray-500">Avg Order Value</p></div>
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
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Rank</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Employee</th>
                    <th className="text-right px-6 py-3 font-medium text-gray-500">Orders</th>
                    <th className="text-right px-6 py-3 font-medium text-gray-500">Revenue</th>
                    <th className="text-right px-6 py-3 font-medium text-gray-500">Avg Value</th>
                    <th className="text-right px-6 py-3 font-medium text-gray-500">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.employees?.map((emp: any) => (
                    <tr key={emp.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">#{emp.rank}</td>
                      <td className="px-6 py-4">{emp.name}</td>
                      <td className="px-6 py-4 text-right">{emp.totalOrders}</td>
                      <td className="px-6 py-4 text-right font-medium">{formatCurrency(emp.revenue)}</td>
                      <td className="px-6 py-4 text-right">{formatCurrency(emp.avgOrderValue)}</td>
                      <td className="px-6 py-4 text-right">{formatCurrency(emp.commission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'revenue' ? (
            <div className="space-y-4">
              <div className="card p-4"><p className="text-3xl font-bold">{formatCurrency(data.totalRevenue || 0)}</p><p className="text-sm text-gray-500">Total Revenue</p></div>
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
              <div className="card p-4 text-center"><p className="text-2xl font-bold">{data.totalCompleted || 0}</p><p className="text-sm text-gray-500">Completed</p></div>
              <div className="card p-4 text-center"><p className="text-2xl font-bold">{data.avgCompletionTimeHours || 0}h</p><p className="text-sm text-gray-500">Avg Time</p></div>
              <div className="card p-4 text-center"><p className="text-2xl font-bold">{data.totalTasks || 0}</p><p className="text-sm text-gray-500">Total Tasks</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
