/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AttachmentService {
    /**
     * Request approval for an attachment via email
     * @param id
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postAttachmentsRequestApproval(
        id: string,
        requestBody: {
            reviewerEmail: string;
        },
    ): CancelablePromise<{
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/attachments/{id}/request-approval',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Default Response`,
            },
        });
    }
    /**
     * List attachments with filters and pagination
     * List all attachments for the authenticated user. Supports filtering by folder, attachment type, title, amount range, currency, document date range, and text search across title, description and details fields. Uses cursor-based pagination.
     * @param folderId
     * @param categoryId
     * @param attachmentTypeId
     * @param title
     * @param search
     * @param documentDateFrom
     * @param documentDateTo
     * @param createdAtFrom
     * @param createdAtTo
     * @param includeShared
     * @param detailsFilter
     * @param cursor
     * @param limit
     * @returns any Default Response
     * @throws ApiError
     */
    public static getAttachments(
        folderId?: string,
        categoryId?: string,
        attachmentTypeId?: string,
        title?: string,
        search?: string,
        documentDateFrom?: string,
        documentDateTo?: string,
        createdAtFrom?: string,
        createdAtTo?: string,
        includeShared?: 'true' | 'false',
        detailsFilter?: string,
        cursor?: string,
        limit?: number,
    ): CancelablePromise<{
        items: Array<{
            id: string;
            userId: string;
            folderId: string;
            categoryId?: string | null;
            attachmentTypeId: string;
            title: string;
            description: string | null;
            documentDate: string;
            details?: any;
            status: 'PENDING' | 'APPROVED' | 'REJECTED';
            rejectionReason?: string | null;
            images?: Array<{
                id: string;
                imageUrl: string;
                createdAt: string;
            }>;
            attachmentType?: {
                id: string;
                name: string;
                icon: string;
                color: string;
                expires: boolean;
                transactionType?: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
            };
            folder?: {
                id: string;
                name: string;
                icon: string;
                color: string;
            };
            category?: {
                id: string;
                name: string;
                accountCode?: string | null;
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
                'categoryId': categoryId,
                'attachmentTypeId': attachmentTypeId,
                'title': title,
                'search': search,
                'documentDateFrom': documentDateFrom,
                'documentDateTo': documentDateTo,
                'createdAtFrom': createdAtFrom,
                'createdAtTo': createdAtTo,
                'includeShared': includeShared,
                'detailsFilter': detailsFilter,
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
            categoryId?: string;
            attachmentTypeId: string;
            title: string;
            description?: string;
            documentDate: string;
            details?: Record<string, any> | null;
        },
    ): CancelablePromise<{
        id: string;
        userId: string;
        folderId: string;
        categoryId?: string | null;
        attachmentTypeId: string;
        title: string;
        description: string | null;
        documentDate: string;
        details?: any;
        status: 'PENDING' | 'APPROVED' | 'REJECTED';
        rejectionReason?: string | null;
        images?: Array<{
            id: string;
            imageUrl: string;
            createdAt: string;
        }>;
        attachmentType?: {
            id: string;
            name: string;
            icon: string;
            color: string;
            expires: boolean;
            transactionType?: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
        };
        folder?: {
            id: string;
            name: string;
            icon: string;
            color: string;
        };
        category?: {
            id: string;
            name: string;
            accountCode?: string | null;
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
        categoryId?: string | null;
        attachmentTypeId: string;
        title: string;
        description: string | null;
        documentDate: string;
        details?: any;
        status: 'PENDING' | 'APPROVED' | 'REJECTED';
        rejectionReason?: string | null;
        images?: Array<{
            id: string;
            imageUrl: string;
            createdAt: string;
        }>;
        attachmentType?: {
            id: string;
            name: string;
            icon: string;
            color: string;
            expires: boolean;
            transactionType?: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
        };
        folder?: {
            id: string;
            name: string;
            icon: string;
            color: string;
        };
        category?: {
            id: string;
            name: string;
            accountCode?: string | null;
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
            categoryId?: string;
            attachmentTypeId?: string;
            title?: string;
            description?: string;
            documentDate?: string;
            details?: Record<string, any> | null;
        },
    ): CancelablePromise<{
        id: string;
        userId: string;
        folderId: string;
        categoryId?: string | null;
        attachmentTypeId: string;
        title: string;
        description: string | null;
        documentDate: string;
        details?: any;
        status: 'PENDING' | 'APPROVED' | 'REJECTED';
        rejectionReason?: string | null;
        images?: Array<{
            id: string;
            imageUrl: string;
            createdAt: string;
        }>;
        attachmentType?: {
            id: string;
            name: string;
            icon: string;
            color: string;
            expires: boolean;
            transactionType?: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
        };
        folder?: {
            id: string;
            name: string;
            icon: string;
            color: string;
        };
        category?: {
            id: string;
            name: string;
            accountCode?: string | null;
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
