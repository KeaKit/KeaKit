import Ionicons from "@expo/vector-icons/build/Ionicons";
import { DefaultKit } from "./defaultKitTypes";

export type UserRole = "ADMIN" | "USER" | "COURIER";

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  password: string;
  acceptedPolicies?: boolean;
  acceptedMarketing?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address: string;
  city: string;
  country: string;
  founderBadge: boolean; 
  token?: string;
  profileImageUrl?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address: string;
  city: string;
  country: string;
  founderBadge: boolean; 
  profileImageUrl?: string;
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

export interface ArticleRecordDTO {
  tenantName: string;
  tenantId: number;
  startDate: string;
  endDate: string;
  status: KitStatus;
  city: string;
  country: string;
  kitId: number;
}

export interface UserArticle {
  id: number;
  title: string;
  imageUrl: string | null;
  pricePerMonth: number;
  status: "AVAILABLE" | "RENTED" | "INACTIVE";
  rentedUntil: string | null;
  ownerCommissionPromoCode?: string | null;
  totalUnits?: number;
  rentals?: ArticleRecordDTO[];
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
  discount: number;
}

export type ArticleCondition = "NEW" | "LIGHTLY_USED" | "USED" | "WORN";

export interface Article {
  id: number;
  title: string;
  description: string;
  city: string;
  country: string;
  pricePerMonth: number;
  availableFrom: string;
  availableUntil: string;
  category: Category;
  imageUrl: string | null;
  purchaseDate: string | null;
  status: "AVAILABLE" | "RENTED" | "INACTIVE";
  rentedUntil: string | null;
  totalUnits?: number;
  condition: ArticleCondition | null;
  ownerCommissionPromoCode?: string | null;
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
  condition?: ArticleCondition;
  ownerCommissionPromoCode?: string;
}

export interface Item {
  id: number;
  title: string;
  description: string;
  pricePerMonth: number;
  category: string;
  quantity?: number;
}

export interface ItemCatalog {
  id: number;
  itemType: string;
  title: string;
  description: string;
  city: string;
  country: string;
  pricePerMonth: number;
  availableFrom: string; // ISO date (yyyy-mm-dd)
  availableUntil: string; // ISO date
  category: string;
  totalUnits: number;
  ownerId: number;
  ownerName: string;
  status?: string;     // solo para ARTICLE
  condition?: string;  // solo para ARTICLE
  imageUrl?: string;   // solo para ARTICLE
}

export interface ItemFilterRequest {
  minPrice?: number;
  maxPrice?: number;
  country?: string;
  city?: string;
  categoryId?: number;
  condition?: ArticleCondition;
  page?: number;
  size?: number;
   startDate?: string;  
  endDate?: string;   
}

export interface ItemFilterResponse {
  content: ItemCatalog[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ItemCatalogResponse {
  id: number;
    itemType: string; 
    title: string;
    description: string;
    city: string;
    pricePerMonth: number;
    availableFrom: Date;
    availableUntil: Date;
    category: string;
    totalUnits: number;
    ownerId: number;
    ownerName: string;
    status?: string;   // solo para ARTICLE
    imageUrl?: string; // solo para ARTICLE
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
    role: UserRole;
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
  name: string;
  category: string;
  imageUrl: string;
  ownerId: number;
  ownerName: string;
}

export interface KitResponse {
  id: number;
  name: string;
  country: string;
  city: string;
  orderDate: string; // LocalDate -> ISO String
  startDate: string;
  endDate: string;
  estimatedDeliveryDate: string;
  deliveryNotification: string;
  status: KitStatus;
  deliveryMethod: "COURIER" | "MEETING_POINT";
  meetingPoint: string;
  courierPrice?: number;
  tenantId: number;
  itemIds: number[];
  items: KitItemResponse[];
  totalSelectedItems: number;
  subtotalPrice: number;
  guaranteePrice: number;
  platformFee: number;
  totalPrice: number;
  appliedDiscount?: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  status: "ACTIVE" | "DRAFT";
  minPrice: number;
  maxPrice: number;
}



export type IncidentType = "GENERAL" | "DAMAGED_ITEM";
export type IncidentStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

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

export interface DemandAnalysisItem {
  itemId: number;
  title: string;
  categoryName: string;
  imageUrl: string | null;
  totalTimesRented: number;
  totalUnitsRented: number;
}

export type NavbarScreen =
  | "Home"
  | "Profile"
  | "MyArticles"
  | "MyKits"
  | "MyServices"
  | "MyIncidents"
  | "AdminIncidents"
  | "Wallet"
  | "MyKitsHistory"
  | "UserRatings"
  | "AdminUsers"
  | "Categories";

export type NavbarHeaderScreen =
  | "Home"
  | "Profile"
  | "MyArticles"
  | "MyKits"
  | "MyServices"
  | "MyIncidents"
  | "AdminIncidents"
  | "Wallet"
  | "MyKitsHistory"
  | "UserRatings"
  | "AdminUsers"
  | "Categories"
  | "Commission"
  | "DefaultKits"
  | "Login"
  | "Register"
  | "TrackingNotifications"
  | "ActivityNotifications"
  | "Notifications"
  | "AssignedKits";

export interface NavbarHeaderItem {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen: NavbarHeaderScreen;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

export interface HeaderMenuItem {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen?: keyof RootStackParamList;
  onPress?: () => void;
  danger?: boolean;
  badge?: string;
}

export interface HeaderMenuSection {
  title?: string;
  items: HeaderMenuItem[];
}


export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Profile: undefined;
  Notifications: undefined;
  ActivityNotifications: undefined;
  CreateKit: undefined;
  PurchaseDefaultKit: { kitId: number };
  Checkout: { kitId: number };
  EditProfile: { user: AuthUser };
  CreateRating: { kitId: number; revieweeId: number; revieweeName: string };
  UserRatings: { userId: number; userName: string };
  MyIncidents: undefined;
  AdminIncidents: undefined;
  CreateIncident: undefined;
  IncidentDetail: { incidentId: number; isReceived: boolean };
  MyArticles: undefined;
  MyKits: undefined;
  MyKitsHistory: undefined;
  KitDetail: { kitId: number };
  DefaultKits: undefined;
  DefaultKitDetails: { kitId: number };
  EditDefaultKit: { kitId: number };
  UploadArticle: undefined;
  AdminUsers: undefined;
  AdminUserForm: { userId?: number };
  EditArticle: { article: Article };
  Categories: undefined;
  CategoryForm: { category?: Category; mode: "view" | "edit" | "create" };
  MyServices: undefined;
  PromoteService: undefined;
  EditService: { service: Service };
  ServiceDetail: { serviceId: number };
  DefaultKitForm: { defaultKit?: DefaultKit; mode: "edit" | "create" };
  Commission: undefined;
  Wallet: undefined;
  WithdrawMoney: undefined;
  Tracking: { kitId: number };
  TrackingNotifications: undefined;
  AssignedKits: undefined;
  Couriers: undefined;
  CourierDetail: { courier: UserResponse; isBusy?: boolean };
  ArticleRentals: { articleId: number; articleTitle: string };
  RgpdPolicy: undefined;
  EditPolicy: undefined;
  PromoCodes: undefined;
  PromoCodeForm: { promoCode?: PromoCodeFormData; mode: 'create' | 'edit' };
  PilotUsers: undefined;
  TransactionDetail: { 
    transactionId: number; 
    transactionType: string; 
    transactionAmount: number;
  };
};

export interface ProfileData {
  name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export type ServiceStatus = "DRAFT" | "ACTIVE" | "UNAVAILABLE";

export interface Service {
  id: number;
  title: string;
  description: string;
  city: string;
  country: string;
  pricePerMonth: number;
  availableFrom: string;
  availableUntil: string;
  category: Category;
  status: ServiceStatus;
  totalUnits?: number;
  ownerCommissionPromoCode?: string | null;
  rentedUnitsNow: number;
}

export interface ServicePayload {
  title: string;
  description: string;
  city: string;
  pricePerMonth: number;
  availableFrom: string;
  availableUntil: string;
  category: { id: number };
  status?: ServiceStatus;
  totalUnits?: number;
  ownerCommissionPromoCode?: string;
}

export interface UserService {
  id: number;
  title: string;
  pricePerMonth: number;
  status: ServiceStatus;
  rentedUntil: string | null;
  city: string;
  categoryName: string;
}

export interface Wallet {
  id: number;
  balance: number;
  userId: number;
  createdAt: string; // ISO String para emular LocalDateTime
}

export interface WithdrawRequest {
  bankAccount: string;
  amount: number;
}

export interface Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  walletId: number;
  createdAt: string;
}

export enum TransactionType {
  TOP_UP = "TOP_UP",
  PAYOUT = "PAYOUT",
  FEE = "FEE",
  GUARANTEE_DEPOSIT = "GUARANTEE_DEPOSIT",
  GUARANTEE_REFUND = "GUARANTEE_REFUND",
  REFUND = "REFUND",
}

export type DeliveryStatus =
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "NEARBY"
  | "DELIVERED";

export interface KitDeliveryResponse {
  kitId: number;
  status: DeliveryStatus | null;
  estimatedArrival: string | null;
  lastLocation: string | null;
  lastUpdate: string | null;
  courierId: number | null;
  courierName: string | null;
}

export interface UpdateDeliveryRequest {
  status?: DeliveryStatus;
  estimatedArrival?: string;
  lastLocation?: string;
}

export interface PromoCodeFormData {
  id?: number;
  code: string;
  discountRate: number;
  active: boolean;
  singleUse: boolean;
  type?: 'TENANT_DISCOUNT' | 'OWNER_COMMISSION_REDUCTION';
  pilotUserOnly: boolean;
  pilotEmails: string[];
}

export interface PilotUserData {
  id: number;
  email: string;
  active: boolean;
}

export interface TrackingNotification {
  id: string;
  kitId: number;
  kitName: string;
  status: DeliveryStatus;
  message: string;
  createdAt: string;
  read: boolean;
}

export type ActivityNotificationType =
  | "ITEM_RENTED"
  | "RETURN_REMINDER"
  | "DEMAND_ALERT"
  | "ARTICLE_AVAILABLE";

export interface ActivityNotification {
  id: number;
  message: string;
  createdAt: string;
  read: boolean;
  type: ActivityNotificationType;
  relatedKitId: number | null;
  relatedArticleId?: number | null;
}

export interface ArticleNearby {
  id: number;
  itemType: string;
  title: string;
  description: string;
  city: string;
  pricePerMonth: number;
  availableFrom: string | null;
  availableUntil: string | null;
  category: string | null;
  totalUnits: number | null;
  ownerId: number | null;
  ownerName: string | null;
  status: "AVAILABLE" | "RENTED" | "INACTIVE" | null;
  imageUrl: string | null;
  cityLat: number;
  cityLng: number;
  distanceKm: number;
}

export interface ItemPaymentDetail {
  itemId: number;
  itemType: 'ARTICLE' | 'SERVICE';
  name: string;
  category: string | null;
  imageUrl: string | null;
  ownerName: string | null;
  ownerId: number | null;
  quantity: number;
  pricePerMonth: number;
  total: number;
}

export interface TransactionDetails {
  kitId: number;
  kitName: string;
  items: ItemPaymentDetail[];
  subtotal: number;
  guarantee: number;
  platformFee: number;
  courierFee: number;
  discount: number;
  total: number;
  description?: string;
}

export interface TransactionWithDetails extends Transaction {
  details?: TransactionDetails;
}

export * from "./defaultKitTypes";
