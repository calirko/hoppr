import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import { AppLayout } from '@/components/app-layout';
import { AuthGuard } from '@/components/auth-guard';
import ConnectionsPage from '@/pages/connections';
import LoginPage from '@/pages/login';
import UsersPage from '@/pages/users';

const router = createBrowserRouter([
  { index: true, element: <Navigate to="/connections" replace /> },
  { path: '/login', element: <LoginPage /> },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/connections', element: <ConnectionsPage /> },
          { path: '/users', element: <UsersPage /> },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
