import { FieldConfig } from './AttachmentTypeFields';

export interface Attachment {
    id: string;
    userId: string;
    folderId: string;
    attachmentTypeId: string;
    title: string;
    description: string | null;
    // amount and currency removed, now in details
    documentDate: string; // ISO 8601 date-time
    details?: Record<string, any> | null;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason?: string | null;
    isOwner?: boolean;
    permission?: 'VIEW' | 'EDIT' | 'CREATE' | 'FULL';
    createdAt: string; // ISO 8601 date-time
    updatedAt: string; // ISO 8601 date-time
}

export interface AttachmentType {
    id: string;
    name: string;
    icon: string;
    color: string;
    requiresWarranty: boolean;
    fieldConfig?: FieldConfig[];
    defaultDetails?: Record<string, any>;
}

// Default attachment type IDs (will be fetched from server)
export const AttachmentTypeIds = {
    INVOICE: 'invoice',
    RECEIPT: 'receipt',
    PAYMENT_RECEIPT: 'payment_receipt',
    WARRANTY: 'warranty',
    CONTRACT: 'contract',
    CERTIFICATE: 'certificate',
    INSURANCE: 'insurance',
    LICENSE: 'license',
    SUBSCRIPTION: 'subscription',
    BILL: 'bill',
    TICKET: 'ticket',
    PRESCRIPTION: 'prescription',
    MEDICAL_REPORT: 'medical_report',
    TAX_DOCUMENT: 'tax_document',
    BANK_STATEMENT: 'bank_statement',
    DEED: 'deed',
    VEHICLE_DOCUMENT: 'vehicle_document',
    PASSPORT: 'passport',
    ID_CARD: 'id_card',
    DIPLOMA: 'diploma',
    MEMBERSHIP_CARD: 'membership_card',
    CHECK: 'check',
    BANK_SLIP: 'bank_slip',
    OTHER: 'other'
};

export interface CreateAttachmentDTO {
    folderId: string;
    attachmentTypeId: string;
    title: string;
    description?: string;
    // amount and currency moved to details
    documentDate: string;
    details?: Record<string, any>;
}

// Filter parameters for fetching attachments
export interface AttachmentFilters {
    folderId?: string;
    categoryId?: string;
    attachmentTypeId?: string;
    title?: string;
    search?: string;
    // amount filters removed
    documentDateFrom?: string;
    documentDateTo?: string;
    createdAtFrom?: string;
    createdAtTo?: string;
    includeShared?: boolean; // Include attachments from shared folders
    detailsFilter?: string; // JSON string for filtering by details fields
}

// Pagination parameters
export interface PaginationParams {
    cursor?: string;
    limit?: number;
}

// Paginated response
export interface PaginatedAttachments {
    items: Attachment[];
    hasMore: boolean;
    nextCursor: string | null;
}
