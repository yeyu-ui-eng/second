import { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { ClipboardList, Play, CheckCircle, AlertTriangle } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

export default function ProductionDashboardView() {
  const { t } = useI18n();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/production').then(({ data }) => {
      setData(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!data) return <p className="text-gray-500 dark:text-gray-400">{t('dashboard.failed')}</p>;

  const stats = [
    { label: t('dashboard.assigned'), value: data.assigned || 0, icon: ClipboardList, color: 'bg-blue-500' },
    { label: t('dashboard.inProgress'), value: data.inProgress || 0, icon: Play, color: 'bg-yellow-500' },
    { label: t('dashboard.completed'), value: data.completed || 0, icon: CheckCircle, color: 'bg-green-500' },
    { label: t('dashboard.delayed'), value: data.delayed || 0, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  const stageColor = (stage: string) => {
    const colors: Record<string, string> = {
      WAITING: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
      ASSIGNED: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
      CUTTING: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300',
      SEWING: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300',
      QUALITY_CHECK: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300',
      PACKAGING: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300',
      READY: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
      DELIVERED: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
    };
    return colors[stage] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-gray-100">{t('dashboard.productionTitle')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('dashboard.productionSubtitle')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <div className="card-header dark:border-gray-800"><h3 className="font-semibold dark:text-gray-100">{t('dashboard.recentTasks')}</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('dashboard.order')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('dashboard.product')}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('dashboard.customer')}</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('dashboard.stage')}</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('dashboard.started')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {data.recentTasks?.map((task: any) => (
                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 font-medium dark:text-gray-200">{task.order?.orderNumber}</td>
                  <td className="px-6 py-4 dark:text-gray-300">{task.order?.product?.name}</td>
                  <td className="px-6 py-4 dark:text-gray-300">{task.order?.customer?.firstName} {task.order?.customer?.lastName}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColor(task.stage)}`}>
                      {t(`status.${task.stage}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">{task.startedAt ? formatDate(task.startedAt) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
