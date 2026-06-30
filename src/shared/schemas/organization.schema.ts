// ============================================================
// Zod Schemas — Organization
// ============================================================
import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').max(100).trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim().optional(),
  phone: z.string().max(20).trim().optional(),
  website: z.string().url('Invalid website URL').trim().optional(),
  address: z.object({
    street: z.string().max(200).trim().optional(),
    city: z.string().max(100).trim().optional(),
    state: z.string().max(100).trim().optional(),
    zipCode: z.string().max(20).trim().optional(),
    country: z.string().max(100).trim().optional(),
  }).optional(),
  currency: z.string().length(3, 'Currency must be a 3-letter ISO code').default('USD'),
  taxRate: z.number().min(0).max(100).default(0),
  quotationPrefix: z.string().min(1).max(10).default('QT'),
  invoicePrefix: z.string().min(1).max(10).default('INV'),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

export const organizationSettingsSchema = z.object({
  defaultPaymentTerms: z.string().max(500).optional(),
  defaultFooterText: z.string().max(1000).optional(),
  defaultQuotationValidity: z.number().int().min(1).max(365).default(30), // days
  defaultInvoiceDueDays: z.number().int().min(1).max(365).default(30),
  brandColors: z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#001B48'),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#02457A'),
    accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#018ABE'),
  }).optional(),
});

// Inferred Types
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type OrganizationSettingsInput = z.infer<typeof organizationSettingsSchema>;
