/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AttachmentService {
    /**
     * List attachments with filters and pagination
     * List all attachments for the authenticated user. Supports filtering by folder, attachment type, title, amount range, currency, document date range, and text search across title, description and details fields. Uses cursor-based pagination.
     * @param folderId
     * @param attachmentTypeId
     * @param title
     * @param search
     * @param amountMin
     * @param amountMax
     * @param currency
     * @param documentDateFrom
     * @param documentDateTo
     * @param createdAtFrom
     * @param createdAtTo
     * @param includeShared
     * @param cursor
     * @param limit
     * @returns any Default Response
     * @throws ApiError
     */
    public static getAttachments(
        folderId?: string,
        attachmentTypeId?: string,
        title?: string,
        search?: string,
        amountMin?: number,
        amountMax?: number,
        currency?: string,
        documentDateFrom?: string,
        documentDateTo?: string,
        createdAtFrom?: string,
        createdAtTo?: string,
        includeShared?: 'true' | 'false',
        cursor?: string,
        limit?: number,
    ): CancelablePromise<{
        items: Array<{
            id: string;
            userId: string;
            folderId: string;
            attachmentTypeId: string;
            title: string;
            description: string | null;
            amount: number | null;
            currency: string | null;
            documentDate: string;
            details?: any;
            images?: Array<{
                id: string;
                imageUrl: string;
                attachmentId: string;
                createdAt: string;
            }>;
            attachmentType?: {
                id: string;
                name: string;
                icon: string;
                color: string;
                requiresWarranty: boolean;
            };
            folder?: {
                id: string;
                name: string;
                icon: string;
                color: string;
            };
            isOwner?: boolean;
            permission?: 'VIEW' | 'EDIT' | 'CREATE' | 'FULL';
            createdAt: string;
            updatedAt: string;
        }>;
        hasMore: boolean;
        nextCursor: string | null;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/attachments/',
            query: {
                'folderId': folderId,
                'attachmentTypeId': attachmentTypeId,
                'title': title,
                'search': search,
                'amountMin': amountMin,
                'amountMax': amountMax,
                'currency': currency,
                'documentDateFrom': documentDateFrom,
                'documentDateTo': documentDateTo,
                'createdAtFrom': createdAtFrom,
                'createdAtTo': createdAtTo,
                'includeShared': includeShared,
                'cursor': cursor,
                'limit': limit,
            },
        });
    }
    /**
     * Create attachment
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postAttachments(
        requestBody: {
            folderId: string;
            attachmentTypeId: string;
            title: string;
            description?: string;
            amount?: number | null;
            currency?: string | null;
            documentDate: string;
            details?: Record<string, any> | null;
        },
    ): CancelablePromise<{
        id: string;
        userId: string;
        folderId: string;
        attachmentTypeId: string;
        title: string;
        description: string | null;
        amount: number | null;
        currency: string | null;
        documentDate: string;
        details?: any;
        images?: Array<{
            id: string;
            imageUrl: string;
            attachmentId: string;
            createdAt: string;
        }>;
        attachmentType?: {
            id: string;
            name: string;
            icon: string;
            color: string;
            requiresWarranty: boolean;
        };
        folder?: {
            id: string;
            name: string;
            icon: string;
            color: string;
        };
        isOwner?: boolean;
        permission?: 'VIEW' | 'EDIT' | 'CREATE' | 'FULL';
        createdAt: string;
        updatedAt: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/attachments/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
            },
        });
    }
    /**
     * Get attachment by id
     * @param id
     * @returns any Default Response
     * @throws ApiError
     */
    public static getAttachments1(
        id: string,
    ): CancelablePromise<{
        id: string;
        userId: string;
        folderId: string;
        attachmentTypeId: string;
        title: string;
        description: string | null;
        amount: number | null;
        currency: string | null;
        documentDate: string;
        details?: any;
        images?: Array<{
            id: string;
            imageUrl: string;
            attachmentId: string;
            createdAt: string;
        }>;
        attachmentType?: {
            id: string;
            name: string;
            icon: string;
            color: string;
            requiresWarranty: boolean;
        };
        folder?: {
            id: string;
            name: string;
            icon: string;
            color: string;
        };
        isOwner?: boolean;
        permission?: 'VIEW' | 'EDIT' | 'CREATE' | 'FULL';
        createdAt: string;
        updatedAt: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/attachments/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update attachment
     * @param id
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static putAttachments(
        id: string,
        requestBody?: {
            folderId?: string;
            attachmentTypeId?: string;
            title?: string;
            description?: string;
            amount?: number | null;
            currency?: string | null;
            documentDate?: string;
            details?: Record<string, any> | null;
        },
    ): CancelablePromise<{
        id: string;
        userId: string;
        folderId: string;
        attachmentTypeId: string;
        title: string;
        description: string | null;
        amount: number | null;
        currency: string | null;
        documentDate: string;
        details?: any;
        images?: Array<{
            id: string;
            imageUrl: string;
            attachmentId: string;
            createdAt: string;
        }>;
        attachmentType?: {
            id: string;
            name: string;
            icon: string;
            color: string;
            requiresWarranty: boolean;
        };
        folder?: {
            id: string;
            name: string;
            icon: string;
            color: string;
        };
        isOwner?: boolean;
        permission?: 'VIEW' | 'EDIT' | 'CREATE' | 'FULL';
        createdAt: string;
        updatedAt: string;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/attachments/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
            },
        });
    }
    /**
     * Delete attachment
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deleteAttachments(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/attachments/{id}',
            path: {
                'id': id,
            },
        });
    }
}
