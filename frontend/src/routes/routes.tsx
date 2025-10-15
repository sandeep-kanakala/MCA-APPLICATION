import { lazy } from 'react';
import { createBrowserRouter, Outlet, useLocation } from 'react-router-dom';

const Login = lazy(() => import('@/pages/Login/login'));
const Signup = lazy(() => import('@/pages/Login/signup'));
const Error404 = lazy(() => import('@/pages/error/404'));
const Dashboard = lazy(() => import('@/pages/dashboard'));
const Account = lazy(() => import('@/pages/account'));
const AppSalesSidebar = lazy(() => import('@/components/layout/app-sidebar/index'));
const SettingSidebar = lazy(() => import('@/components/layout//settings-sidebar/index'));
const Users = lazy(() => import('@/pages/Setting/Users'));
const Tenants = lazy(() => import('@/pages/tenants'));
const Setting = lazy(() => import('@/pages/Setting'));
const UserPermission = lazy(() => import('@/pages/Setting/permissions'));
const LayoutWrapper = () => {
  const location = useLocation();
  const isSettingRoute = location.pathname.includes('/setting');
  const Layout = isSettingRoute ? SettingSidebar : AppSalesSidebar;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: 'signup',
    element: <Signup />,
  },
  {
    path: '/apps',
    element: <Tenants />,
  },
  {
    path: '*',
    element: <Error404 />,
  },
  {
    element: <LayoutWrapper />, // Wrap all routes that need Layout
    children: [
      {
        path: 'apps/sales/dashboard',
        element: <Dashboard />,
      },
      {
        path: 'account',
        element: <Account />,
      },
      {
        path: 'setting/users',
        element: <Users />,
      },
      {
        path: 'setting/permissions',
        element: <UserPermission />,
      },
      {
        path: '/setting',
        element: <Setting />,
      },
    ],
  },
]);
