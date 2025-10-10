import { lazy } from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";

const Login = lazy(() => import("@/pages/Login/login"));
const Signup = lazy(() => import("@/pages/Login/signup"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Account = lazy(() => import("@/pages/account"));
const Layout = lazy(() => import("@/components/layout/layout"));

const LayoutWrapper = () => (
  <Layout>
    <Outlet />
  </Layout>
);
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "signup",
    element: <Signup />,
  },
  {
    element: <LayoutWrapper />, // Wrap all routes that need Layout
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "account",
        element: <Account />,
      },
    ],
  },
]);
