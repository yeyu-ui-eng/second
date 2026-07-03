import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useI18n } from '../../i18n/I18nContext';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

export default function Settings() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/settings').then(({ data }) => {
      setSettings(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await api.put('/settings', settings);
      toast.success(t('settings.saved'));
    } catch { toast.error(t('settings.saveFailed')); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-gray-100">{t('settings.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('settings.subtitle')}</p>
        </div>
        <button onClick={handleSave} className="btn-primary"><Save className="w-4 h-4 mr-1" /> {t('common.saveChanges')}</button>
      </div>

      <div className="card dark:bg-gray-900 dark:border-gray-800 max-w-2xl">
        <div className="card-header dark:border-gray-800"><h3 className="font-semibold dark:text-gray-100">{t('settings.company')}</h3></div>
        <div className="card-body space-y-4">
          <div>
            <label className="label dark:text-gray-300">{t('settings.companyName')}</label>
            <input className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={settings.company_name || ''} onChange={(e) => setSettings({ ...settings, company_name: e.target.value })} />
          </div>
          <div>
            <label className="label dark:text-gray-300">{t('settings.commissionRate')}</label>
            <input type="number" className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={settings.commission_rate || '5'} onChange={(e) => setSettings({ ...settings, commission_rate: e.target.value })} />
          </div>
          <div>
            <label className="label dark:text-gray-300">{t('settings.currency')}</label>
            <select className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={settings.currency || 'USD'} onChange={(e) => setSettings({ ...settings, currency: e.target.value })}>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
