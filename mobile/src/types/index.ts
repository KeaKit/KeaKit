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

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: { user: AuthUser };
  EditProfile: { user: AuthUser };
  CreateRating: { kitId: number; revieweeId: number; revieweeName: string };
  UserRatings: { userId: number; userName: string };
};