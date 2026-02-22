/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InvoiceTemplatesService {
    /**
     * List all invoice templates for the current user
     * @returns any Default Response
     * @throws ApiError
     */
    public static getInvoiceTemplates(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/invoice-templates',
        });
    }
    /**
     * Create a new invoice template
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postInvoiceTemplates(
        requestBody: {
            name: string;
            isDefault?: boolean;
            logoUrl?: string;
            logoWidth?: number;
            logoHeight?: number;
            primaryColor?: string;
            secondaryColor?: string;
            textColor?: string;
            accentColor?: string;
            fontFamily?: string;
            fontSize?: number;
            showLogo?: boolean;
            showBorder?: boolean;
            showWatermark?: boolean;
            watermarkText?: string;
            footerText?: string;
            showFooter?: boolean;
            customCss?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/invoice-templates',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get a single invoice template
     * @param id
     * @returns any Default Response
     * @throws ApiError
     */
    public static getInvoiceTemplates1(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/invoice-templates/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update an invoice template
     * @param id
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static putInvoiceTemplates(
        id: string,
        requestBody?: {
            name?: string;
            isDefault?: boolean;
            logoUrl?: string;
            logoWidth?: number;
            logoHeight?: number;
            primaryColor?: string;
            secondaryColor?: string;
            textColor?: string;
            accentColor?: string;
            fontFamily?: string;
            fontSize?: number;
            showLogo?: boolean;
            showBorder?: boolean;
            showWatermark?: boolean;
            watermarkText?: string;
            footerText?: string;
            showFooter?: boolean;
            customCss?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/invoice-templates/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete an invoice template
     * @param id
     * @returns any Default Response
     * @throws ApiError
     */
    public static deleteInvoiceTemplates(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/invoice-templates/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Upload a logo for invoice template
     * @returns any Default Response
     * @throws ApiError
     */
    public static postInvoiceTemplatesUploadLogo(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/invoice-templates/upload-logo',
        });
    }
    /**
     * Get template logo
     * @param id
     * @returns any Default Response
     * @throws ApiError
     */
    public static getInvoiceTemplatesLogo(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/invoice-templates/{id}/logo',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Set a template as the default
     * @param id
     * @returns any Default Response
     * @throws ApiError
     */
    public static postInvoiceTemplatesSetDefault(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/invoice-templates/{id}/set-default',
            path: {
                'id': id,
            },
        });
    }
}
