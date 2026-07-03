import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

export default function Settings() {
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
      toast.success('Settings saved');
    } catch { toast.error('Failed to save'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-500">Configure system settings</p>
        </div>
        <button onClick={handleSave} className="btn-primary"><Save className="w-4 h-4 mr-1" /> Save Changes</button>
      </div>

      <div className="card max-w-2xl">
        <div className="card-header"><h3 className="font-semibold">Company Settings</h3></div>
        <div className="card-body space-y-4">
          <div>
            <label className="label">Company Name</label>
            <input className="input" value={settings.company_name || ''} onChange={(e) => setSettings({ ...settings, company_name: e.target.value })} />
          </div>
          <div>
            <label className="label">Commission Rate (%)</label>
            <input type="number" className="input" value={settings.commission_rate || '5'} onChange={(e) => setSettings({ ...settings, commission_rate: e.target.value })} />
          </div>
          <div>
            <label className="label">Currency</label>
            <select className="input" value={settings.currency || 'USD'} onChange={(e) => setSettings({ ...settings, currency: e.target.value })}>
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
