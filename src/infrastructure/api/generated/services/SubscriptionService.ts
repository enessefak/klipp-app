/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SubscriptionService {
    /**
     * Doğrulama ve abonelik güncelleme
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postSubscriptionVerify(
        requestBody?: {
            forceSync?: boolean;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            isValid: boolean;
            status: string;
            planId: string | null;
            provider: string | null;
            subscriptionEndDate: string | null;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/subscription/verify',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
            },
        });
    }
    /**
     * Create Lemon Squeezy Checkout Session
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postSubscriptionCheckout(
        requestBody: {
            planId: 'individual_monthly' | 'individual_yearly' | 'team_monthly' | 'team_yearly';
            redirectUrl: string;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            url: string;
            checkoutId: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/subscription/checkout',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
            },
        });
    }
    /**
     * Get Subscription Plans
     * @returns any Default Response
     * @throws ApiError
     */
    public static getSubscriptionPlans(): CancelablePromise<{
        success?: boolean;
        data?: Array<{
            id?: string;
            name?: string;
            price?: number;
            interval?: string;
            interval_count?: number;
            formattedPrice?: string;
            has_free_trial?: boolean;
            trial_interval?: string;
            trial_interval_count?: number;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/subscription/plans',
        });
    }
    /**
     * Cancel Active Subscription
     * @returns any Default Response
     * @throws ApiError
     */
    public static postSubscriptionCancel(): CancelablePromise<{
        success?: boolean;
        message?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/subscription/cancel',
            errors: {
                400: `Default Response`,
            },
        });
    }
    /**
     * Lemon Squeezy Webhook
     * @returns any Default Response
     * @throws ApiError
     */
    public static postSubscriptionWebhook(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/subscription/webhook',
        });
    }
}
