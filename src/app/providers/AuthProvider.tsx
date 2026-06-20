import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import * as authService from '../services/authService';
import type { AuthUser } from '../services/authService';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (payload: authService.RegisterPayload) => Promise<authService.RegisterInitiationResponse>;
  verifyRegistration: (payload: authService.VerifyRegistrationPayload) => Promise<void>;
  forgotPassword: (email: string) => Promise<authService.OtpDispatchResponse>;
  resetPassword: (payload: authService.ResetPasswordPayload) => Promise<{ message: string }>;
  resendOtp: (email: string, type: authService.OtpType) => Promise<authService.OtpDispatchResponse>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => void;
  hasRole: (role: string) => boolean;
  roleNames: string[];
  defaultRoute: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = authService.getCurrentToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const { user } = await authService.fetchCurrentUser();
      setUser(user);
    } catch {
      await authService.clearLocalSession();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const roleNames = user ? authService.getUserRoleNames(user) : [];
  const hasRole = useCallback((role: string) => roleNames.includes(role), [roleNames]);
  const defaultRoute = authService.resolveUserDefaultRoute(user);

  const login = async (identifier: string, password: string) => {
    const response = await authService.login(identifier, password);
    setUser(response.user);
  };

  const loginWithGoogle = async () => {
    const response = await authService.loginWithGoogle();
    setUser(response.user);
  };

  const register = async (payload: authService.RegisterPayload) => {
    return authService.register(payload);
  };

  const verifyRegistration = async (payload: authService.VerifyRegistrationPayload) => {
    const response = await authService.verifyRegistration(payload);
    setUser(response.user);
  };

  const forgotPassword = async (email: string) => {
    return authService.forgotPassword(email);
  };

  const resetPassword = async (payload: authService.ResetPasswordPayload) => {
    return authService.resetPassword(payload);
  };

  const resendOtp = async (email: string, type: authService.OtpType) => {
    return authService.resendOtp(email, type);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshCurrentUser = async () => {
    await loadUser();
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        register,
        verifyRegistration,
        forgotPassword,
        resetPassword,
        resendOtp,
        logout,
        refreshCurrentUser,
        updateUser,
        hasRole,
        roleNames,
        defaultRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
