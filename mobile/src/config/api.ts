const BASE_URL = 'http://localhost:8080';

export const API_ROUTES = {
  REGISTER: `${BASE_URL}/api/users/register`,
  LOGIN:    `${BASE_URL}/api/users/login`,
  GET_USER: (id: number) => `${BASE_URL}/api/users/${id}`,
  MY_ARTICLES: (userId: number) => `${BASE_URL}/api/article/my-articles/${userId}`,
} as const;

export default BASE_URL;