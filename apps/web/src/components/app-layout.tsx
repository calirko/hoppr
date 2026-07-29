import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/navbar';

export function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col px-3 py-6 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}
