import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { authApi } from "../services/authApi";
import { authStorage } from "../services/storage";
import { AuthUser, LoginPayload, SignupPayload } from "../types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  isInitializing: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const session = authStorage.getSession();

    if (session?.user) {
      setUser(session.user);
    }

    setIsInitializing(false);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const session = await authApi.login(payload);
    authStorage.saveSession(session);
    setUser(session.user);
  }, []);

  const signup = useCallback(async (payload: SignupPayload) => {
    const session = await authApi.signup(payload);
    authStorage.saveSession(session);
    setUser(session.user);
  }, []);

  const logout = useCallback(() => {
    authStorage.clearSession();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isInitializing,
      login,
      signup,
      logout,
    }),
    [user, isInitializing, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
};
