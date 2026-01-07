/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FolderService {
    /**
     * List folders
     * Get all folders for the current user. Supports pagination and filtering.
     * @param flat
     * @param cursor
     * @param limit
     * @param search
     * @param parentId
     * @param from
     * @param to
     * @param color
     * @param icon
     * @returns any Default Response
     * @throws ApiError
     */
    public static getFolders(
        flat?: 'true' | 'false',
        cursor?: string,
        limit?: number,
        search?: string,
        parentId?: string,
        from?: string,
        to?: string,
        color?: string,
        icon?: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            items: Array<{
                id: string;
                name: string;
                icon: string;
                color: string;
                userId: string;
                parentId: string | null;
                isSystem?: boolean;
                systemType?: string | null;
                createdAt: string;
                updatedAt: string;
                requiresApproval?: boolean;
                allowedTypeIds?: Array<string>;
                allowedTransactionTypes?: Array<'INCOME' | 'EXPENSE' | 'NEUTRAL'>;
                children?: Array<any>;
            }>;
            hasMore: boolean;
            nextCursor: string | null;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/folders/',
            query: {
                'flat': flat,
                'cursor': cursor,
                'limit': limit,
                'search': search,
                'parentId': parentId,
                'from': from,
                'to': to,
                'color': color,
                'icon': icon,
            },
            errors: {
                400: `Default Response`,
            },
        });
    }
    /**
     * Create folder
     * Create a new folder.
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postFolders(
        requestBody: {
            name: string;
            icon: string;
            color: string;
            parentId?: string | null;
            requiresApproval?: boolean;
            allowedTypeIds?: Array<string>;
            allowedTransactionTypes?: Array<'INCOME' | 'EXPENSE' | 'NEUTRAL'>;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            name: string;
            icon: string;
            color: string;
            userId: string;
            parentId: string | null;
            isSystem?: boolean;
            systemType?: string | null;
            createdAt: string;
            updatedAt: string;
            requiresApproval?: boolean;
            allowedTypeIds?: Array<string>;
            allowedTransactionTypes?: Array<'INCOME' | 'EXPENSE' | 'NEUTRAL'>;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/folders/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
            },
        });
    }
    /**
     * List system folders
     * Get all system folders (Inbox, Trash, etc.) for the current user.
     * @returns any Default Response
     * @throws ApiError
     */
    public static getFoldersSystem(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/folders/system',
        });
    }
    /**
     * Get folder by ID
     * Get a specific folder by ID.
     * @param id
     * @returns any Default Response
     * @throws ApiError
     */
    public static getFolders1(
        id: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            name: string;
            icon: string;
            color: string;
            userId: string;
            parentId: string | null;
            isSystem?: boolean;
            systemType?: string | null;
            createdAt: string;
            updatedAt: string;
            requiresApproval?: boolean;
            allowedTypeIds?: Array<string>;
            allowedTransactionTypes?: Array<'INCOME' | 'EXPENSE' | 'NEUTRAL'>;
            children?: Array<any>;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/folders/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Default Response`,
            },
        });
    }
    /**
     * Update folder
     * Update an existing folder.
     * @param id
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static putFolders(
        id: string,
        requestBody?: {
            name?: string;
            icon?: string;
            color?: string;
            parentId?: string | null;
            requiresApproval?: boolean;
            allowedTypeIds?: Array<string>;
            allowedTransactionTypes?: Array<'INCOME' | 'EXPENSE' | 'NEUTRAL'>;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            name: string;
            icon: string;
            color: string;
            userId: string;
            parentId: string | null;
            isSystem?: boolean;
            systemType?: string | null;
            createdAt: string;
            updatedAt: string;
            requiresApproval?: boolean;
            allowedTypeIds?: Array<string>;
            allowedTransactionTypes?: Array<'INCOME' | 'EXPENSE' | 'NEUTRAL'>;
        };
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/folders/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
                404: `Default Response`,
            },
        });
    }
    /**
     * Delete folder
     * Delete a folder. System folders cannot be deleted.
     * @param id
     * @returns any Default Response
     * @throws ApiError
     */
    public static deleteFolders(
        id: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: null;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/folders/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Default Response`,
            },
        });
    }
}
