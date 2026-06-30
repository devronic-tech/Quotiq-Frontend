// ============================================================
// Zod Schemas — Invoice
// ============================================================
import { z } from 'zod';
import { lineItemSchema, clientInfoSchema } from './quotation.schema';

/** Payment record */
export const paymentSchema = z.object({
  date: z.string().datetime(),
  amount: z.number().positive('Payment amount must be positive'),
  method: z.enum(['bank_transfer', 'credit_card', 'cash', 'cheque', 'online', 'other']),
  reference: z.string().max(200).optional(),
  note: z.string().max(500).optional(),
});

/** Create invoice input */
export const createInvoiceSchema = z.object({
  projectName: z.string().min(1, 'Project name is required').max(300).trim(),
  description: z.string().max(5000).trim().optional(),
  client: clientInfoSchema,
  items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  dueDate: z.string().datetime(),
  paymentTerms: z.string().max(1000).optional(),
  termsAndConditions: z.string().max(5000).optional(),
  notes: z.string().max(2000).optional(),
  templateId: z.string().optional(),
  editorContent: z.record(z.unknown()).optional(),
  currency: z.string().length(3).default('USD'),
  sourceQuotationId: z.string().optional(), // If converted from quotation
});

/** Update invoice input (partial) */
export const updateInvoiceSchema = createInvoiceSchema.partial();

/** Record payment input */
export const recordPaymentSchema = paymentSchema;

/** Invoice query params for listing */
export const invoiceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'grandTotal', 'invoiceNumber', 'dueDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  clientEmail: z.string().email().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  overdue: z.coerce.boolean().optional(),
});

// Inferred Types
export type PaymentInput = z.infer<typeof paymentSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type InvoiceQueryInput = z.infer<typeof invoiceQuerySchema>;
