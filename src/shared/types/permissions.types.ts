// ============================================================
// Permission Types — RBAC Permission Matrix
// ============================================================

/**
 * All available permissions in the system.
 * Used by CASL to define abilities for each role.
 */
export enum Permission {
  // Quotation Permissions
  CREATE_QUOTATION = 'create:quotation',
  READ_QUOTATION = 'read:quotation',
  READ_OWN_QUOTATION = 'read:own_quotation',
  UPDATE_QUOTATION = 'update:quotation',
  UPDATE_OWN_QUOTATION = 'update:own_quotation',
  DELETE_QUOTATION = 'delete:quotation',
  APPROVE_QUOTATION = 'approve:quotation',
  SEND_QUOTATION = 'send:quotation',

  // Invoice Permissions
  CREATE_INVOICE = 'create:invoice',
  READ_INVOICE = 'read:invoice',
  READ_OWN_INVOICE = 'read:own_invoice',
  UPDATE_INVOICE = 'update:invoice',
  DELETE_INVOICE = 'delete:invoice',
  RECORD_PAYMENT = 'record:payment',

  // Template Permissions
  MANAGE_TEMPLATES = 'manage:templates',
  READ_TEMPLATES = 'read:templates',

  // AI Permissions
  AI_GENERATE = 'ai:generate',
  AI_TRANSCRIBE = 'ai:transcribe',

  // Admin Permissions
  MANAGE_USERS = 'manage:users',
  MANAGE_ROLES = 'manage:roles',
  MANAGE_ORGANIZATION = 'manage:organization',

  // Analytics & Reporting
  VIEW_ANALYTICS = 'view:analytics',
  VIEW_AUDIT_LOGS = 'view:audit_logs',
  EXPORT_DATA = 'export:data',

  // PDF
  GENERATE_PDF = 'generate:pdf',
}

/**
 * User roles in the system.
 * Each role maps to a set of permissions.
 */
export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  TECHNICAL = 'technical',
  NON_TECHNICAL = 'non_technical',
  VIEWER = 'viewer',
}

/**
 * Human-readable role labels.
 */
export const ROLE_LABELS: Record<Role, string> = {
  [Role.OWNER]: 'Owner',
  [Role.ADMIN]: 'Administrator',
  [Role.MANAGER]: 'Manager',
  [Role.TECHNICAL]: 'Technical User',
  [Role.NON_TECHNICAL]: 'Non-Technical User',
  [Role.VIEWER]: 'Viewer',
};

/**
 * Permission matrix: which permissions each role has.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.OWNER]: Object.values(Permission), // Owner has all permissions

  [Role.ADMIN]: [
    Permission.CREATE_QUOTATION,
    Permission.READ_QUOTATION,
    Permission.UPDATE_QUOTATION,
    Permission.DELETE_QUOTATION,
    Permission.APPROVE_QUOTATION,
    Permission.SEND_QUOTATION,
    Permission.CREATE_INVOICE,
    Permission.READ_INVOICE,
    Permission.UPDATE_INVOICE,
    Permission.DELETE_INVOICE,
    Permission.RECORD_PAYMENT,
    Permission.MANAGE_TEMPLATES,
    Permission.READ_TEMPLATES,
    Permission.AI_GENERATE,
    Permission.AI_TRANSCRIBE,
    Permission.MANAGE_USERS,
    Permission.MANAGE_ROLES,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.EXPORT_DATA,
    Permission.GENERATE_PDF,
  ],

  [Role.MANAGER]: [
    Permission.CREATE_QUOTATION,
    Permission.READ_QUOTATION,
    Permission.UPDATE_QUOTATION,
    Permission.DELETE_QUOTATION,
    Permission.APPROVE_QUOTATION,
    Permission.SEND_QUOTATION,
    Permission.CREATE_INVOICE,
    Permission.READ_INVOICE,
    Permission.UPDATE_INVOICE,
    Permission.RECORD_PAYMENT,
    Permission.READ_TEMPLATES,
    Permission.AI_GENERATE,
    Permission.AI_TRANSCRIBE,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_DATA,
    Permission.GENERATE_PDF,
  ],

  [Role.TECHNICAL]: [
    Permission.CREATE_QUOTATION,
    Permission.READ_OWN_QUOTATION,
    Permission.UPDATE_OWN_QUOTATION,
    Permission.READ_TEMPLATES,
    Permission.AI_GENERATE,
    Permission.AI_TRANSCRIBE,
    Permission.GENERATE_PDF,
  ],

  [Role.NON_TECHNICAL]: [
    Permission.CREATE_QUOTATION,
    Permission.READ_OWN_QUOTATION,
    Permission.UPDATE_OWN_QUOTATION,
    Permission.READ_TEMPLATES,
    Permission.AI_GENERATE,
    Permission.AI_TRANSCRIBE,
    Permission.GENERATE_PDF,
  ],

  [Role.VIEWER]: [
    Permission.READ_QUOTATION,
    Permission.READ_INVOICE,
    Permission.READ_TEMPLATES,
  ],
};
