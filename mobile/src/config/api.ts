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
  GET_KIT: (id: number) => `${BASE_URL}/api/kits/${id}`,
  CONFIRM_KIT: (id: number) => `${BASE_URL}/api/kits/confirm/${id}`,
  KIT_PAYMENT: `${BASE_URL}/api/kits/payment`,
  KIT_MARK_PAID: (id: number) => `${BASE_URL}/api/kits/${id}/pay`,
  KIT_CANCEL: (id: number) => `${BASE_URL}/api/kits/${id}/cancel`,
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
  ITEMS_FOR_RENT: (ownerId: number) => `${BASE_URL}/api/items/for-rent/${ownerId}`,

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
    MY_KITS:                    (userId: number) => `${BASE_URL}/api/kits/my-kits/${userId}`,
  GET_RENTED_ITEMS:           (userId: number) => `${BASE_URL}/api/kits/rented/${userId}`,

  // Payments
  SIMULATE_PAYMENT:           `${BASE_URL}/api/payments/pay-kit`,

  // Services
  ACTIVE_SERVICES: `${BASE_URL}/api/services/active`,
  MY_SERVICES: (userId: number) => `${BASE_URL}/api/services/my-services?ownerId=${userId}`,
  GET_SERVICE: (id: number) => `${BASE_URL}/api/services/${id}`,
  PROMOTE_SERVICE: `${BASE_URL}/api/services/promote`,
  UPDATE_SERVICE: (id: number) => `${BASE_URL}/api/services/${id}`,
  DELETE_SERVICE: (id: number) => `${BASE_URL}/api/services/${id}`,
  REQUEST_SERVICE: (id: number) => `${BASE_URL}/api/services/${id}/request`,
  RELEASE_SERVICE: (id: number) => `${BASE_URL}/api/services/${id}/release`,

} as const;

export default BASE_URL;