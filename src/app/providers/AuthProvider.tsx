import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import {
  AuthResponse,
  AuthUser,
  OtpDispatchResponse,
  OtpType,
  RegisterInitiationResponse,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyRegistrationPayload,
  clearLocalSession,
  fetchCurrentUser,
  forgotPassword as requestPasswordReset,
  getCurrentToken,
  getUserRoleNames,
  login as loginRequest,
  loginWithGoogle as loginWithGoogleRequest,
  logout as logoutRequest,
  register as registerRequest,
  resendOtp as resendOtpRequest,
  resetPassword as resetPasswordRequest,
  resolveUserDefaultRoute,
  verifyRegistration as verifyRegistrationRequest,
} from '../services/authService';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  roleNames: string[];
  defaultRoute: string;
  login: (email: string, password: string) => Promise<AuthResponse>;
  loginWithGoogle: () => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<RegisterInitiationResponse>;
  verifyRegistration: (payload: VerifyRegistrationPayload) => Promise<AuthResponse>;
  resendOtp: (email: string, type: OtpType) => Promise<OtpDispatchResponse>;
  forgotPassword: (email: string) => Promise<OtpDispatchResponse>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<AuthUser | null>;
  updateUser: (user: AuthUser | null) => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function hydrateUser() {
      if (!getCurrentToken()) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetchCurrentUser();

        if (isMounted) {
          setUser(response.user);
        }
      } catch {
        await clearLocalSession();

        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void hydrateUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const roleNames = useMemo(() => getUserRoleNames(user), [user]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    roleNames,
    defaultRoute: user ? resolveUserDefaultRoute(user) : '/',
    login: async (email: string, password: string) => {
      const response = await loginRequest(email, password);
      setUser(response.user);
      return response;
    },
    loginWithGoogle: async () => {
      const response = await loginWithGoogleRequest();
      setUser(response.user);
      return response;
    },
    register: (payload: RegisterPayload) => registerRequest(payload),
    verifyRegistration: async (payload: VerifyRegistrationPayload) => {
      const response = await verifyRegistrationRequest(payload);
      setUser(response.user);
      return response;
    },
    resendOtp: (email: string, type: OtpType) => resendOtpRequest(email, type),
    forgotPassword: (email: string) => requestPasswordReset(email),
    resetPassword: (payload: ResetPasswordPayload) => resetPasswordRequest(payload),
    logout: async () => {
      await logoutRequest();
      setUser(null);
    },
    refreshCurrentUser: async () => {
      if (!getCurrentToken()) {
        setUser(null);
        return null;
      }

      try {
        const response = await fetchCurrentUser();
        setUser(response.user);
        return response.user;
      } catch {
        await clearLocalSession();
        setUser(null);
        return null;
      }
    },
    updateUser: setUser,
    hasRole: (role: string) => roleNames.includes(role),
  }), [isLoading, roleNames, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
