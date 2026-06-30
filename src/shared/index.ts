// ============================================================
// @quotation/shared — Public API
// ============================================================

// ── Schemas ─────────────────────────────────────────────────
export {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
  type RegisterInput,
  type LoginInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type ChangePasswordInput,
  type RefreshTokenInput,
} from './schemas/auth.schema';

export {
  createOrganizationSchema,
  updateOrganizationSchema,
  organizationSettingsSchema,
  type CreateOrganizationInput,
  type UpdateOrganizationInput,
  type OrganizationSettingsInput,
} from './schemas/organization.schema';

export {
  lineItemSchema,
  clientInfoSchema,
  milestoneSchema,
  createQuotationSchema,
  updateQuotationSchema,
  statusTransitionSchema,
  quotationQuerySchema,
  type LineItemInput,
  type ClientInfoInput,
  type MilestoneInput,
  type CreateQuotationInput,
  type UpdateQuotationInput,
  type StatusTransitionInput,
  type QuotationQueryInput,
} from './schemas/quotation.schema';

export {
  paymentSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  recordPaymentSchema,
  invoiceQuerySchema,
  type PaymentInput,
  type CreateInvoiceInput,
  type UpdateInvoiceInput,
  type RecordPaymentInput,
  type InvoiceQueryInput,
} from './schemas/invoice.schema';

// ── Types ───────────────────────────────────────────────────
export {
  Permission,
  Role,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
} from './types/permissions.types';

export type {
  ApiResponse,
  ApiErrorResponse,
  PaginationMeta,
  PaginatedResponse,
  SortOptions,
  BaseEntity,
  UserProfile,
  AuthTokens,
  LoginResponse,
  OrganizationSummary,
} from './types/api.types';

// ── Constants ───────────────────────────────────────────────
export {
  QuotationStatus,
  InvoiceStatus,
  QUOTATION_TRANSITIONS,
  INVOICE_TRANSITIONS,
  QUOTATION_STATUS_LABELS,
  INVOICE_STATUS_LABELS,
  QUOTATION_STATUS_COLORS,
  INVOICE_STATUS_COLORS,
  isValidQuotationTransition,
  isValidInvoiceTransition,
} from './constants/workflow-states';
