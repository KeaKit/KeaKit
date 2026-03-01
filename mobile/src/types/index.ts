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
  status: 'AVAILABLE' | 'RENTED' | 'INACTIVE';
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
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
  UPCOMING = 'UPCOMING',
}

export interface KitResponse {
  id: number;
  name: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
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
  status: 'ACTIVE' | 'DRAFT';
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
  CreateKit: undefined;
  Checkout: { kitId: number };
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
  EditArticle: { article: Article };
  Categories: undefined;
  CategoryForm: { category?: Category , mode: 'view' | 'edit' | 'create' };
};
