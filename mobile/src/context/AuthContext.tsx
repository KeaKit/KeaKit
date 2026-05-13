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
import { setUnauthorizedHandler } from '../services/apiClient';

interface AuthContextData {
  user: AuthUser | null;
  loading: boolean;
  signIn(data: LoginRequest): Promise<void>;
  signUp(data: RegisterRequest): Promise<void>;
  signOut(): Promise<void>;
  setUser(user: AuthUser | null): void; 
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const USER_STORAGE_KEY = '@AuthApp:user';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, _setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = useCallback(async (updatedUser: AuthUser | null) => {
    if (updatedUser) {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    }
    _setUser(updatedUser);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    _setUser(null);
  }, []);

  setUnauthorizedHandler(signOut);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as AuthUser;
          if (isTokenExpired(parsed.token)) {
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
          } else {
            setUser(parsed);
          }
        }
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
      phone: response.phone,
      address: response.address,
      city: response.city,
      country: response.country,
      founderBadge: response.founderBadge || false,
      profileImageUrl: response.profileImageUrl,
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
      phone: response.phone,
      address: response.address,
      city: response.city,
      country: response.country,
      founderBadge: response.founderBadge || false,
      profileImageUrl: response.profileImageUrl,
    };
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}