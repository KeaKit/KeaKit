export interface RegisterRequest {
  name: string;
  email: string;
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
  address?: string;
  phone?: string;
  city?: string;
  token?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
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
}

export interface KitCreateRequest {
  name: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
  deliveryMethod: "COURIER" | "MEETING_POINT";
  meetingPoint?: string;
  courierAddress?: string;
  tenantId: number;
  itemIds?: number[];
  itemSelections?: KitItemSelection[];
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
  category: string;
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
  category: string;
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
}

export enum KitStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  PENDING_VALIDATION = "PENDING VALIDATION",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
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
  items?: Item[];
  itemIds?: number[];
  totalPrice?: number;
  deliveryMethod?: "COURIER" | "MEETING_POINT";
  meetingPoint?: string;
  courierPrice?: number;
  itemSelections?: KitItemSelection[];
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

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Notifications: undefined;
  CreateKit: undefined;
  Checkout: { kitId: number };
  EditProfile: { user: AuthUser };
  CreateRating: { kitId: number; revieweeId: number; revieweeName: string };
  UserRatings: { userId: number; userName: string };
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
