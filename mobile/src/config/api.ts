const BASE_URL = 'http://localhost:8080';

export const API_ROUTES = {
  REGISTER: `${BASE_URL}/api/users/register`,
  LOGIN:    `${BASE_URL}/api/users/login`,
  UPDATE_PROFILE: (id: number) => `${BASE_URL}/api/users/${id}`,
  GET_USER: (id: number) => `${BASE_URL}/api/users/${id}`,
  GET_CITIES: `${BASE_URL}/api/cities`,
  GET_ALL_USERS: `${BASE_URL}/api/admin/users`,
  DELETE_USER: (id: number) => `${BASE_URL}/api/admin/users/${id}`,
  CREATE_USER: `${BASE_URL}/api/admin/users`,       // POST
  UPDATE_USER: (id: number) => `${BASE_URL}/api/admin/users/${id}`, // PUT
  CREATE_RATING:         `${BASE_URL}/api/ratings`,
  GET_RATINGS_FOR_USER:  (userId: number) => `${BASE_URL}/api/ratings/user/${userId}`,
  GET_RATINGS_BY_USER:   (userId: number) => `${BASE_URL}/api/ratings/given/${userId}`,
  GET_RATING:            (id: number) => `${BASE_URL}/api/ratings/${id}`,
  DELETE_RATING:         (id: number) => `${BASE_URL}/api/ratings/${id}`,
  CREATE_KIT: `${BASE_URL}/api/kits/create`,
  MY_ARTICLES: (userId: number) => `${BASE_URL}/api/article/my-articles/${userId}`,
  UPLOAD_ARTICLE: (ownerId: number,categoryId: number) => `${BASE_URL}/api/article/upload?ownerId=${ownerId}&categoryId=${categoryId}`,
  UPLOAD_ARTICLE_WITH_IMAGE: (ownerId: number, categoryId: number) => `${BASE_URL}/api/article/upload-with-image?ownerId=${ownerId}&categoryId=${categoryId}`,
  GET_ARTICLE: (id: number) => `${BASE_URL}/api/article/${id}`,
  UPDATE_ARTICLE: (id: number, ownerId: number) => `${BASE_URL}/api/article/${id}?ownerId=${ownerId}`,
  DELETE_ARTICLE: (id: number, ownerId: number) => `${BASE_URL}/api/article/${id}?ownerId=${ownerId}`,
  TOGGLE_RENT:    (id: number, ownerId: number) => `${BASE_URL}/api/article/${id}/toggle-rent?ownerId=${ownerId}`,
  CATEGORIES: `${BASE_URL}/api/category`,
  CATEGORY_BY_ID: (id: number) => `${BASE_URL}/api/category/${id}`,
  GET_LATEST_ARTICLES_BY_CATEGORY: (categoryId: number) => `${BASE_URL}/api/article/category/${categoryId}/latest`,
  GET_NUMBER_OF_ARTICLES_BY_CATEGORY: (categoryId: number) => `${BASE_URL}/api/article/category/${categoryId}/count`,
  ALL_ITEMS: `${BASE_URL}/api/items/all`,

  // Incidents
  CREATE_INCIDENT:            `${BASE_URL}/api/incidents`,
  GET_ALL_INCIDENTS:          `${BASE_URL}/api/incidents`,
  GET_INCIDENTS_BY_USER:      (userId: number) => `${BASE_URL}/api/incidents/user/${userId}`,
  GET_RECEIVED_INCIDENTS:     (ownerId: number) => `${BASE_URL}/api/incidents/received/${ownerId}`,
  GET_INCIDENT:               (id: number) => `${BASE_URL}/api/incidents/${id}`,
  UPDATE_INCIDENT:            (id: number) => `${BASE_URL}/api/incidents/${id}`,
  RESOLVE_INCIDENT:           (id: number) => `${BASE_URL}/api/incidents/${id}/resolve`,
  DELETE_INCIDENT:            (id: number) => `${BASE_URL}/api/incidents/${id}`,
  GET_INCIDENT_COMMENTS:      (incidentId: number) => `${BASE_URL}/api/incidents/${incidentId}/comments`,
  ADD_INCIDENT_COMMENT:       (incidentId: number) => `${BASE_URL}/api/incidents/${incidentId}/comments`,

  // Kits / Rented items
  GET_RENTED_ITEMS:           (userId: number) => `${BASE_URL}/api/kits/rented/${userId}`,
  GET_KIT:                    (kitId: number) => `${BASE_URL}/api/kits/${kitId}`,

  // Rental return (End of Rental)
  PROCESS_RETURN:             (articleId: number, ownerId: number) => `${BASE_URL}/api/article/${articleId}/return?ownerId=${ownerId}`,
  ARTICLE_REVIEW_DETAIL:      (id: number) => `${BASE_URL}/api/article/${id}/review-detail`,
  PENDING_REVIEW_ARTICLES:    (ownerId: number) => `${BASE_URL}/api/article/pending-review/${ownerId}`,
} as const;

export default BASE_URL;