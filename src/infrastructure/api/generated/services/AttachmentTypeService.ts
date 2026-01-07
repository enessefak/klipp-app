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
            fieldConfig?: Array<{
                key: string;
                label: string;
                type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'duration';
                required?: boolean;
                placeholder?: string;
                unit?: string;
                options?: Array<string>;
                defaultValue?: any;
                filterable?: boolean;
                filterType?: 'text' | 'number' | 'date' | 'dateRange' | 'select' | 'amount';
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
}
