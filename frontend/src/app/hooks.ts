// hooks.ts
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, AppState } from './store';
import { clearAuthToken } from '@/utils';
import { useEffect } from 'react';
import { fetchUserRole } from '@/features/redux/layout';

/**
 * useCustomNavigate
 * Reusable hook for navigation
 */
export const useCustomNavigate = () => {
  const navigate = useNavigate();

  // Navigate to a specific route
  const goTo = (path: string) => {
    navigate(path);
  };

  return {
    navigate: goTo,
  };
};

/**
 * useLogout
 * Reusable hook for logging out the user
 */
export const useLogout = () => {
  const { navigate } = useCustomNavigate();

  const logout = () => {
    clearAuthToken();
    navigate('/');
  };

  return { logout };
};
// hooks/useUserRole.ts

export const useUserRole = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error }: any = useAppSelector((state: AppState) => state.userRole);
  useEffect(() => {
    if (data.length === 0 && !loading) {
      dispatch(fetchUserRole());
    }
  }, [data, loading, dispatch]);

  return { data, loading, error };
};

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
