// ============================================================
// Shared Types — API Response Types
// ============================================================

/** Standard API success response */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

/** Standard API error response */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: Record<string, string[]>;
    stack?: string; // Only in development
  };
  requestId?: string;
}

/** Pagination metadata */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** Paginated response helper */
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

/** Sort options */
export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

/** Base entity with audit fields */
export interface BaseEntity {
  _id: string;
  tenantId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

/** User profile response (safe — no password) */
export interface UserProfile {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

/** Auth tokens response */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

/** Login response */
export interface LoginResponse {
  user?: UserProfile;
  tokens?: AuthTokens;
  otpRequired?: boolean;
  email?: string;
}

/** Organization summary */
export interface OrganizationSummary {
  _id: string;
  name: string;
  slug: string;
  logo: string | null;
  currency: string;
  quotationPrefix: string;
  invoicePrefix: string;
}
