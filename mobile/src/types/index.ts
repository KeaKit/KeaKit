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
  status: 'AVAILABLE' | 'RENTED' | 'INACTIVE';
  rentedUntil: string | null;
}

export interface KitCreateRequest {
  name: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
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

export interface DraftKitPayload {
  name: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
  tenantId: number;
  itemIds: number[];
}

export interface CreatePaymentIntentRequest {
  baseAmount: number; 
  kitId?: number;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  baseAmount: number;    
  depositAmount: number; 
  totalAmount: number;   
  depositRate: number;   
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  CreateKit: undefined;
  Checkout: { baseAmount: number; draftKit: DraftKitPayload; kitId?: number };
  EditProfile: { user: AuthUser };
  CreateRating: { kitId: number; revieweeId: number; revieweeName: string };
  UserRatings: { userId: number; userName: string };
};