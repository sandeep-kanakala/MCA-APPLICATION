import { Navigate, Outlet } from 'react-router-dom';
import { getResetToken, clearResetToken } from '@/utils';

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() >= exp;
  } catch (err) {
    return true;
  }
};

export const RequireResetToken = () => {
  const token = getResetToken();

  if (!token || isTokenExpired(token)) {
    clearResetToken();
    return <Navigate to="/forgot-password" replace />;
  }

  return <Outlet />;
};
