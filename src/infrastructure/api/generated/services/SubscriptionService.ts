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
        requestBody: {
            platform: 'ios' | 'android';
            receipt: string;
        },
    ): CancelablePromise<{
        isValid: boolean;
        subscriptionEndDate: string | null;
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
}
