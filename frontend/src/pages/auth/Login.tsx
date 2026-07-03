import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export default function Login() {
  const { login } = useAuthStore();
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success(t('login.welcomeBack'));
    } catch (err: any) {
      toast.error(err.response?.data?.error || t('login.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end gap-2 mb-4">
          <button onClick={toggleTheme} className="p-2 rounded-lg bg-white/80 dark:bg-gray-800 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/80 dark:bg-gray-800 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {lang === 'en' ? 'FR' : 'EN'}
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('app.name')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t('app.subtitle')}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-6 dark:text-gray-100">{t('login.title')}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label dark:text-gray-300">{t('login.email')}</label>
              <input
                type="email"
                className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder')}
                required
              />
            </div>
            <div>
              <label className="label dark:text-gray-300">{t('login.password')}</label>
              <input
                type="password"
                className="input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('login.passwordPlaceholder')}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('login.signIn')}
            </button>
          </form>

          <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-500 dark:text-gray-400">
            <p className="font-medium mb-1">{t('login.demoCredentials')}</p>
            <p>{t('login.demoAdmin')}</p>
            <p>{t('login.demoSales')}</p>
            <p>{t('login.demoProduction')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
