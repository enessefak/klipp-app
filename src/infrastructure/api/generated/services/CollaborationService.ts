/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CollaborationService {
    /**
     * Add a comment to an attachment
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postCollaborationComments(
        requestBody: {
            attachmentId: string;
            text: string;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            text: string;
            userId: string;
            attachmentId: string;
            createdAt: string;
            updatedAt: string;
            user?: {
                id: string;
                name: string;
                email?: string;
            };
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/collaboration/comments',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get comments for an attachment
     * @param attachmentId
     * @returns any Default Response
     * @throws ApiError
     */
    public static getCollaborationComments(
        attachmentId: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: Array<{
            id: string;
            text: string;
            userId: string;
            attachmentId: string;
            createdAt: string;
            updatedAt: string;
            user?: {
                id: string;
                name: string;
                email?: string;
            };
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/collaboration/comments/{attachmentId}',
            path: {
                'attachmentId': attachmentId,
            },
        });
    }
    /**
     * Delete a comment
     * @param id
     * @returns any Default Response
     * @throws ApiError
     */
    public static deleteCollaborationComments(
        id: string,
    ): CancelablePromise<{
        success: boolean;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/collaboration/comments/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Create a new tag
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postCollaborationTags(
        requestBody: {
            name: string;
            color?: string;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            name: string;
            color: string;
            userId: string;
            createdAt: string;
            updatedAt: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/collaboration/tags',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * List user tags
     * @returns any Default Response
     * @throws ApiError
     */
    public static getCollaborationTags(): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: Array<{
            id: string;
            name: string;
            color: string;
            userId: string;
            createdAt: string;
            updatedAt: string;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/collaboration/tags',
        });
    }
    /**
     * Attach a tag to a document
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postCollaborationTagsAttach(
        requestBody: {
            attachmentId: string;
            tagId: string;
        },
    ): CancelablePromise<{
        success: boolean;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/collaboration/tags/attach',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Remove a tag from a document
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postCollaborationTagsDetach(
        requestBody: {
            attachmentId: string;
            tagId: string;
        },
    ): CancelablePromise<{
        success: boolean;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/collaboration/tags/detach',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get audit logs for an attachment
     * @param attachmentId
     * @returns any Default Response
     * @throws ApiError
     */
    public static getCollaborationAuditLogs(
        attachmentId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/collaboration/audit-logs/{attachmentId}',
            path: {
                'attachmentId': attachmentId,
            },
        });
    }
}
