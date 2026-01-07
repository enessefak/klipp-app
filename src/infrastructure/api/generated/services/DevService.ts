/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DevService {
    /**
     * Get development token
     * Generates a JWT token for testing purposes. Only available in non-production environments.
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postDevToken(
        requestBody: {
            email: string;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            token: string;
            user: {
                id: string;
                email: string;
                name: string | null;
            };
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/dev/token',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
