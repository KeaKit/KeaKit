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

export interface Article {
  id: number;
  title: string;
  imageUrl: string | null;
  pricePerMonth: number;
  status: 'AVAILABLE' | 'RENTED' | 'INACTIVE';
  rentedUntil: string | null;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: { user: AuthUser };
  EditProfile: { user: AuthUser };
  MyArticles: undefined;
};