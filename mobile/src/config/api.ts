import { Platform } from 'react-native';

const DEFAULT_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8080'
    : 'http://localhost:8080';

const ENV_BASE_URL =
  (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env?.EXPO_PUBLIC_API_URL;

const BASE_URL =
  ENV_BASE_URL?.trim() || DEFAULT_BASE_URL;

export const API_ROUTES = {
  REGISTER: `${BASE_URL}/api/users/register`,
  LOGIN:    `${BASE_URL}/api/users/login`,
  GET_USER: (id: number) => `${BASE_URL}/api/users/${id}`,
  CREATE_KIT: `${BASE_URL}/api/kits/create`,
  MY_ARTICLES: (userId: number) => `${BASE_URL}/api/article/my-articles/${userId}`,
} as const;

export default BASE_URL;
