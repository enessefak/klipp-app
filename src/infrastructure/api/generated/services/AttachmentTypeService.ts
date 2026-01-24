/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AttachmentTypeService {
    /**
     * List attachment types
     * @returns any Default Response
     * @throws ApiError
     */
    public static getAttachmentTypes(): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: Array<{
            id: string;
            userId?: string | null;
            isSystem?: boolean;
            /**
             * Unique identifier key (e.g. invoice, receipt)
             */
            name: string;
            /**
             * Translated display name (e.g. Fatura, Fiş)
             */
            label: string;
            icon: string;
            color: string;
            expires: boolean;
            transactionType: {
                name: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
                /**
                 * Translated transaction type (e.g. Gider, Gelir)
                 */
                label: string;
            };
            /**
             * Document category for sub-table assignment
             */
            category: 'FINANCIAL' | 'IDENTITY' | 'INSURANCE' | 'CONTRACT' | 'MEDICAL' | 'VEHICLE' | 'EDUCATION' | 'PERSONNEL' | 'OTHER';
            fieldConfig?: Array<{
                key: string;
                label: string;
                type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'duration' | 'array';
                required?: boolean;
                unique?: boolean;
                placeholder?: string;
                unit?: string;
                options?: Array<{
                    key: string;
                    label: string;
                }>;
                defaultValue?: any;
                filterable?: boolean;
                filterType?: 'text' | 'number' | 'date' | 'dateRange' | 'select' | 'amount';
                itemConfig?: Array<any>;
            }> | null;
            defaultDetails?: Record<string, any> | null;
            fieldStyle?: {
                mobile?: {
                    gridTemplateAreas: Array<string>;
                    gap?: string;
                };
                desktop?: {
                    gridTemplateAreas: Array<string>;
                    gap?: string;
                };
            } | null;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/attachment-types/',
        });
    }
    /**
     * Create custom attachment type
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postAttachmentTypes(
        requestBody: {
            name: string;
            icon: string;
            color: string;
            transactionType: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
            category: 'FINANCIAL' | 'IDENTITY' | 'INSURANCE' | 'CONTRACT' | 'MEDICAL' | 'VEHICLE' | 'EDUCATION' | 'PERSONNEL' | 'OTHER';
            fieldConfig?: any[];
            fieldStyle?: any;
            parentId?: string;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            userId?: string | null;
            isSystem?: boolean;
            /**
             * Unique identifier key (e.g. invoice, receipt)
             */
            name: string;
            /**
             * Translated display name (e.g. Fatura, Fiş)
             */
            label: string;
            icon: string;
            color: string;
            expires: boolean;
            transactionType: {
                name: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
                /**
                 * Translated transaction type (e.g. Gider, Gelir)
                 */
                label: string;
            };
            /**
             * Document category for sub-table assignment
             */
            category: 'FINANCIAL' | 'IDENTITY' | 'INSURANCE' | 'CONTRACT' | 'MEDICAL' | 'VEHICLE' | 'EDUCATION' | 'PERSONNEL' | 'OTHER';
            fieldConfig?: Array<{
                key: string;
                label: string;
                type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'duration' | 'array';
                required?: boolean;
                unique?: boolean;
                placeholder?: string;
                unit?: string;
                options?: Array<{
                    key: string;
                    label: string;
                }>;
                defaultValue?: any;
                filterable?: boolean;
                filterType?: 'text' | 'number' | 'date' | 'dateRange' | 'select' | 'amount';
                itemConfig?: Array<any>;
            }> | null;
            defaultDetails?: Record<string, any> | null;
            fieldStyle?: {
                mobile?: {
                    gridTemplateAreas: Array<string>;
                    gap?: string;
                };
                desktop?: {
                    gridTemplateAreas: Array<string>;
                    gap?: string;
                };
            } | null;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/attachment-types/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update custom attachment type
     * @param id
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static putAttachmentTypes(
        id: string,
        requestBody?: {
            name?: string;
            icon?: string;
            color?: string;
            transactionType?: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
            category?: 'FINANCIAL' | 'IDENTITY' | 'INSURANCE' | 'CONTRACT' | 'MEDICAL' | 'VEHICLE' | 'EDUCATION' | 'PERSONNEL' | 'OTHER';
            fieldConfig?: any[];
            fieldStyle?: any;
            parentId?: string;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            userId?: string | null;
            isSystem?: boolean;
            /**
             * Unique identifier key (e.g. invoice, receipt)
             */
            name: string;
            /**
             * Translated display name (e.g. Fatura, Fiş)
             */
            label: string;
            icon: string;
            color: string;
            expires: boolean;
            transactionType: {
                name: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
                /**
                 * Translated transaction type (e.g. Gider, Gelir)
                 */
                label: string;
            };
            /**
             * Document category for sub-table assignment
             */
            category: 'FINANCIAL' | 'IDENTITY' | 'INSURANCE' | 'CONTRACT' | 'MEDICAL' | 'VEHICLE' | 'EDUCATION' | 'PERSONNEL' | 'OTHER';
            fieldConfig?: Array<{
                key: string;
                label: string;
                type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'duration' | 'array';
                required?: boolean;
                unique?: boolean;
                placeholder?: string;
                unit?: string;
                options?: Array<{
                    key: string;
                    label: string;
                }>;
                defaultValue?: any;
                filterable?: boolean;
                filterType?: 'text' | 'number' | 'date' | 'dateRange' | 'select' | 'amount';
                itemConfig?: Array<any>;
            }> | null;
            defaultDetails?: Record<string, any> | null;
            fieldStyle?: {
                mobile?: {
                    gridTemplateAreas: Array<string>;
                    gap?: string;
                };
                desktop?: {
                    gridTemplateAreas: Array<string>;
                    gap?: string;
                };
            } | null;
        };
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/attachment-types/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete custom attachment type
     * @param id
     * @returns any Default Response
     * @throws ApiError
     */
    public static deleteAttachmentTypes(
        id: string,
    ): CancelablePromise<{
        success: boolean;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/attachment-types/{id}',
            path: {
                'id': id,
            },
        });
    }
}
