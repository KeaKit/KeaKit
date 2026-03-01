const BASE_URL = 'http://localhost:8080';

export const API_ROUTES = {
  REGISTER: `${BASE_URL}/api/users/register`,
  LOGIN:    `${BASE_URL}/api/users/login`,
  GET_USER: (id: number) => `${BASE_URL}/api/users/${id}`,
  CREATE_RATING:         `${BASE_URL}/api/ratings`,
  GET_RATINGS_FOR_USER:  (userId: number) => `${BASE_URL}/api/ratings/user/${userId}`,
  GET_RATINGS_BY_USER:   (userId: number) => `${BASE_URL}/api/ratings/given/${userId}`,
  GET_RATING:            (id: number) => `${BASE_URL}/api/ratings/${id}`,
  DELETE_RATING:         (id: number) => `${BASE_URL}/api/ratings/${id}`,
  CREATE_KIT: `${BASE_URL}/api/kits/create`,
  MY_ARTICLES: (userId: number) => `${BASE_URL}/api/article/my-articles/${userId}`,
  UPLOAD_ARTICLE: (ownerId: number) => `${BASE_URL}/api/article/upload?ownerId=${ownerId}`,
  TOGGLE_RENT:    (id: number, ownerId: number) => `${BASE_URL}/api/article/${id}/toggle-rent?ownerId=${ownerId}`,
  CATEGORIES: `${BASE_URL}/api/category`,
  CATEGORY_BY_ID: (id: number) => `${BASE_URL}/api/category/${id}`,
} as const;

export default BASE_URL;