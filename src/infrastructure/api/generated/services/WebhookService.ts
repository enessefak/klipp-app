/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WebhookService {
    /**
     * List webhooks
     * @returns any Default Response
     * @throws ApiError
     */
    public static getWebhooks(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/webhooks/',
        });
    }
    /**
     * Create webhook
     * @returns any Default Response
     * @throws ApiError
     */
    public static postWebhooks(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/webhooks/',
        });
    }
    /**
     * Update webhook
     * @param id
     * @returns any Default Response
     * @throws ApiError
     */
    public static patchWebhooks(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/webhooks/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Delete webhook
     * @param id
     * @returns any Default Response
     * @throws ApiError
     */
    public static deleteWebhooks(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/webhooks/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * List webhook logs
     * @param id
     * @returns any Default Response
     * @throws ApiError
     */
    public static getWebhooksLogs(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/webhooks/{id}/logs',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Handle inbound email from Cloudflare
     * Receives email sender and R2 attachment paths to create attachments in user Inbox.
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postInboundEmail(
        requestBody?: {
            sender?: string;
            subject?: string;
            files?: Array<{
                key?: string;
                filename?: string;
                contentType?: string;
                size?: number;
            }>;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/inbound-email/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
