import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { loginUser, registerUser } from '../services/authService';
import { AuthUser, LoginRequest, RegisterRequest } from '../types';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, _setUser] = useState<AuthUser | null>(null);

  const setUser = useCallback(async (updatedUser: AuthUser | null) => {
    if (updatedUser) {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    }
    _setUser(updatedUser);
  }, []);
  
  const [loading, setLoading] = useState(true);

  const isTokenExpired = (token: string): boolean => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const payload = parts[1];
      const decoded = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
      const data = JSON.parse(decoded);
      if (!data.exp) return true;
      return data.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (stored) {
          const authUser = JSON.parse(stored) as AuthUser;
          if (authUser.token && isTokenExpired(authUser.token)) {
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
            _setUser(null);
          } else {
            setUser(authUser);
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
      profilePhotoUrl: response.profilePhotoUrl,
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
      profilePhotoUrl: response.profilePhotoUrl,
    };
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
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