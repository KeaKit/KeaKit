const BASE_URL = 'https://keakitpplapi.duckdns.org'

export const API_ROUTES = {
  REGISTER: `${BASE_URL}/api/users/register`,
  LOGIN:    `${BASE_URL}/api/users/login`,
  UPDATE_PROFILE: (id: number) => `${BASE_URL}/api/users/${id}`,
  UPLOAD_PROFILE_IMAGE: `${BASE_URL}/api/users/profile/image`,
  GET_USER: (id: number) => `${BASE_URL}/api/users/${id}`,
  GET_ALL_USERS: `${BASE_URL}/api/admin/users`,
  GET_ADMIN_ALL_USERS: `${BASE_URL}/api/admin/users/no-self`,
  DELETE_USER: (id: number) => `${BASE_URL}/api/admin/users/${id}`,
  CREATE_USER: `${BASE_URL}/api/admin/users`,       // POST
  UPDATE_USER: (id: number) => `${BASE_URL}/api/admin/users/${id}`, // PUT
  CREATE_RATING:         `${BASE_URL}/api/ratings`,
  GET_RATINGS_FOR_USER:  (userId: number) => `${BASE_URL}/api/ratings/user/${userId}`,
  GET_RATINGS_BY_USER:   (userId: number) => `${BASE_URL}/api/ratings/given/${userId}`,
  GET_RATING:            (id: number) => `${BASE_URL}/api/ratings/${id}`,
  GET_PUBLIC_USER_PROFILE: (id: number) => `${BASE_URL}/api/users/${id}/public-profile`,
  DELETE_RATING:         (id: number) => `${BASE_URL}/api/ratings/${id}`,
  HAS_REVIEWED_ITEMS: `${BASE_URL}/api/ratings/has-reviewed`,
  HAS_REVIEWED_ITEM_IN_KITS: `${BASE_URL}/api/ratings/has-reviewed-kit`,
  CREATE_KIT: `${BASE_URL}/api/kits/create`,
  GET_KITS: `${BASE_URL}/api/kits`,
  GET_KIT: (id: number) => `${BASE_URL}/api/kits/${id}`,
  CONFIRM_KIT: (id: number) => `${BASE_URL}/api/kits/confirm/${id}`,
  ADD_ITEM_TO_KIT: (kitId: number, itemId: number, userId: number) =>
    `${BASE_URL}/api/kits/${kitId}/items/${itemId}?userId=${userId}`,
  REMOVE_ITEM_FROM_KIT: (kitId: number, itemId: number, userId: number) =>
    `${BASE_URL}/api/kits/${kitId}/items/${itemId}?userId=${userId}`,
  KIT_PAYMENT: `${BASE_URL}/api/kits/payment`,
  KIT_MARK_PAID: (id: number) => `${BASE_URL}/api/kits/${id}/pay`,
  KIT_CANCEL: (id: number) => `${BASE_URL}/api/kits/${id}/cancel`,
  MY_ARTICLES: (userId: number) => `${BASE_URL}/api/article/my-articles/${userId}`,
  UPLOAD_ARTICLE: (ownerId: number,categoryId: number) => `${BASE_URL}/api/article/upload?ownerId=${ownerId}&categoryId=${categoryId}`,
  UPLOAD_ARTICLE_WITH_IMAGE: (ownerId: number, categoryId: number) => `${BASE_URL}/api/article/upload-with-image?ownerId=${ownerId}&categoryId=${categoryId}`,
  GET_ARTICLE: (id: number) => `${BASE_URL}/api/article/${id}`,
  REQUEST_AVAILABILITY_NOTIFICATION: (articleId: number, requesterId: number, startDate?: string, endDate?: string) => {
    let url = `${BASE_URL}/api/article/${articleId}/notify-when-available?requesterId=${requesterId}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return url;
  },
  UPDATE_ARTICLE: (id: number, ownerId: number) => `${BASE_URL}/api/article/${id}?ownerId=${ownerId}`,
  UPDATE_ARTICLE_WITH_IMAGE: (id: number, ownerId: number) => `${BASE_URL}/api/article/${id}/with-image?ownerId=${ownerId}`,
  DELETE_ARTICLE: (id: number, ownerId: number) => `${BASE_URL}/api/article/${id}?ownerId=${ownerId}`,
  TOGGLE_RENT:    (id: number, ownerId: number) => `${BASE_URL}/api/article/${id}/toggle-rent?ownerId=${ownerId}`,
  ARTICLE_RETURN: (articleId: number, ownerId: number) => `${BASE_URL}/api/article/${articleId}/return?ownerId=${ownerId}`,
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
  TRACKING_UPDATEABLE_KITS:   (userId: number) => `${BASE_URL}/api/kits/tracking-updateable-kits/${userId}`,
  GET_RENTED_ITEMS:           (userId: number) => `${BASE_URL}/api/kits/rented/${userId}`,
  MY_KITS_HISTORY: (page: number = 0, size: number = 10) => `${BASE_URL}/api/kits/my-history?page=${page}&size=${size}`,

  // Kits / Tracking-Assign 

  GET_KIT_TRACKING: (kitId: number) => `${BASE_URL}/api/kits/${kitId}/tracking`,
  UPDATE_KIT_TRACKING: (kitId: number) => `${BASE_URL}/api/kits/${kitId}/tracking`,
  ASSIGNED_KITS: `${BASE_URL}/api/kits/courier/assigned`,
  GET_ALL_KITS: `${BASE_URL}/api/kits`,
  ASSIGN_COURIER: (kitId: number, courierId: number) => `${BASE_URL}/api/kits/${kitId}/assign-courier/${courierId}`,
  BUSY_COURIERS: (country?: string, city?: string) => {
    const params = new URLSearchParams();
    if (country) params.append("country", country);
    if (city) params.append("city", city);
    return `${BASE_URL}/api/kits/busy-couriers?${params.toString()}`;
  },
  UNASSIGNED_KITS: (country?: string, city?: string) => {
    const params = new URLSearchParams();
    if (country) params.append("country", country);
    if (city) params.append("city", city);
    return `${BASE_URL}/api/kits/unassigned?${params.toString()}`;
  },

  // Notifications (arrendador)
  USER_NOTIFICATIONS: (userId: number) => `${BASE_URL}/api/notifications/user/${userId}`,
  MARK_NOTIFICATION_READ: (notificationId: number) => `${BASE_URL}/api/notifications/${notificationId}/read`,
  DELETE_NOTIFICATION: (notificationId: number) => `${BASE_URL}/api/notifications/${notificationId}`,
  CREATE_DEMAND_ALERT: (articleId: number, requesterId: number, startDate?: string, endDate?: string) => {
    let url = `${BASE_URL}/api/notifications/demand-alert?articleId=${articleId}&requesterId=${requesterId}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return url;
  },


  // Payments
  CREATE_PAYMENT_INTENT:     `${BASE_URL}/api/payments/create`,
  PROCESS_PAYMENT_STRIPE:    (kitId: number) => `${BASE_URL}/api/payments/process/stripe/${kitId}`,
  PROCESS_PAYMENT_WALLET:    (kitId: number) => `${BASE_URL}/api/payments/process/wallet/${kitId}`,
  WITHDRAW_TO_BANK:          `${BASE_URL}/api/payments/withdraw`,
  GET_KIT_PAYMENT_BY_ID:     (kitId: number) => `${BASE_URL}/api/kits/payment/${kitId}`,
  GET_KIT_PAYMENT_BY_ID_PROMO: (kitId: number, promoCode: string, email: string) =>
    `${BASE_URL}/api/kits/payment/${kitId}?promoCode=${encodeURIComponent(promoCode)}&email=${encodeURIComponent(email)}`,
  SIMULATE_PAYMENT:           `${BASE_URL}/api/payments/pay-kit`,

  // Promo Codes
  PROMO_CODES:                `${BASE_URL}/api/admin/promo-codes`,
  PROMO_CODE_BY_ID:           (id: number) => `${BASE_URL}/api/admin/promo-codes/${id}`,
  VALIDATE_PROMO_CODE:        (code: string, email: string) =>
      `${BASE_URL}/api/promo-codes/validate?code=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}`,
  PROCESS_PAYMENT_WALLET_PROMO: (kitId: number, code: string, email: string) =>
      `${BASE_URL}/api/payments/process/wallet/${kitId}?promoCode=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}`,
  PROCESS_PAYMENT_STRIPE_PROMO: (kitId: number, code: string, email: string) =>
      `${BASE_URL}/api/payments/process/stripe/${kitId}?promoCode=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}`,

  // Pilot Users
  PILOT_USERS:              `${BASE_URL}/api/admin/pilot-users`,
  PILOT_USER_BY_ID:         (id: number) => `${BASE_URL}/api/admin/pilot-users/${id}`,
  PILOT_USERS_ACTIVE_EMAILS:`${BASE_URL}/api/admin/pilot-users/active-emails`,
  PILOT_USERS_BULK_ACTIVE:  `${BASE_URL}/api/admin/pilot-users/bulk-active`,

  // Wallet
  GET_WALLET_BY_USER_ID:     (userId: number) => `${BASE_URL}/api/wallet/user/${userId}`,
  GET_MY_WALLET:             `${BASE_URL}/api/wallet/my-wallet`,
  GET_MY_TRANSACTIONS:       `${BASE_URL}/api/wallet/my-wallet/transactions`,

  // Services
  ACTIVE_SERVICES: `${BASE_URL}/api/services/active`,
  MY_SERVICES: (userId: number) => `${BASE_URL}/api/services/my-services?ownerId=${userId}`,
  GET_SERVICE: (id: number) => `${BASE_URL}/api/services/${id}`,
  PROMOTE_SERVICE: `${BASE_URL}/api/services/promote`,
  UPDATE_SERVICE: (id: number) => `${BASE_URL}/api/services/${id}`,
  DELETE_SERVICE: (id: number) => `${BASE_URL}/api/services/${id}`,
  REQUEST_SERVICE: (id: number) => `${BASE_URL}/api/services/${id}/request`,
  RELEASE_SERVICE: (id: number) => `${BASE_URL}/api/services/${id}/release`,

  // Default Kits (kits predeterminados)
  DEFAULT_KITS: `${BASE_URL}/api/default-kits`,
  DEFAULT_KIT_BY_ID: (id: number) => `${BASE_URL}/api/default-kits/${id}`,

  // Geographic search (CU-ARRENDATARIO-10)
  ARTICLE_NEARBY: (city: string, country: string, radiusKm = 150) =>
    `${BASE_URL}/api/article/nearby?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&radiusKm=${radiusKm}`,

  ARTICLE_MAP: (country?: string, includeRented: boolean = false) => {
    const params = new URLSearchParams();
    if (country) params.append("country", country);
    if (includeRented) params.append("includeRented", "true");
    const query = params.toString();
    return `${BASE_URL}/api/article/map${query ? `?${query}` : ""}`;
  },

  // Ciudades
  GET_CITIES: `${BASE_URL}/api/cities`,
  GET_COUNTRIES: `${BASE_URL}/api/countries`,
  CITY_COORDINATES: (city: string, country: string) =>
    `${BASE_URL}/api/cities/coordinates?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`,

  // Article history
  GET_ARTICLE_HISTORY: (id: number) => `${BASE_URL}/api/article/record/${id}`,

  // Kit item filtering
  FILTER_ITEMS_FOR_KIT: `${BASE_URL}/api/items/filter-for-kit`,

  // Demand analysis
  DEMAND_ANALYSIS_TOP: (limit?: number) =>
    limit
      ? `${BASE_URL}/api/demand-analysis/top?limit=${limit}`
      : `${BASE_URL}/api/demand-analysis/top`,

  // RGPD
  RGPD_CHECK: `${BASE_URL}/api/rgpd/check`,
  RGPD_ACCEPT: `${BASE_URL}/api/rgpd/accept`,
  RGPD_NEEDS_CONSENT: `${BASE_URL}/api/rgpd/needs-consent`,
  RGPD_CURRENT_POLICY: `${BASE_URL}/api/rgpd/current-policy`,
  ADMIN_CURRENT_POLICY: `${BASE_URL}/api/admin/rgpd/current`,
  ADMIN_CREATE_POLICY: `${BASE_URL}/api/admin/rgpd/policies`,

  // Insignia
  TOGGLE_FOUNDER_BADGE: (id: number) => `${BASE_URL}/api/admin/users/${id}/founder-badge`,

  GET_TRANSACTION_DETAILS: (id: number) => `${BASE_URL}/api/wallet/transactions/${id}/details`,

} as const;

export default BASE_URL;
