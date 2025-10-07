import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

const Login = lazy(() => import("../pages/Login/login"));
const Signup = lazy(() => import("../pages/Login/signup"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "signup",
    element:<Signup/>,
  }
]);
