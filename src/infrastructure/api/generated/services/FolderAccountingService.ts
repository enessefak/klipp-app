/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FolderAccountingService {
    /**
     * Get folder statistics
     * Get folder dashboard with attachment counts, status breakdown, and financial summary (if applicable).
     * @param folderId
     * @returns any Default Response
     * @throws ApiError
     */
    public static getFoldersStats(
        folderId: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            folder?: {
                id?: string;
                name?: string;
                icon?: string;
                color?: string;
            };
            isOwner?: boolean;
            isFinancial?: boolean;
            attachmentCount?: number;
            /**
             * Count by status (PENDING, APPROVED, REJECTED)
             */
            byStatus?: Record<string, number>;
            /**
             * Count by transaction type (INCOME, EXPENSE, NEUTRAL)
             */
            byType?: Record<string, number>;
            lastUpdated?: string;
            financial?: {
                combined?: {
                    totalIncome?: number;
                    totalExpense?: number;
                    totalTax?: number;
                    netBalance?: number;
                    baseCurrency?: string;
                };
                byCurrency?: Array<{
                    currency?: string;
                    income?: number;
                    expense?: number;
                    tax?: number;
                }>;
            } | null;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/folders/{folderId}/stats',
            path: {
                'folderId': folderId,
            },
            errors: {
                403: `Default Response`,
                404: `Default Response`,
            },
        });
    }
    /**
     * KDV Özeti
     * Hesaplanan ve İndirilecek KDV özeti. Sadece finansal klasörler için çalışır.
     * @param folderId
     * @param year Year (default: current year)
     * @param month Month 1-12 (optional)
     * @returns any Default Response
     * @throws ApiError
     */
    public static getFoldersAccountingKdvSummary(
        folderId: string,
        year?: string,
        month?: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            folder?: {
                id?: string;
                name?: string;
            };
            period?: {
                year?: number;
                month?: number | null;
            };
            /**
             * Satış KDV (Çıktı KDV)
             */
            hesaplananKdv?: number;
            /**
             * Alış KDV (Girdi KDV)
             */
            indirilecekKdv?: number;
            /**
             * Maliyeye ödenecek KDV
             */
            odenecekKdv?: number;
            /**
             * Sonraki döneme devreden KDV
             */
            devredenKdv?: number;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/folders/{folderId}/accounting/kdv-summary',
            path: {
                'folderId': folderId,
            },
            query: {
                'year': year,
                'month': month,
            },
            errors: {
                400: `Default Response`,
                403: `Default Response`,
            },
        });
    }
    /**
     * Gelir-Gider Tablosu
     * Toplam gelir, gider ve kar hesaplaması.
     * @param folderId
     * @param year Year (default: current year)
     * @param month Month 1-12 (optional)
     * @returns any Default Response
     * @throws ApiError
     */
    public static getFoldersAccountingIncomeExpense(
        folderId: string,
        year?: string,
        month?: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            folder?: {
                id?: string;
                name?: string;
            };
            period?: {
                year?: number;
                month?: number | null;
            };
            /**
             * Toplam Gelir
             */
            toplamGelir?: number;
            /**
             * Toplam Gider
             */
            toplamGider?: number;
            /**
             * Brüt Kar (Gelir - Gider)
             */
            brutKar?: number;
            /**
             * KDV Ödemesi
             */
            kdvOdemesi?: number;
            /**
             * Net Kar
             */
            netKar?: number;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/folders/{folderId}/accounting/income-expense',
            path: {
                'folderId': folderId,
            },
            query: {
                'year': year,
                'month': month,
            },
            errors: {
                400: `Default Response`,
                403: `Default Response`,
            },
        });
    }
    /**
     * Kategori Bazlı Gider Dağılımı
     * Giderlerin kategorilere göre dağılımı.
     * @param folderId
     * @param year Year (default: current year)
     * @param month Month 1-12 (optional)
     * @returns any Default Response
     * @throws ApiError
     */
    public static getFoldersAccountingCategoryBreakdown(
        folderId: string,
        year?: string,
        month?: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            folder?: {
                id?: string;
                name?: string;
            };
            period?: {
                year?: number;
                month?: number | null;
            };
            categories?: Array<{
                name?: string;
                amount?: number;
                percentage?: number;
            }>;
            total?: number;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/folders/{folderId}/accounting/category-breakdown',
            path: {
                'folderId': folderId,
            },
            query: {
                'year': year,
                'month': month,
            },
            errors: {
                400: `Default Response`,
                403: `Default Response`,
            },
        });
    }
    /**
     * Aylık Trend
     * 12 aylık gelir/gider trendi.
     * @param folderId
     * @param year
     * @returns any Default Response
     * @throws ApiError
     */
    public static getFoldersAccountingMonthlyTrend(
        folderId: string,
        year?: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            folder?: {
                id?: string;
                name?: string;
            };
            year?: number;
            months?: Array<{
                /**
                 * YYYY-MM format
                 */
                month?: string;
                gelir?: number;
                gider?: number;
                gelirKdv?: number;
                giderKdv?: number;
            }>;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/folders/{folderId}/accounting/monthly-trend',
            path: {
                'folderId': folderId,
            },
            query: {
                'year': year,
            },
            errors: {
                400: `Default Response`,
                403: `Default Response`,
            },
        });
    }
    /**
     * Satıcı Raporu
     * Satıcı/tedarikçi bazlı harcama raporu.
     * @param folderId
     * @param year Year (default: current year)
     * @param month Month 1-12 (optional)
     * @returns any Default Response
     * @throws ApiError
     */
    public static getFoldersAccountingVendorReport(
        folderId: string,
        year?: string,
        month?: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            folder?: {
                id?: string;
                name?: string;
            };
            period?: {
                year?: number;
                month?: number | null;
            };
            vendors?: Array<{
                name?: string;
                totalAmount?: number;
                invoiceCount?: number;
            }>;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/folders/{folderId}/accounting/vendor-report',
            path: {
                'folderId': folderId,
            },
            query: {
                'year': year,
                'month': month,
            },
            errors: {
                400: `Default Response`,
                403: `Default Response`,
            },
        });
    }
}
