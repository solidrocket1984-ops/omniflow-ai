import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import useCurrentUser from '@/hooks/useCurrentUser';
import LoadingScreen from './LoadingScreen';

export default function AppLayout() {
  const { user, account, loading } = useCurrentUser();

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} account={account} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          <Outlet context={{ user, account }} />
        </div>
      </main>
    </div>
  );
}