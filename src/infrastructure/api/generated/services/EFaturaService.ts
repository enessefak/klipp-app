/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class EFaturaService {
    /**
     * Get Invoice Types & Form Config
     * Get dynamic invoice form configuration based on country types (e.g., SATIS, OZELMATRAH for TR).
     * @param country Country code (TR, DE, GB, GLOBAL supported)
     * @returns any Default Response
     * @throws ApiError
     */
    public static getEInvoicesInvoiceTypes(
        country: string = 'TR',
    ): CancelablePromise<{
        success?: boolean;
        data?: Array<{
            code?: string;
            name?: string;
            profileIds?: Array<string>;
            sections?: Array<{
                id?: string;
                title?: string;
                type?: 'default' | 'table';
                fields?: Array<Record<string, any>>;
            }>;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/e-invoices/invoice-types',
            query: {
                'country': country,
            },
        });
    }
    /**
     * List Import Formats
     * Get list of supported e-invoice import formats with localized names and descriptions.
     * @returns any Default Response
     * @throws ApiError
     */
    public static getEInvoicesImportFormats(): CancelablePromise<{
        success?: boolean;
        data?: Array<{
            /**
             * Format code (TR_UBL, DE_ZUGFERD, etc.)
             */
            code?: string;
            /**
             * Localized format name
             */
            name?: string;
            /**
             * Localized format description
             */
            description?: string;
            /**
             * Supported file extensions
             */
            extensions?: Array<string>;
            /**
             * Supported MIME types
             */
            mimeTypes?: Array<string>;
            /**
             * Country code (TR, DE, EU, GLOBAL)
             */
            country?: string;
            /**
             * Technical standard (UBL-TR 1.2, ZUGFeRD 2.1, etc.)
             */
            standard?: string;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/e-invoices/import-formats',
        });
    }
    /**
     * Send E-Invoice
     * Send a financial document as E-Fatura to GİB. Requires GIB profile configured on folder.
     * @param attachmentId
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postEInvoicesSend(
        attachmentId: string,
        requestBody: {
            /**
             * Alıcı VKN/TCKN
             */
            recipientVkn: string;
            /**
             * Alıcı adı
             */
            recipientName: string;
            /**
             * Alıcı PK etiketi (E-Fatura için)
             */
            recipientPk?: string;
            recipientTaxOffice?: string;
            recipientAddress?: string;
            recipientCity?: string;
            /**
             * Fatura numarası (otomatik üretilir)
             */
            invoiceNumber?: string;
            /**
             * Fatura tipi (internal code)
             */
            invoiceType?: 'SATIS' | 'IADE' | 'TEVKIFAT' | 'ISTISNA' | 'OZELMATRAH' | 'IHRACKAYITLI';
            /**
             * Fatura senaryosu
             */
            profileId?: 'TEMELFATURA' | 'TICARIFATURA' | 'EARSIVFATURA' | 'IHRACAT' | 'KAMU' | 'YOLCUBERABER';
            /**
             * E-Arşiv mi? (false = E-Fatura)
             */
            isEArchive?: boolean;
            notes?: Array<string>;
        },
    ): CancelablePromise<{
        success?: boolean;
        data?: {
            eInvoiceId?: string;
            uuid?: string;
            invoiceNumber?: string;
            status?: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/e-invoices/send/{attachmentId}',
            path: {
                'attachmentId': attachmentId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get E-Invoice Status
     * Check the status of a sent E-Invoice from GİB.
     * @param eInvoiceId
     * @returns any Default Response
     * @throws ApiError
     */
    public static getEInvoicesStatus(
        eInvoiceId: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: {
            id?: string;
            uuid?: string;
            invoiceNumber?: string;
            status?: string;
            direction?: string;
            type?: string;
            sentAt?: string | null;
            acceptedAt?: string | null;
            rejectedAt?: string | null;
            errorMessage?: string | null;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/e-invoices/status/{eInvoiceId}',
            path: {
                'eInvoiceId': eInvoiceId,
            },
        });
    }
    /**
     * List E-Invoices
     * List E-Invoices for a folder with optional filters.
     * @param folderId
     * @param direction
     * @param status
     * @param limit
     * @param cursor
     * @returns any Default Response
     * @throws ApiError
     */
    public static getEInvoicesFolder(
        folderId: string,
        direction?: 'OUTGOING' | 'INCOMING',
        status?: 'DRAFT' | 'PENDING' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'ERROR',
        limit: number = 20,
        cursor?: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: any[];
        hasMore?: boolean;
        nextCursor?: string | null;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/e-invoices/folder/{folderId}',
            path: {
                'folderId': folderId,
            },
            query: {
                'direction': direction,
                'status': status,
                'limit': limit,
                'cursor': cursor,
            },
        });
    }
    /**
     * Download E-Invoice XML
     * Download the UBL-TR XML of a sent/received E-Invoice.
     * @param eInvoiceId
     * @returns any Default Response
     * @throws ApiError
     */
    public static getEInvoicesDownload(
        eInvoiceId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/e-invoices/download/{eInvoiceId}',
            path: {
                'eInvoiceId': eInvoiceId,
            },
        });
    }
    /**
     * Create Manual E-Invoice
     * Create an invoice manually, generate UBL, and save as Attachment.
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postEInvoicesManual(
        requestBody: {
            folderId: string;
            recipient: Record<string, any>;
            items: Array<{
                name: string;
                quantity: number;
                price: number;
                taxRate: number | string;
                unitCode?: string;
            }>;
            issueDate: string;
            currencyCode?: string;
            invoiceType: string;
            profileId: string;
            notes?: string;
            country?: string;
            attachmentTypeId?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/e-invoices/manual',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Import E-Invoice XML/PDF
     * Upload an E-Invoice file (UBL-TR XML or ZUGFeRD PDF) via multipart/form-data. Automatically detects format, parses content, and creates an attachment with extracted data.
     * @param folderId Target folder ID
     * @param formData
     * @param format Optional: Explicitly specify the e-invoice format. If omitted, format will be auto-detected from file content.
     * @returns any Default Response
     * @throws ApiError
     */
    public static postEInvoicesImport(
        folderId: string,
        formData: {
            /**
             * E-Invoice file (XML or PDF)
             */
            file: Blob;
        },
        format?: 'UBL' | 'PEPPOL_BIS' | 'TR_UBL' | 'DE_ZUGFERD' | 'DE_XRECHNUNG' | 'FR_FACTURX' | 'IT_FATTURAPA' | 'EU_UBL' | 'EU_CII',
    ): CancelablePromise<{
        success?: boolean;
        message?: string;
        data?: {
            /**
             * Created attachment ID
             */
            attachmentId?: string;
            /**
             * Auto-detected e-invoice format
             */
            detectedFormat?: 'TR_UBL' | 'DE_XRECHNUNG' | 'DE_ZUGFERD' | 'EU_UBL' | 'EU_CII';
            details?: {
                invoiceNumber?: string;
                uuid?: string;
                issueDate?: string;
                currency?: string;
                sender?: {
                    vkn?: string;
                    name?: string;
                };
                receiver?: {
                    vkn?: string;
                    name?: string;
                };
                totals?: {
                    payableAmount?: number;
                    taxExclusiveAmount?: number;
                    taxAmount?: number;
                };
                lines?: Array<Record<string, any>>;
            };
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/e-invoices/import/{folderId}',
            path: {
                'folderId': folderId,
            },
            query: {
                'format': format,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
}
