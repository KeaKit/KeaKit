export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  phone: string;
  address: string;
  city: string;
  country: string;
  token?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  phone: string;
  address: string;
  city: string;
  country: string;
  token: string;
}

export interface RatingCreateRequest {
  revieweeId: number;
  kitId: number;
  score: number;
  comment?: string;
}

export interface RatingResponse {
  id: number;
  reviewerId: number;
  reviewerName: string;
  revieweeId: number;
  revieweeName: string;
  kitId: number;
  kitName: string;
  score: number;
  comment: string;
  type: string;
  createdAt: string;
}

export interface UserArticle {
  id: number;
  title: string;
  imageUrl: string | null;
  pricePerMonth: number;
  status: "AVAILABLE" | "RENTED" | "INACTIVE";
  rentedUntil: string | null;
  totalUnits?: number;
}

export interface KitItemSelection {
  itemId: number;
  quantity: number;
  pricePerMonth: number;
}

export interface ItemSelectionRequest {
  itemId: number;
  quantity: number;
  pricePerMonth: number;
}

export interface KitCreateRequest {
  name: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
  status?: KitStatus;
  deliveryMethod: "COURIER" | "MEETING_POINT";
  meetingPoint?: string;
  tenantId: number;
  itemSelections: ItemSelectionRequest[]; 
}

export interface KitPaymentDTO {
  totalPrice: number;
  subtotalPrice: number;
  guarantee: number;
  platformfee: number;
  courierPrice: number;
}

export interface RatingCreateRequest {
  revieweeId: number;
  kitId: number;
  score: number;
  comment?: string;
}

export interface RatingResponse {
  id: number;
  reviewerId: number;
  reviewerName: string;
  revieweeId: number;
  revieweeName: string;
  kitId: number;
  kitName: string;
  score: number;
  comment: string;
  type: string;
  createdAt: string;
}

export interface Article {
  id: number;
  title: string;
  description: string;
  city: string;
  pricePerMonth: number;
  availableFrom: string;
  availableUntil: string;
  category: Category;
  imageUrl: string | null;
  purchaseDate: string | null;
  status: "AVAILABLE" | "RENTED" | "INACTIVE";
  rentedUntil: string | null;
  totalUnits?: number;
}

export interface ArticlePayload {
  title: string;
  description: string;
  city: string;
  pricePerMonth: number;
  availableFrom: string;
  availableUntil: string;
  category: Category;
  status?: "AVAILABLE" | "RENTED" | "INACTIVE";
  imageUrl?: string;
  purchaseDate?: string;
  totalUnits?: number;
}

export interface Item {
  id: number;
  title: string;
  description: string;
  pricePerMonth: number;
  category: string;
  quantity?: number;
}

export enum KitStatus {
  DRAFT = "DRAFT",
  PAID = "PAID",
  ACTIVE = "ACTIVE",
  CANCELLED = "CANCELLED",
  FINISHED = "FINISHED",
}

export interface Kit {
  id: number;
  name: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
  orderDate?: string;
  status: KitStatus;
  deliveryMethod: "COURIER" | "MEETING_POINT";
  meetingPoint?: string;
  courierPrice?: number;
  tenant: {
    id: number;
    email: string;
    password: string;
    name: string;
    role: "ADMIN" | "USER";
    phone: string;
    address: string;
    city: string;
    country: string;
  };
  kitItems: {
    id: number;
    item: Item;
    quantity: number;
    pricePerMonth: number;
  }[];
  items?: Item[];
  totalPrice?: number;
}

export interface KitItemResponse {
  itemId: number;
  quantity: number;
  pricePerMonth: number;
  name?: string | null;
  category?: string | null;
  imageUrl?: string | null;
}

export interface KitResponse {
  id: number;
  name: string;
  country: string;
  city: string;
  orderDate?: string;
  startDate: string;
  endDate: string;
  estimatedDeliveryDate?: string;
  deliveryNotification?: string;
  status?: KitStatus;
  tenantId: number;
  items?: KitItemResponse[];
  itemIds?: number[];
  subtotalPrice?: number;
  guaranteePrice?: number;
  platformFee?: number;
  totalPrice?: number;
  deliveryMethod?: "COURIER" | "MEETING_POINT";
  meetingPoint?: string;
  courierPrice?: number;
  totalSelectedItems?: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  status: "ACTIVE" | "DRAFT";
  minPrice: number;
  maxPrice: number;
}

// === Incidents ===

export type IncidentType = 'GENERAL' | 'DAMAGED_ITEM';
export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface IncidentResponse {
  id: number;
  title: string;
  description: string;
  type: IncidentType;
  status: IncidentStatus;
  user: {
    id: number;
    name: string;
    email: string;
  };
  relatedItem: {
    id: number;
    title: string;
    owner: {
      id: number;
      name: string;
    };
  } | null;
}

export interface IncidentCreateRequest {
  title: string;
  description: string;
  type: IncidentType;
  user: { id: number };
  relatedItem?: { id: number } | null;
}

export interface IncidentCommentResponse {
  id: number;
  text: string;
  createdAt: string;
  author: {
    id: number;
    name: string;
  };
}

export interface IncidentCommentCreateRequest {
  text: string;
  author: { id: number };
}

export interface RentedItemResponse {
  itemId: number;
  itemTitle: string;
  ownerName: string;
  ownerId: number;
  kitId: number;
  kitName: string;
  startDate: string;
  endDate: string;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Profile: undefined;
  Notifications: undefined;
  CreateKit: undefined;
  Checkout: KitResponse;
  EditProfile: { user: AuthUser };
  CreateRating: { kitId: number; revieweeId: number; revieweeName: string };
  UserRatings: { userId: number; userName: string };
  MyIncidents: undefined;
  CreateIncident: undefined;
  IncidentDetail: { incidentId: number; isReceived: boolean };
  MyArticles: undefined;
  MyKits: undefined;
  KitDetail: { kitId: number };
  UploadArticle: undefined;
  AdminUsers: undefined;
  AdminUserForm: { userId?: number };
  EditArticle: { article: Article };
  Categories: undefined;
  CategoryForm: { category?: Category; mode: "view" | "edit" | "create" };
};

export interface ProfileData {
  name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export const EUROPEAN_COUNTRIES = [
  { value: "Albania", label: "Albania" },
  { value: "Andorra", label: "Andorra" },
  { value: "Armenia", label: "Armenia" },
  { value: "Austria", label: "Austria" },
  { value: "Azerbaijan", label: "Azerbaiyán" },
  { value: "Belarus", label: "Bielorrusia" },
  { value: "Belgium", label: "Bélgica" },
  { value: "Bosnia and Herzegovina", label: "Bosnia y Herzegovina" },
  { value: "Bulgaria", label: "Bulgaria" },
  { value: "Croatia", label: "Croacia" },
  { value: "Cyprus", label: "Chipre" },
  { value: "Czech Republic", label: "República Checa" },
  { value: "Denmark", label: "Dinamarca" },
  { value: "Estonia", label: "Estonia" },
  { value: "Finland", label: "Finlandia" },
  { value: "France", label: "Francia" },
  { value: "Georgia", label: "Georgia" },
  { value: "Germany", label: "Alemania" },
  { value: "Greece", label: "Grecia" },
  { value: "Hungary", label: "Hungría" },
  { value: "Iceland", label: "Islandia" },
  { value: "Ireland", label: "Irlanda" },
  { value: "Italy", label: "Italia" },
  { value: "Kazakhstan", label: "Kazajistán" },
  { value: "Kosovo", label: "Kosovo" },
  { value: "Latvia", label: "Letonia" },
  { value: "Liechtenstein", label: "Liechtenstein" },
  { value: "Lithuania", label: "Lituania" },
  { value: "Luxembourg", label: "Luxemburgo" },
  { value: "Malta", label: "Malta" },
  { value: "Moldova", label: "Moldavia" },
  { value: "Monaco", label: "Mónaco" },
  { value: "Montenegro", label: "Montenegro" },
  { value: "Netherlands", label: "Países Bajos" },
  { value: "North Macedonia", label: "Macedonia del Norte" },
  { value: "Norway", label: "Noruega" },
  { value: "Poland", label: "Polonia" },
  { value: "Portugal", label: "Portugal" },
  { value: "Romania", label: "Rumanía" },
  { value: "Russia", label: "Rusia" },
  { value: "San Marino", label: "San Marino" },
  { value: "Serbia", label: "Serbia" },
  { value: "Slovakia", label: "Eslovaquia" },
  { value: "Slovenia", label: "Eslovenia" },
  { value: "Spain", label: "España" },
  { value: "Sweden", label: "Suecia" },
  { value: "Switzerland", label: "Suiza" },
  { value: "Turkey", label: "Turquía" },
  { value: "Ukraine", label: "Ucrania" },
  { value: "United Kingdom", label: "Reino Unido" },
  { value: "Vatican City", label: "Ciudad del Vaticano" }
];
