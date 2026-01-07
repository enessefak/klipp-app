/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NotificationsService {
    /**
     * Get notifications
     * Get user notifications with pagination. Use unreadOnly=true to filter.
     * @param unreadOnly
     * @param limit
     * @param cursor
     * @returns any Default Response
     * @throws ApiError
     */
    public static getNotifications(
        unreadOnly?: string,
        limit?: string,
        cursor?: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            items: Array<{
                id: string;
                type: 'FOLDER_SHARE_INVITE' | 'FOLDER_SHARE_ACCEPTED' | 'FOLDER_SHARE_REJECTED' | 'SYSTEM';
                title: string;
                body: string;
                referenceId: string | null;
                referenceType: string | null;
                isRead: boolean;
                data?: any;
                createdAt: string;
            }>;
            unreadCount: number;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/notifications/',
            query: {
                'unreadOnly': unreadOnly,
                'limit': limit,
                'cursor': cursor,
            },
        });
    }
    /**
     * Get unread count
     * Get count of unread notifications (for badge).
     * @returns any Default Response
     * @throws ApiError
     */
    public static getNotificationsUnreadCount(): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            count: number;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/notifications/unread-count',
        });
    }
    /**
     * Mark as read
     * Mark specific notifications or all as read.
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postNotificationsMarkRead(
        requestBody?: {
            notificationIds?: Array<string>;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            success: boolean;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/notifications/mark-read',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Mark one as read
     * @param notificationId
     * @returns any Default Response
     * @throws ApiError
     */
    public static patchNotificationsRead(
        notificationId: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            success: boolean;
        };
    }> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/notifications/{notificationId}/read',
            path: {
                'notificationId': notificationId,
            },
            errors: {
                404: `Default Response`,
            },
        });
    }
    /**
     * Delete notification
     * @param notificationId
     * @returns any Default Response
     * @throws ApiError
     */
    public static deleteNotifications(
        notificationId: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            message: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/notifications/{notificationId}',
            path: {
                'notificationId': notificationId,
            },
            errors: {
                404: `Default Response`,
            },
        });
    }
    /**
     * Delete read notifications
     * Delete all read notifications.
     * @returns any Default Response
     * @throws ApiError
     */
    public static deleteNotificationsRead(): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            message: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/notifications/read',
        });
    }
    /**
     * Register Expo push token
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postNotificationsRegisterPushToken(
        requestBody: {
            expoPushToken: string;
            platform?: 'ios' | 'android' | 'web';
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            success: boolean;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/notifications/register-push-token',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
            },
        });
    }
    /**
     * Send test notification
     * @returns any Default Response
     * @throws ApiError
     */
    public static postNotificationsTest(): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            success: boolean;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/notifications/test',
        });
    }
}
