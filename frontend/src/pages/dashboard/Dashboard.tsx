import { useAuthStore } from '../../store/authStore';
import AdminDashboard from './AdminDashboard';
import SalesDashboard from './SalesDashboard';
import ProductionDashboardView from './ProductionDashboardView';

export default function Dashboard() {
  const { user } = useAuthStore();

  if (user?.role === 'ADMIN') return <AdminDashboard />;
  if (user?.role === 'SALES') return <SalesDashboard />;
  if (user?.role === 'PRODUCTION') return <ProductionDashboardView />;
  return null;
}
