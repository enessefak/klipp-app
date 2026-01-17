/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FolderSharingService {
    /**
     * Share a folder
     * Share a folder with another user by email. Permission levels: VIEW (read-only), EDIT (modify), CREATE (add new), FULL (all including delete).
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postFolderShares(
        requestBody: {
            folderId: string;
            targetUserId: string;
            permission?: 'VIEW' | 'EDIT' | 'CREATE' | 'FULL';
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            folderId: string;
            folderName: string;
            sharedBy: {
                id: string;
                name: string;
                email: string;
            };
            sharedWith: {
                id: string;
                name: string;
                email: string;
            };
            permission: 'VIEW' | 'EDIT' | 'CREATE' | 'FULL';
            status: 'pending' | 'accepted' | 'rejected';
            createdAt: string;
            updatedAt: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/folder-shares/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
                404: `Default Response`,
            },
        });
    }
    /**
     * Get folders shared with me
     * List all folders that other users have shared with you. Filter by status (pending/accepted/rejected).
     * @param status
     * @param cursor
     * @param limit
     * @param search
     * @param from
     * @param to
     * @param color
     * @param icon
     * @param permission
     * @returns any Default Response
     * @throws ApiError
     */
    public static getFolderSharesSharedWithMe(
        status?: 'pending' | 'accepted' | 'rejected',
        cursor?: string,
        limit?: number,
        search?: string,
        from?: string,
        to?: string,
        color?: string,
        icon?: string,
        permission?: 'VIEW' | 'EDIT' | 'CREATE' | 'FULL',
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            items: Array<{
                id: string;
                name: string;
                icon: string | null;
                color: string | null;
                permission: string;
                status: string;
                owner: {
                    id: string;
                    name: string | null;
                    email: string;
                };
                shareId: string;
                attachmentCount: number;
                createdAt: string;
            }>;
            hasMore: boolean;
            nextCursor: string | null;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/folder-shares/shared-with-me',
            query: {
                'status': status,
                'cursor': cursor,
                'limit': limit,
                'search': search,
                'from': from,
                'to': to,
                'color': color,
                'icon': icon,
                'permission': permission,
            },
        });
    }
    /**
     * Get folders I shared
     * List all folders you have shared with other users.
     * @param cursor
     * @param limit
     * @param search
     * @param from
     * @param to
     * @param color
     * @param icon
     * @param permission
     * @param status
     * @returns any Default Response
     * @throws ApiError
     */
    public static getFolderSharesSharedByMe(
        cursor?: string,
        limit?: number,
        search?: string,
        from?: string,
        to?: string,
        color?: string,
        icon?: string,
        permission?: 'VIEW' | 'EDIT' | 'CREATE' | 'FULL',
        status?: 'pending' | 'accepted' | 'rejected',
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            items: Array<{
                id: string;
                folderId: string;
                folderName: string;
                sharedBy: {
                    id: string;
                    name: string | null;
                    email: string;
                };
                sharedWith: {
                    id: string;
                    name: string | null;
                    email: string;
                };
                permission: string;
                status: string;
                createdAt: string;
                updatedAt: string;
            }>;
            hasMore: boolean;
            nextCursor: string | null;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/folder-shares/shared-by-me',
            query: {
                'cursor': cursor,
                'limit': limit,
                'search': search,
                'from': from,
                'to': to,
                'color': color,
                'icon': icon,
                'permission': permission,
                'status': status,
            },
        });
    }
    /**
     * Get pending share count
     * Get the count of pending share invitations (useful for notifications badge).
     * @returns any Default Response
     * @throws ApiError
     */
    public static getFolderSharesPendingCount(): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            count: number;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/folder-shares/pending-count',
        });
    }
    /**
     * Get folder shares
     * List all users a folder is shared with. Only folder owner can access.
     * @param folderId
     * @returns any Default Response
     * @throws ApiError
     */
    public static getFolderSharesFolder(
        folderId: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: Array<{
            id: string;
            folderId: string;
            folderName: string;
            sharedBy: {
                id: string;
                name: string;
                email: string;
            };
            sharedWith: {
                id: string;
                name: string;
                email: string;
            };
            permission: 'VIEW' | 'EDIT' | 'CREATE' | 'FULL';
            status: 'pending' | 'accepted' | 'rejected';
            createdAt: string;
            updatedAt: string;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/folder-shares/folder/{folderId}',
            path: {
                'folderId': folderId,
            },
            errors: {
                404: `Default Response`,
            },
        });
    }
    /**
     * Respond to share invitation
     * Accept or reject a folder share invitation.
     * @param shareId
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static patchFolderSharesRespond(
        shareId: string,
        requestBody: {
            status: 'accepted' | 'rejected';
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            folderId: string;
            folderName: string;
            sharedBy: {
                id: string;
                name: string;
                email: string;
            };
            sharedWith: {
                id: string;
                name: string;
                email: string;
            };
            permission: 'VIEW' | 'EDIT' | 'CREATE' | 'FULL';
            status: 'pending' | 'accepted' | 'rejected';
            createdAt: string;
            updatedAt: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/folder-shares/{shareId}/respond',
            path: {
                'shareId': shareId,
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
     * Update share permission
     * Update the permission level for an existing share. Only folder owner can update.
     * @param shareId
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static patchFolderShares(
        shareId: string,
        requestBody?: {
            permission?: 'VIEW' | 'EDIT' | 'CREATE' | 'FULL';
            status?: 'pending' | 'accepted' | 'rejected';
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            folderId: string;
            folderName: string;
            sharedBy: {
                id: string;
                name: string;
                email: string;
            };
            sharedWith: {
                id: string;
                name: string;
                email: string;
            };
            permission: 'VIEW' | 'EDIT' | 'CREATE' | 'FULL';
            status: 'pending' | 'accepted' | 'rejected';
            createdAt: string;
            updatedAt: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/folder-shares/{shareId}',
            path: {
                'shareId': shareId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Default Response`,
            },
        });
    }
    /**
     * Revoke or leave share
     * Folder owner can revoke share, or shared user can leave the shared folder.
     * @param shareId
     * @returns any Default Response
     * @throws ApiError
     */
    public static deleteFolderShares(
        shareId: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            message: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/folder-shares/{shareId}',
            path: {
                'shareId': shareId,
            },
            errors: {
                403: `Default Response`,
                404: `Default Response`,
            },
        });
    }
}
