/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserGroupsService {
    /**
     * Create a new user group
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postGroups(
        requestBody: {
            name: string;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            name: string;
            ownerId: string;
            createdAt: string;
            updatedAt: string;
            _count?: {
                members?: number;
                folderShares?: number;
            };
            members?: Array<{
                user: {
                    name: string | null;
                    email: string;
                };
            }>;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/groups/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * List user groups
     * @returns any Default Response
     * @throws ApiError
     */
    public static getGroups(): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: any;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/groups/',
        });
    }
    /**
     * Get group details
     * @param id
     * @returns any Default Response
     * @throws ApiError
     */
    public static getGroups1(
        id: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            name: string;
            ownerId: string;
            createdAt: string;
            updatedAt: string;
            _count?: {
                members?: number;
                folderShares?: number;
            };
            members: Array<{
                id: string;
                userId: string;
                role: string;
                joinedAt: string;
                user: {
                    id: string;
                    email: string;
                    name: string | null;
                };
            }>;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/groups/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update group name
     * @param id
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static putGroups(
        id: string,
        requestBody: {
            name: string;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            name: string;
            ownerId: string;
            createdAt: string;
            updatedAt: string;
            _count?: {
                members?: number;
                folderShares?: number;
            };
            members?: Array<{
                user: {
                    name: string | null;
                    email: string;
                };
            }>;
        };
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/groups/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete a group
     * @param id
     * @returns any Default Response
     * @throws ApiError
     */
    public static deleteGroups(
        id: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            message: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/groups/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Add member to group
     * @param id
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postGroupsMembers(
        id: string,
        requestBody: {
            emails: Array<string>;
            role?: 'ADMIN' | 'MEMBER';
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            message: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/groups/{id}/members',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Remove member from group
     * @param id
     * @param memberId
     * @returns any Default Response
     * @throws ApiError
     */
    public static deleteGroupsMembers(
        id: string,
        memberId: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            message: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/groups/{id}/members/{memberId}',
            path: {
                'id': id,
                'memberId': memberId,
            },
        });
    }
}
