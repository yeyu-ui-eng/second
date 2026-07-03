import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';

export default function Profile() {
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
      toast.success('Profile updated');
    } catch (err: any) { toast.error(err.response?.data?.error || 'Update failed'); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/change-password', passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setShowPassword(false);
      toast.success('Password changed');
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-gray-500">Manage your account</p>
      </div>

      <div className="card">
        <div className="card-header flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-700">{user.firstName[0]}{user.lastName[0]}</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{user.firstName} {user.lastName}</h3>
            <span className="badge-blue">{user.role}</span>
          </div>
        </div>
        <div className="card-body">
          {editing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">First Name</label><input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></div>
                <div><label className="label">Last Name</label><input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></div>
              </div>
              <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-gray-400" /><div><p className="text-sm text-gray-500">Email</p><p>{user.email}</p></div></div>
              <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-gray-400" /><div><p className="text-sm text-gray-500">Phone</p><p>{user.phone || 'Not set'}</p></div></div>
              <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-gray-400" /><div><p className="text-sm text-gray-500">Role</p><p>{user.role}</p></div></div>
              <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-gray-400" /><div><p className="text-sm text-gray-500">Member Since</p><p>{formatDate(user.createdAt)}</p></div></div>
              <button onClick={() => setEditing(true)} className="btn-primary">Edit Profile</button>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="font-semibold">Change Password</h3></div>
        <div className="card-body">
          {showPassword ? (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div><label className="label">Current Password</label><input type="password" className="input" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required /></div>
              <div><label className="label">New Password</label><input type="password" className="input" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength={8} /></div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">Change</button>
                <button type="button" onClick={() => setShowPassword(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowPassword(true)} className="btn-secondary">Change Password</button>
          )}
        </div>
      </div>
    </div>
  );
}
