/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OAuthService {
    /**
     * Google ile giriş yap
     * Google ID token ile kullanıcı girişi veya kaydı yapar
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postAuthGoogle(
        requestBody: {
            idToken: string;
        },
    ): CancelablePromise<{
        token: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
        isNewUser: boolean;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/google',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
                401: `Default Response`,
            },
        });
    }
    /**
     * Apple ile giriş yap
     * Apple identity token ile kullanıcı girişi veya kaydı yapar
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postAuthApple(
        requestBody: {
            identityToken: string;
            user?: {
                email?: string;
                name?: {
                    firstName?: string;
                    lastName?: string;
                };
            };
        },
    ): CancelablePromise<{
        token: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
        isNewUser: boolean;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/apple',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
                401: `Default Response`,
            },
        });
    }
}
