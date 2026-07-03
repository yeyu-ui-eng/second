import { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { ClipboardList, Play, CheckCircle, AlertTriangle, Wrench } from 'lucide-react';

export default function ProductionDashboardView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/production').then(({ data }) => {
      setData(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!data) return <p className="text-gray-500">Failed to load dashboard.</p>;

  const stats = [
    { label: 'Assigned', value: data.assigned || 0, icon: ClipboardList, color: 'bg-blue-500' },
    { label: 'In Progress', value: data.inProgress || 0, icon: Play, color: 'bg-yellow-500' },
    { label: 'Completed', value: data.completed || 0, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Delayed', value: data.delayed || 0, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  const stageColor = (stage: string) => {
    const colors: Record<string, string> = {
      WAITING: 'bg-gray-100 text-gray-800',
      ASSIGNED: 'bg-blue-100 text-blue-800',
      CUTTING: 'bg-yellow-100 text-yellow-800',
      SEWING: 'bg-orange-100 text-orange-800',
      QUALITY_CHECK: 'bg-purple-100 text-purple-800',
      PACKAGING: 'bg-indigo-100 text-indigo-800',
      READY: 'bg-green-100 text-green-800',
      DELIVERED: 'bg-green-100 text-green-800',
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Production Dashboard</h1>
        <p className="text-gray-500">Your assigned production tasks</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      <div className="card">
        <div className="card-header"><h3 className="font-semibold">Recent Tasks</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Order</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Product</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Customer</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500">Stage</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.recentTasks?.map((task: any) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{task.order?.orderNumber}</td>
                  <td className="px-6 py-4">{task.order?.product?.name}</td>
                  <td className="px-6 py-4">{task.order?.customer?.firstName} {task.order?.customer?.lastName}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColor(task.stage)}`}>
                      {task.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500">{task.startedAt ? formatDate(task.startedAt) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
