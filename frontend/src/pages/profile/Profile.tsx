import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { useI18n } from '../../i18n/I18nContext';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';

export default function Profile() {
  const { t } = useI18n();
  const { user, loadUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', form);
      await loadUser();
      setEditing(false);
      toast.success(t('profile.updated'));
    } catch (err: any) { toast.error(err.response?.data?.error || t('profile.updateFailed')); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/change-password', passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setShowPassword(false);
      toast.success(t('profile.passwordChanged'));
    } catch (err: any) { toast.error(err.response?.data?.error || t('profile.passwordFailed')); }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-gray-100">{t('profile.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('profile.subtitle')}</p>
      </div>

      <div className="card dark:bg-gray-900 dark:border-gray-800">
        <div className="card-header dark:border-gray-800 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-700 dark:text-primary-400">{user.firstName[0]}{user.lastName[0]}</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg dark:text-gray-100">{user.firstName} {user.lastName}</h3>
            <span className="badge-blue">{user.role}</span>
          </div>
        </div>
        <div className="card-body">
          {editing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label dark:text-gray-300">{t('profile.firstName')}</label><input className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></div>
                <div><label className="label dark:text-gray-300">{t('profile.lastName')}</label><input className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></div>
              </div>
              <div><label className="label dark:text-gray-300">{t('profile.phone')}</label><input className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">{t('profile.save')}</button>
                <button type="button" onClick={() => setEditing(false)} className="btn-secondary dark:border-gray-700">{t('profile.cancel')}</button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-gray-400" /><div><p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.email')}</p><p className="dark:text-gray-200">{user.email}</p></div></div>
              <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-gray-400" /><div><p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.phone')}</p><p className="dark:text-gray-200">{user.phone || t('profile.notSet')}</p></div></div>
              <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-gray-400" /><div><p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.role')}</p><p className="dark:text-gray-200">{user.role}</p></div></div>
              <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-gray-400" /><div><p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.memberSince')}</p><p className="dark:text-gray-200">{formatDate(user.createdAt)}</p></div></div>
              <button onClick={() => setEditing(true)} className="btn-primary">{t('profile.editProfile')}</button>
            </div>
          )}
        </div>
      </div>

      <div className="card dark:bg-gray-900 dark:border-gray-800">
        <div className="card-header dark:border-gray-800"><h3 className="font-semibold dark:text-gray-100">{t('profile.changePassword')}</h3></div>
        <div className="card-body">
          {showPassword ? (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div><label className="label dark:text-gray-300">{t('profile.currentPassword')}</label><input type="password" className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required /></div>
              <div><label className="label dark:text-gray-300">{t('profile.newPassword')}</label><input type="password" className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength={8} /></div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">{t('profile.change')}</button>
                <button type="button" onClick={() => setShowPassword(false)} className="btn-secondary dark:border-gray-700">{t('profile.cancel')}</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowPassword(true)} className="btn-secondary dark:border-gray-700">{t('profile.changePassword')}</button>
          )}
        </div>
      </div>
    </div>
  );
}
