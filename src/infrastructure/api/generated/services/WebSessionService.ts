/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WebSessionService {
    /**
     * Generate QR session for web login
     * Creates a QR session that web app displays. Mobile scans and confirms. QR expires in 3 minutes.
     * @returns any Default Response
     * @throws ApiError
     */
    public static postWebQrGenerate(): CancelablePromise<{
        /**
         * Unique session ID
         */
        sessionId?: string;
        /**
         * Code embedded in QR
         */
        sessionCode?: string;
        /**
         * JSON data to encode in QR
         */
        qrData?: string;
        /**
         * QR expiration time
         */
        expiresAt?: string;
        deviceInfo?: {
            browser?: string;
            os?: string;
            deviceName?: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/web/qr/generate',
        });
    }
    /**
     * Check QR session status
     * Web app polls this endpoint every 2 seconds to check if mobile confirmed the login.
     * @param sessionCode Session code from QR
     * @returns any Default Response
     * @throws ApiError
     */
    public static getWebQrStatus(
        sessionCode: string,
    ): CancelablePromise<{
        /**
         * Current session status
         */
        status?: 'pending' | 'confirmed' | 'expired';
        /**
         * JWT token (only when confirmed)
         */
        token?: string;
        /**
         * User ID (only when confirmed)
         */
        userId?: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/web/qr/status/{sessionCode}',
            path: {
                'sessionCode': sessionCode,
            },
            errors: {
                404: `Default Response`,
            },
        });
    }
    /**
     * Confirm QR session from mobile
     * Mobile app calls this after scanning QR code to authorize web login. Creates a new web session.
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postWebQrConfirm(
        requestBody: {
            /**
             * Session code scanned from QR
             */
            sessionCode: string;
        },
    ): CancelablePromise<{
        success?: boolean;
        message?: string;
        deviceInfo?: {
            /**
             * Web browser device name
             */
            deviceName?: string;
            /**
             * Web client IP address
             */
            ipAddress?: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/web/qr/confirm',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
                404: `Default Response`,
            },
        });
    }
    /**
     * List active web sessions
     * Returns all active web sessions for the authenticated user. Use this to show connected devices.
     * @returns any Default Response
     * @throws ApiError
     */
    public static getWebSessions(): CancelablePromise<{
        sessions?: Array<{
            /**
             * Session ID
             */
            id?: string;
            /**
             * e.g., Chrome on Windows
             */
            deviceName?: string;
            /**
             * web or mobile
             */
            deviceType?: string;
            /**
             * Browser name
             */
            browser?: string;
            /**
             * Operating system
             */
            os?: string;
            /**
             * Client IP address
             */
            ipAddress?: string;
            /**
             * Last activity time
             */
            lastActiveAt?: string;
            /**
             * Session creation time
             */
            createdAt?: string;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/web/sessions',
        });
    }
    /**
     * Revoke a web session
     * Logs out a specific web session. The device will be disconnected immediately.
     * @param sessionId Session ID to revoke
     * @returns any Default Response
     * @throws ApiError
     */
    public static deleteWebSessions(
        sessionId: string,
    ): CancelablePromise<{
        message?: string;
        /**
         * Revoked device name
         */
        deviceName?: string;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/web/sessions/{sessionId}',
            path: {
                'sessionId': sessionId,
            },
            errors: {
                404: `Default Response`,
            },
        });
    }
    /**
     * Revoke all web sessions
     * Logs out all web sessions. Optionally exclude current session to stay logged in.
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postWebSessionsRevokeAll(
        requestBody?: {
            /**
             * Session ID to keep active (optional)
             */
            exceptSessionId?: string;
        },
    ): CancelablePromise<{
        message?: string;
        /**
         * Number of sessions revoked
         */
        count?: number;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/web/sessions/revoke-all',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
