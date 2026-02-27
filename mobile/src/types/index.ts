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
  phone: string;
  address: string;
  city: string;
  country: string;
  token: string;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: { user: AuthUser };
  EditProfile: { user: AuthUser };
};

export interface ProfileData {
  name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}