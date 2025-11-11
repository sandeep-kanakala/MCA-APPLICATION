import { lazy } from 'react';
import { createBrowserRouter, Outlet, useLocation } from 'react-router-dom';
import { RequireAuth, RedirectIfAuth } from '@/authentication/RequireAuth';
import { RequireResetToken } from '@/authentication/RequireResetToken';
import ProductEditForm from '@/features/components/Products/EditProduct';
const Login = lazy(() => import('@/pages/Login/login'));
const MicrosoftCallbackPage = lazy(() => import('@/pages/Login/MicrosoftCallbackPage'));

const Error404 = lazy(() => import('@/pages/error/404'));
const Dashboard = lazy(() => import('@/pages/dashboard'));
const Account = lazy(() => import('@/pages/account'));
const Product = lazy(() => import('@/pages/Products/products'));
const AppSalesSidebar = lazy(() => import('@/components/layout/app-sidebar/index'));
const SettingSidebar = lazy(() => import('@/components/layout/settings-sidebar/index'));
const Users = lazy(() => import('@/pages/Setting/Users'));
const Tenants = lazy(() => import('@/pages/tenants'));
const Setting = lazy(() => import('@/pages/Setting'));
const UserPermission = lazy(() => import('@/pages/Setting/permissions'));
const UserDetailsView = lazy(() => import('@/features/components/Users/UserDetails'));
const CreateUserPage = lazy(() => import('@/features/components/Users/CreateUser'));
const CreateAccountPage = lazy(() => import('@/features/components/Accounts/createAccount'));
const AccountDetails = lazy(() => import('@/features/components/Accounts/AccountDetails'));
const ProductDetails = lazy(() => import('@/features/components/Products/Product-Details'));
const CreateProductPage = lazy(() => import('@/features/components/Products/createProduct'));
// ProductBundleDetailView removed - product bundle page consolidated into Product details related tab
const Profile = lazy(() => import('@/pages/Profile/Profile'));
const ForgetPasswordPage = lazy(() => import('@/pages/Login/ForgetPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/Login/ResetPasswordPage'));
const UserEditForm = lazy(() => import('@/features/components/Users/EditUser'));
const AccountEditForm = lazy(() => import('@/features/components/Accounts/EditAccount'));
const Contact = lazy(() => import('@/pages/contact'));
const ContatDetailView = lazy(() => import('@/features/components/Contacts/contactsDetails'));
const ContactCreate = lazy(() => import('@/features/components/Contacts/createContact'));
const ContactEditForm = lazy(() => import('@/features/components/Contacts/EditContact'));
const AuditEventsPage = lazy(() => import('@/features/components/Events'));
const OrdersPage = lazy(() => import('@/features/components/Orders'));
const OrderDetailPage = lazy(() => import('@/features/components/Orders/OrderDetails'));
const PriceBooks = lazy(() => import('@/pages/pricebook'));
const PriceBookCreate = lazy(() => import('@/features/components/PriceBooks/create-pricebook'));
const PriceBookEdit = lazy(() => import('@/features/components/PriceBooks/edit-pricebook'));
const PriceBookDetails = lazy(() => import('@/features/components/PriceBooks/pricebook-details'));
const PriceBookEntryDetails = lazy(
  () => import('@/features/components/PriceBooks/pricebook-entry-details'),
);
const BundleItemDetails = lazy(() => import('@/features/components/BundleItems/BundleItemDetails'));

const ProductPriceList = lazy(() => import('@/features/components/Product-price-list/index'));
const PriceListCreate = lazy(
  () => import('@/features/components/Product-price-list/createPriceList'),
);
const ProductlistDetailView = lazy(
  () => import('@/features/components/Product-price-list/PriceListDetails'),
);
const ProductPricelistEdit = lazy(
  () => import('@/features/components/Product-price-list/EditPriceList'),
);
const PricelistEntryEditForm = lazy(
  () => import('@/features/components/Product-price-list/editEntry'),
);
const ProductlisEntryDetailView = lazy(
  () => import('@/features/components/Product-price-list/EntryDetails'),
);
const PriceListCreateEntry = lazy(
  () => import('@/features/components/Product-price-list/createEntry'),
);
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
    children: [
      { path: '/', element: <Login /> },
      { path: 'forgot-password', element: <ForgetPasswordPage /> },
      { path: 'auth/microsoft/callback', element: <MicrosoftCallbackPage /> },
    ],
  },
  {
    element: <RequireResetToken />,
    children: [{ path: 'reset-password', element: <ResetPasswordPage /> }],
  },
  {
    element: <RequireAuth />,
    children: [
      { path: '/apps', element: <Tenants /> },
      {
        element: <LayoutWrapper />,
        children: [
          { path: 'apps/sales/dashboard', element: <Dashboard /> },
          { path: 'apps/sales/events', element: <AuditEventsPage /> },
          { path: 'apps/sales/orders', element: <OrdersPage /> },
          { path: 'apps/sales/orders/:orderId', element: <OrderDetailPage /> },
          { path: 'apps/sales/accounts', element: <Account /> },
          { path: 'apps/sales/accounts/create', element: <CreateAccountPage /> },
          { path: 'apps/sales/contacts/:contactId', element: <ContatDetailView /> },
          { path: 'apps/sales/contacts', element: <Contact /> },
          { path: 'apps/sales/contacts/create', element: <ContactCreate /> },
          { path: 'apps/sales/contacts/edit/:contactId', element: <ContactEditForm /> },
          { path: 'apps/sales/products', element: <Product /> },
          { path: 'apps/sales/products/create', element: <CreateProductPage /> },
          { path: 'apps/sales/products/:productId', element: <ProductDetails /> },
          { path: 'apps/sales/products/edit/:productId', element: <ProductEditForm /> },
          // Product bundle detail view removed; bundle items are managed via Product details Related tab
          {
            path: 'apps/sales/product-bundles/:bundleId/items/:itemId',
            element: <BundleItemDetails />,
          },
          { path: 'apps/sales/accounts/:accountId', element: <AccountDetails /> },
          { path: 'apps/sales/accounts/edit/:accountId', element: <AccountEditForm /> },
          { path: 'setting', element: <Setting /> },
          { path: 'setting/users', element: <Users /> },
          { path: 'setting/users/create', element: <CreateUserPage /> },
          { path: 'setting/users/:userId', element: <UserDetailsView /> },
          { path: 'setting/users/edit/:userId', element: <UserEditForm /> },
          { path: 'setting/permissions', element: <UserPermission /> },
          { path: 'profile', element: <Profile /> },
          { path: 'apps/sales/pricebooks', element: <PriceBooks /> },
          { path: 'apps/sales/pricebooks/create', element: <PriceBookCreate /> },
          { path: 'apps/sales/pricebooks/edit/:pricebookId', element: <PriceBookEdit /> },
          { path: 'apps/sales/pricebooks/:pricebookId', element: <PriceBookDetails /> },
          {
            path: 'apps/sales/pricebookentries/:pricebookentryId',
            element: <PriceBookEntryDetails />,
          },
          { path: 'apps/sales/pricelist', element: <ProductPriceList /> },
          { path: 'apps/sales/pricelist/create', element: <PriceListCreate /> },
          { path: 'apps/sales/pricelist/:pricelistId', element: <ProductlistDetailView /> },
          { path: 'apps/sales/pricelist/edit/:pricelistId', element: <ProductPricelistEdit /> },

          {
            path: 'apps/sales/pricelist/:pricelistId/entry/create',
            element: <PriceListCreateEntry />,
          },
          {
            path: 'apps/sales/pricelist/:pricelistId/entry/:entryId/edit',
            element: <PricelistEntryEditForm />,
          },
          {
            path: '/apps/sales/pricelist/:pricelistId/entry/:pricelistEntryId',
            element: <ProductlisEntryDetailView />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Error404 />,
  },
];

export const router = createBrowserRouter(routesConfig);
