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

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  CreateKit: undefined;
  Checkout: { kitId: number };
  EditProfile: { user: AuthUser };
};