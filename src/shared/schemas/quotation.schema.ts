// ============================================================
// Zod Schemas — Quotation
// ============================================================
import { z } from 'zod';

/** Single line item in a quotation */
export const lineItemSchema = z.object({
  id: z.string().uuid().optional(),
  description: z.string().min(1, 'Description is required').max(500),
  category: z.string().max(100).optional(),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.enum(['hours', 'days', 'units', 'months', 'fixed']).default('hours'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  discount: z.number().min(0).max(100).default(0),
  tax: z.number().min(0).max(100).default(0),
});

/** Client information */
export const clientInfoSchema = z.object({
  name: z.string().min(1, 'Client name is required').max(200).trim(),
  email: z.string().email('Invalid client email').toLowerCase().trim().optional(),
  phone: z.string().max(20).trim().optional(),
  company: z.string().max(200).trim().optional(),
  address: z.string().max(500).trim().optional(),
});

/** Milestone within a quotation */
export const milestoneSchema = z.object({
  name: z.string().min(1, 'Milestone name is required').max(200),
  deliverables: z.array(z.string().max(500)).optional(),
  dueDate: z.string().datetime().optional(),
  amount: z.number().min(0).optional(),
  percentage: z.number().min(0).max(100).optional(),
});

/** Create quotation input */
export const createQuotationSchema = z.object({
  projectName: z.string().min(1, 'Project name is required').max(300).trim(),
  projectType: z.string().max(100).trim().optional(),
  description: z.string().max(5000).trim().optional(),
  client: clientInfoSchema,
  items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  milestones: z.array(milestoneSchema).optional(),
  validUntil: z.string().datetime().optional(),
  paymentTerms: z.string().max(1000).optional(),
  termsAndConditions: z.string().max(5000).optional(),
  notes: z.string().max(2000).optional(),
  templateId: z.string().optional(),
  editorContent: z.record(z.unknown()).optional(), // TipTap JSON
  currency: z.string().length(3).default('USD'),
});

/** Update quotation input (partial) */
export const updateQuotationSchema = createQuotationSchema.partial();

/** Status transition input */
export const statusTransitionSchema = z.object({
  status: z.string().min(1, 'Status is required'),
  note: z.string().max(500).optional(),
  reason: z.string().max(500).optional(), // For rejections
});

/** Quotation query params for listing */
export const quotationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'grandTotal', 'quotationNumber']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  clientEmail: z.string().email().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// Inferred Types
export type LineItemInput = z.infer<typeof lineItemSchema>;
export type ClientInfoInput = z.infer<typeof clientInfoSchema>;
export type MilestoneInput = z.infer<typeof milestoneSchema>;
export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
export type UpdateQuotationInput = z.infer<typeof updateQuotationSchema>;
export type StatusTransitionInput = z.infer<typeof statusTransitionSchema>;
export type QuotationQueryInput = z.infer<typeof quotationQuerySchema>;
