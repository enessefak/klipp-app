export interface EInvoiceSettings {
    id: string;
    folderId: string;
    companyName: string;
    taxNumber: string;
    taxOffice: string;
    address: string;
    city: string;
    country?: string;
    phone?: string | null;
    email?: string | null;
    webSite?: string | null;
    provider?: string;
    providerName?: string | null;
    defaultInvoiceType?: string;
    isActive?: boolean;
    isConfigured?: boolean;
    hasApiCredentials?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface UpdateEInvoiceSettingsDTO {
    companyName: string;
    taxNumber: string;
    taxOffice: string;
    address: string;
    city: string;
    country?: string;
    phone?: string;
    email?: string;
    webSite?: string;
    provider?: string;
    providerName?: string;
    apiCredentials?: Record<string, any>;
    defaultInvoiceType?: 'SATIS' | 'IADE' | 'ISTISNA' | 'OZELMATRAH' | 'IHRACKAYITLI';
    isActive?: boolean;
}
