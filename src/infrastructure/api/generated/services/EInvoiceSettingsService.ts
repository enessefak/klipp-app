/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class EInvoiceSettingsService {
    /**
     * Get E-Invoice Settings
     * Get E-Invoice configuration for a folder.
     * @param folderId
     * @returns any Default Response
     * @throws ApiError
     */
    public static getEInvoiceSettings(
        folderId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/e-invoice-settings/{folderId}',
            path: {
                'folderId': folderId,
            },
        });
    }
    /**
     * Update E-Invoice Settings
     * Configure E-Invoice provider settings.
     * @param folderId
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static putEInvoiceSettings(
        folderId: string,
        requestBody: {
            /**
             * Şirket adı
             */
            companyName: string;
            /**
             * VKN (10 hane) veya TCKN (11 hane)
             */
            taxNumber: string;
            /**
             * Vergi dairesi
             */
            taxOffice: string;
            /**
             * Adres
             */
            address: string;
            /**
             * Şehir
             */
            city: string;
            /**
             * Ülke
             */
            country?: string;
            /**
             * Telefon
             */
            phone?: string;
            /**
             * E-posta
             */
            email?: string;
            /**
             * Web sitesi
             */
            webSite?: string;
            /**
             * Provider Enum (QNB, UYUMSOFT, etc.)
             */
            provider?: string;
            /**
             * Provider Display Name
             */
            providerName?: string;
            /**
             * API Keys/Secrets
             */
            apiCredentials?: Record<string, any>;
            /**
             * Varsayılan fatura tipi
             */
            defaultInvoiceType?: 'SATIS' | 'IADE' | 'ISTISNA' | 'OZELMATRAH' | 'IHRACKAYITLI';
            /**
             * Aktif mi?
             */
            isActive?: boolean;
        },
    ): CancelablePromise<{
        success?: boolean;
        data?: {
            id?: string;
            folderId?: string;
            companyName?: string;
            taxNumber?: string;
            taxOffice?: string;
            address?: string;
            city?: string;
            country?: string;
            phone?: string | null;
            email?: string | null;
            webSite?: string | null;
            provider?: string;
            providerName?: string | null;
            defaultInvoiceType?: string;
            invoicePrefix?: string | null;
            lastInvoiceNumber?: number;
            isActive?: boolean;
            isConfigured?: boolean;
            hasApiCredentials?: boolean;
            createdAt?: string;
            updatedAt?: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/e-invoice-settings/{folderId}',
            path: {
                'folderId': folderId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete E-Invoice Settings
     * Remove E-Invoice configuration for a folder.
     * @param folderId
     * @returns any Default Response
     * @throws ApiError
     */
    public static deleteEInvoiceSettings(
        folderId: string,
    ): CancelablePromise<{
        success?: boolean;
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/e-invoice-settings/{folderId}',
            path: {
                'folderId': folderId,
            },
        });
    }
}
