import { lazy } from 'react';
import { createBrowserRouter, Outlet, useLocation } from 'react-router-dom';
import { RequireAuth, RedirectIfAuth } from '@/authentication/RequireAuth';
const Login = lazy(() => import('@/pages/Login/login'));
const Error404 = lazy(() => import('@/pages/error/404'));
const Dashboard = lazy(() => import('@/pages/dashboard'));
const Account = lazy(() => import('@/pages/account'));
const AppSalesSidebar = lazy(() => import('@/components/layout/app-sidebar/index'));
const SettingSidebar = lazy(() => import('@/components/layout/settings-sidebar/index'));
const Users = lazy(() => import('@/pages/Setting/Users'));
const Tenants = lazy(() => import('@/pages/tenants'));
const Setting = lazy(() => import('@/pages/Setting'));
const UserPermission = lazy(() => import('@/pages/Setting/permissions'));
const UserDetailsView = lazy(() => import('@/features/components/Users/UserDetails'));
const AccountDetails = lazy(() => import('@/features/components/Accounts/AccountDetails'));
const Profile = lazy(() => import('@/pages/Profile/Profile'));
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
const routesConfig = [
  {
    path: '/',
    element: <RedirectIfAuth />,
    children: [{ path: '/', element: <Login /> }],
  },
  {
    path: '*',
    element: <Error404 />,
  },
  {
    element: <RequireAuth />,
    children: [
      { path: '/apps', element: <Tenants /> },
      {
        element: <LayoutWrapper />,
        children: [
          { path: 'apps/sales/dashboard', element: <Dashboard /> },
          { path: 'apps/sales/accounts', element: <Account /> },
          { path: 'apps/sales/accounts/:accountId', element: <AccountDetails /> },
          { path: 'setting', element: <Setting /> },
          { path: 'setting/users', element: <Users /> },
          { path: 'setting/users/:userId', element: <UserDetailsView /> },
          { path: 'setting/permissions', element: <UserPermission /> },
          { path: 'profile', element: <Profile /> },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routesConfig);
