import { Navigate, Outlet } from 'react-router-dom';
import { clearAuthToken, getAuthToken } from '@/utils';
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() >= exp;
  } catch (err) {
    return true;
  }
};
export const RequireAuth = () => {
  const token = getAuthToken();
  if (!token || isTokenExpired(token)) {
    clearAuthToken();
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export const RedirectIfAuth = () => {
  const token = getAuthToken();
  if (token && !isTokenExpired(token)) {
    return <Navigate to="/apps/sales/dashboard" replace />;
  }
  return <Outlet />;
};
