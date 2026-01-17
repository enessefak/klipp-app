
export enum EInvoiceStatus {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    SENT = 'SENT',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
    ERROR = 'ERROR'
}

export enum EInvoiceDirection {
    OUTGOING = 'OUTGOING',
    INCOMING = 'INCOMING'
}

export interface EInvoice {
    id: string;
    uuid?: string;
    invoiceNumber?: string;
    status: EInvoiceStatus;
    direction: EInvoiceDirection;
    type?: string;
    sentAt?: string | null;
    acceptedAt?: string | null;
    rejectedAt?: string | null;
    errorMessage?: string | null;
    recipientName?: string;
    recipientVkn?: string;
    amount?: number;
    currency?: string;
}

export interface SendEInvoiceDTO {
    recipientVkn: string;
    recipientName: string;
    recipientPk?: string;
    recipientTaxOffice?: string;
    recipientAddress?: string;
    recipientCity?: string;
    invoiceNumber?: string;
    invoiceType?: 'SATIS' | 'IADE' | 'TEVKIFAT' | 'ISTISNA' | 'OZELMATRAH' | 'IHRACKAYITLI';
    profileId?: 'TEMELFATURA' | 'TICARIFATURA' | 'EARSIVFATURA' | 'IHRACAT' | 'KAMU' | 'YOLCUBERABER';
    isEArchive?: boolean;
    notes?: string[];
}
