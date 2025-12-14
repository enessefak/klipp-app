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
     * @returns any Default Response
     * @throws ApiError
     */
    public static getFolderSharesSharedWithMe(
        status?: 'pending' | 'accepted' | 'rejected',
    ): CancelablePromise<Array<{
        id: string;
        name: string;
        icon: string;
        color: string;
        permission: 'VIEW' | 'EDIT' | 'CREATE' | 'FULL';
        status: 'pending' | 'accepted' | 'rejected';
        owner: {
            id: string;
            name: string;
            email: string;
        };
        shareId: string;
        attachmentCount?: number;
        createdAt: string;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/folder-shares/shared-with-me',
            query: {
                'status': status,
            },
        });
    }
    /**
     * Get folders I shared
     * List all folders you have shared with other users.
     * @returns any Default Response
     * @throws ApiError
     */
    public static getFolderSharesSharedByMe(): CancelablePromise<Array<{
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
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/folder-shares/shared-by-me',
        });
    }
    /**
     * Get pending share count
     * Get the count of pending share invitations (useful for notifications badge).
     * @returns any Default Response
     * @throws ApiError
     */
    public static getFolderSharesPendingCount(): CancelablePromise<{
        count: number;
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
    ): CancelablePromise<Array<{
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
    }>> {
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
        message: string;
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
