/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PaymentService {
    /**
     * Get available subscription plans
     * Returns pricing based on country (TR uses TRY, others use USD)
     * @param country
     * @returns any Default Response
     * @throws ApiError
     */
    public static getPaymentsPlans(
        country?: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            plans: Array<{
                id: string;
                name: string;
                price: number;
                currency: string;
                interval: 'month' | 'year';
                discount?: string;
                features: Array<string>;
            }>;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/payments/plans',
            query: {
                'country': country,
            },
        });
    }
    /**
     * Create checkout session
     * Routes to Stripe (global) or İyzico (Turkey) based on country
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postPaymentsCheckout(
        requestBody: {
            planId: 'individual_monthly' | 'individual_yearly' | 'team_monthly' | 'team_yearly';
            country: string;
            successUrl?: string;
            cancelUrl?: string;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            provider: 'lemonsqueezy';
            checkoutUrl?: string;
            sessionId?: string;
            token?: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/payments/checkout',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
            },
        });
    }
    /**
     * Cancel active subscription
     * @returns any Default Response
     * @throws ApiError
     */
    public static postPaymentsCancel(): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            message?: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/payments/cancel',
            errors: {
                400: `Default Response`,
                404: `Default Response`,
            },
        });
    }
    /**
     * Lemon Squeezy webhook endpoint
     * Handles Lemon Squeezy subscription events
     * @returns any Default Response
     * @throws ApiError
     */
    public static postPaymentsWebhookLemonsqueezy(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/payments/webhook/lemonsqueezy',
        });
    }
}
