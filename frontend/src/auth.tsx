import { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from './api';
import { Loading } from './components/common';
import type { User } from './types';
const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}>({ user: null, loading: true, logout: async () => {} });
export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient();
  const nav = useNavigate();
  const { data, isPending } = useQuery({
    queryKey: ['me'],
    queryFn: () => api<User>('auth/me'),
    retry: false,
  });
  useEffect(() => {
    const expired = () => {
      client.setQueryData(['me'], { data: null });
      nav('/login');
    };
    const denied = () =>
      toast.error('You do not have permission to perform this action.');
    window.addEventListener('session-expired', expired);
    window.addEventListener('access-denied', denied);
    return () => {
      window.removeEventListener('session-expired', expired);
      window.removeEventListener('access-denied', denied);
    };
  }, [client, nav]);
  return (
    <AuthContext.Provider
      value={{
        user: data?.data || null,
        loading: isPending,
        logout: async () => {
          await api('auth/logout', 'POST');
          client.clear();
          nav('/login');
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
export function Protected({
  role,
  children,
}: {
  role: 'admin' | 'student';
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  if (!user)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (user.role !== role)
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  return children;
}
