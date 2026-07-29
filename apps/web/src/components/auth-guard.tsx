import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { fetchMe, getToken } from '@/lib/auth';

export function AuthGuard() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!getToken()) {
      setAuthed(false);
      return;
    }
    fetchMe().then(setAuthed);
  }, []);

  if (authed === null) return null;
  if (!authed) return <Navigate to="/login" replace />;
  return <Outlet />;
}
