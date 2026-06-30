// ============================================================
// Workflow States — Quotation & Invoice Status Machines
// ============================================================

/**
 * All possible states for a quotation document.
 */
export enum QuotationStatus {
  DRAFT = 'draft',
  AI_GENERATED = 'ai_generated',
  UNDER_REVIEW = 'under_review',
  EDITED = 'edited',
  APPROVED = 'approved',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CONVERTED = 'converted_to_invoice',
  ARCHIVED = 'archived',
}

/**
 * All possible states for an invoice document.
 */
export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

/**
 * Valid state transitions for quotations.
 * Maps current state → allowed next states.
 */
export const QUOTATION_TRANSITIONS: Record<QuotationStatus, QuotationStatus[]> = {
  [QuotationStatus.DRAFT]: [QuotationStatus.UNDER_REVIEW, QuotationStatus.ARCHIVED],
  [QuotationStatus.AI_GENERATED]: [QuotationStatus.UNDER_REVIEW, QuotationStatus.EDITED, QuotationStatus.ARCHIVED],
  [QuotationStatus.UNDER_REVIEW]: [QuotationStatus.APPROVED, QuotationStatus.EDITED, QuotationStatus.REJECTED, QuotationStatus.ARCHIVED],
  [QuotationStatus.EDITED]: [QuotationStatus.UNDER_REVIEW, QuotationStatus.ARCHIVED],
  [QuotationStatus.APPROVED]: [QuotationStatus.SENT, QuotationStatus.EDITED, QuotationStatus.ARCHIVED],
  [QuotationStatus.SENT]: [QuotationStatus.ACCEPTED, QuotationStatus.REJECTED, QuotationStatus.ARCHIVED],
  [QuotationStatus.ACCEPTED]: [QuotationStatus.CONVERTED, QuotationStatus.ARCHIVED],
  [QuotationStatus.REJECTED]: [QuotationStatus.DRAFT, QuotationStatus.ARCHIVED],
  [QuotationStatus.CONVERTED]: [QuotationStatus.ARCHIVED],
  [QuotationStatus.ARCHIVED]: [QuotationStatus.DRAFT], // Can restore
};

/**
 * Valid state transitions for invoices.
 */
export const INVOICE_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  [InvoiceStatus.DRAFT]: [InvoiceStatus.SENT, InvoiceStatus.CANCELLED],
  [InvoiceStatus.SENT]: [InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.PAID, InvoiceStatus.OVERDUE, InvoiceStatus.CANCELLED],
  [InvoiceStatus.PARTIALLY_PAID]: [InvoiceStatus.PAID, InvoiceStatus.OVERDUE, InvoiceStatus.CANCELLED],
  [InvoiceStatus.PAID]: [InvoiceStatus.REFUNDED],
  [InvoiceStatus.OVERDUE]: [InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.PAID, InvoiceStatus.CANCELLED],
  [InvoiceStatus.CANCELLED]: [],
  [InvoiceStatus.REFUNDED]: [],
};

/**
 * Human-readable labels for quotation statuses.
 */
export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  [QuotationStatus.DRAFT]: 'Draft',
  [QuotationStatus.AI_GENERATED]: 'AI Generated',
  [QuotationStatus.UNDER_REVIEW]: 'Under Review',
  [QuotationStatus.EDITED]: 'Edited',
  [QuotationStatus.APPROVED]: 'Approved',
  [QuotationStatus.SENT]: 'Sent',
  [QuotationStatus.ACCEPTED]: 'Accepted',
  [QuotationStatus.REJECTED]: 'Rejected',
  [QuotationStatus.CONVERTED]: 'Converted to Invoice',
  [QuotationStatus.ARCHIVED]: 'Archived',
};

/**
 * Human-readable labels for invoice statuses.
 */
export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.DRAFT]: 'Draft',
  [InvoiceStatus.SENT]: 'Sent',
  [InvoiceStatus.PARTIALLY_PAID]: 'Partially Paid',
  [InvoiceStatus.PAID]: 'Paid',
  [InvoiceStatus.OVERDUE]: 'Overdue',
  [InvoiceStatus.CANCELLED]: 'Cancelled',
  [InvoiceStatus.REFUNDED]: 'Refunded',
};

/**
 * Status badge color mapping for UI.
 */
export const QUOTATION_STATUS_COLORS: Record<QuotationStatus, string> = {
  [QuotationStatus.DRAFT]: 'gray',
  [QuotationStatus.AI_GENERATED]: 'purple',
  [QuotationStatus.UNDER_REVIEW]: 'yellow',
  [QuotationStatus.EDITED]: 'blue',
  [QuotationStatus.APPROVED]: 'green',
  [QuotationStatus.SENT]: 'cyan',
  [QuotationStatus.ACCEPTED]: 'emerald',
  [QuotationStatus.REJECTED]: 'red',
  [QuotationStatus.CONVERTED]: 'indigo',
  [QuotationStatus.ARCHIVED]: 'slate',
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.DRAFT]: 'gray',
  [InvoiceStatus.SENT]: 'blue',
  [InvoiceStatus.PARTIALLY_PAID]: 'yellow',
  [InvoiceStatus.PAID]: 'green',
  [InvoiceStatus.OVERDUE]: 'red',
  [InvoiceStatus.CANCELLED]: 'slate',
  [InvoiceStatus.REFUNDED]: 'orange',
};

/**
 * Validates whether a state transition is allowed.
 */
export function isValidQuotationTransition(
  from: QuotationStatus,
  to: QuotationStatus
): boolean {
  return QUOTATION_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Validates whether an invoice state transition is allowed.
 */
export function isValidInvoiceTransition(
  from: InvoiceStatus,
  to: InvoiceStatus
): boolean {
  return INVOICE_TRANSITIONS[from]?.includes(to) ?? false;
}
