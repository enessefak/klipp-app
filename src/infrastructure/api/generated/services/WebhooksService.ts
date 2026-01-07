/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WebhooksService {
    /**
     * RevenueCat Webhook
     * Receives subscription updates from RevenueCat
     * @returns any Default Response
     * @throws ApiError
     */
    public static postRevenuecatWebhook(): CancelablePromise<{
        success?: boolean;
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/revenuecat/webhook',
        });
    }
}
