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
     * Returns paginated list of folders. Use ?flat=true for flat list.
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
            children?: Array<any>;
        }>;
        hasMore: boolean;
        nextCursor: string | null;
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
        });
    }
    /**
     * Create folder
     * Create a new folder. Optionally specify parentId to create a subfolder.
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
        },
    ): CancelablePromise<{
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
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/folders/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
                404: `Default Response`,
            },
        });
    }
    /**
     * List available export templates (Luca, Zirve, etc.)
     * @returns any Default Response
     * @throws ApiError
     */
    public static getFoldersExportTemplates(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/folders/export-templates',
        });
    }
    /**
     * Get folder by id
     * @param id
     * @returns any Default Response
     * @throws ApiError
     */
    public static getFolders1(
        id: string,
    ): CancelablePromise<{
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
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/folders/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update folder
     * Update folder properties. Can move folder to different parent by updating parentId. Prevents circular references.
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
        },
    ): CancelablePromise<{
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
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deleteFolders(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/folders/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Export folder attachments
     * Export attachments in the folder. Supports Excel.
     * @param id
     * @param recursive
     * @param format
     * @param fields
     * @param mapping
     * @param type
     * @param templateId
     * @returns any Default Response
     * @throws ApiError
     */
    public static getFoldersExport(
        id: string,
        recursive?: 'true' | 'false',
        format?: 'excel' | 'csv' | 'json' | 'xml',
        fields?: string,
        mapping?: string,
        type?: string,
        templateId?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/folders/{id}/export',
            path: {
                'id': id,
            },
            query: {
                'recursive': recursive,
                'format': format,
                'fields': fields,
                'mapping': mapping,
                'type': type,
                'templateId': templateId,
            },
        });
    }
}
