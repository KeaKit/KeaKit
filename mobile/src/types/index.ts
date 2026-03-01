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
  token?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
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
}

export interface KitCreateRequest {
  name: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
  deliveryMethod: "COURIER" | "MEETING_POINT";
  meetingPoint?: string;
  tenantId: number;
  itemIds: number[];
}

export interface KitResponse {
  id: number;
  name: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
  deliveryMethod: "COURIER" | "MEETING_POINT";
  meetingPoint?: string;
  tenantId: number;
  itemIds: number[];
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
  imageUrl: string | null;
  pricePerMonth: number;
  status: "AVAILABLE" | "RENTED" | "INACTIVE";
  rentedUntil: string | null;
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
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  CreateKit: undefined;
  Checkout: { kitId: number };
  EditProfile: { user: AuthUser };
  CreateRating: { kitId: number; revieweeId: number; revieweeName: string };
  UserRatings: { userId: number; userName: string };
  MyArticles: undefined;
  UploadArticle: undefined;
};
