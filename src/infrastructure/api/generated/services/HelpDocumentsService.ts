/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class HelpDocumentsService {
    /**
     * List published help documents for end users (no authentication required)
     * @param category
     * @param locale
     * @param platform
     * @returns any Default Response
     * @throws ApiError
     */
    public static getHelpDocumentsPublic(
        category?: string,
        locale?: string,
        platform?: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: Array<{
            id: string;
            title: string;
            content: string;
            category: string;
            locale: string;
            platforms: Array<string>;
            keywords: Array<string>;
            priority: number;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/help-documents/public',
            query: {
                'category': category,
                'locale': locale,
                'platform': platform,
            },
            errors: {
                500: `Default Response`,
            },
        });
    }
    /**
     * List help documents with optional filters
     * @param category
     * @param locale
     * @param isPublished
     * @param platform
     * @returns any Default Response
     * @throws ApiError
     */
    public static getHelpDocuments(
        category?: string,
        locale?: string,
        isPublished?: string,
        platform?: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: Array<{
            id: string;
            title: string;
            content: string;
            category: string;
            locale: string;
            platforms: Array<string>;
            keywords: Array<string>;
            priority: number;
            isPublished: boolean;
            createdAt: string;
            updatedAt: string;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/help-documents/',
            query: {
                'category': category,
                'locale': locale,
                'isPublished': isPublished,
                'platform': platform,
            },
            errors: {
                500: `Default Response`,
            },
        });
    }
    /**
     * Create a new help document
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postHelpDocuments(
        requestBody: {
            title: string;
            content: string;
            category: 'app_usage' | 'einvoice' | 'subscription' | 'general';
            locale?: 'tr' | 'en' | 'de';
            platforms?: Array<'mobile' | 'web'>;
            keywords?: Array<string>;
            priority?: number;
            isPublished?: boolean;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            title: string;
            content: string;
            category: string;
            locale: string;
            platforms: Array<string>;
            keywords: Array<string>;
            priority: number;
            isPublished: boolean;
            createdAt: string;
            updatedAt: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/help-documents/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
                500: `Default Response`,
            },
        });
    }
    /**
     * Get a single help document by ID
     * @param id
     * @returns any Default Response
     * @throws ApiError
     */
    public static getHelpDocuments1(
        id: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            title: string;
            content: string;
            category: string;
            locale: string;
            platforms: Array<string>;
            keywords: Array<string>;
            priority: number;
            isPublished: boolean;
            createdAt: string;
            updatedAt: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/help-documents/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Default Response`,
                500: `Default Response`,
            },
        });
    }
    /**
     * Update a help document
     * @param id
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static putHelpDocuments(
        id: string,
        requestBody?: {
            title?: string;
            content?: string;
            category?: 'app_usage' | 'einvoice' | 'subscription' | 'general';
            locale?: 'tr' | 'en' | 'de';
            platforms?: Array<'mobile' | 'web'>;
            keywords?: Array<string>;
            priority?: number;
            isPublished?: boolean;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            title: string;
            content: string;
            category: string;
            locale: string;
            platforms: Array<string>;
            keywords: Array<string>;
            priority: number;
            isPublished: boolean;
            createdAt: string;
            updatedAt: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/help-documents/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Default Response`,
                500: `Default Response`,
            },
        });
    }
    /**
     * Delete a help document
     * @param id
     * @returns any Default Response
     * @throws ApiError
     */
    public static deleteHelpDocuments(
        id: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            deleted: boolean;
        };
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/help-documents/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Default Response`,
                500: `Default Response`,
            },
        });
    }
    /**
     * Regenerate embeddings for all published help documents
     * @returns any Default Response
     * @throws ApiError
     */
    public static postHelpDocumentsRegenerateEmbeddings(): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            processed: number;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/help-documents/regenerate-embeddings',
            errors: {
                500: `Default Response`,
            },
        });
    }
}
