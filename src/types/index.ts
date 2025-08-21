import { UserRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  address: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  address: string;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CreateStoreRequest {
  name: string;
  email: string;
  address: string;
  ownerEmail: string;
}

export interface SubmitRatingRequest {
  storeId: string;
  rating: number;
}

export interface StoreWithRating {
  id: string;
  name: string;
  email: string;
  address: string;
  averageRating: number;
  userRating?: number;
  totalRatings: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}