import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser } from '../services/authService';
import { AuthUser, LoginRequest, RegisterRequest } from '../types';

interface AuthContextData {
  user: AuthUser | null;
  loading: boolean;
  signIn(data: LoginRequest): Promise<void>;
  signUp(data: RegisterRequest): Promise<void>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const USER_STORAGE_KEY = '@AuthApp:user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (stored) setUser(JSON.parse(stored) as AuthUser);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (data: LoginRequest) => {
    const response = await loginUser(data);
    if (!response.token) throw new Error('El servidor no devolvió un token.');
    const authUser: AuthUser = {
      id:    response.id,
      name:  response.name,
      email: response.email,
      role: response.role,
      token: response.token,
    };
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const signUp = useCallback(async (data: RegisterRequest) => {
    const response = await registerUser(data);
    if (!response.token) throw new Error('El servidor no devolvió un token.');
    const authUser: AuthUser = {
      id:    response.id,
      name:  response.name,
      email: response.email,
      role: response.role,
      token: response.token,
    };
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}