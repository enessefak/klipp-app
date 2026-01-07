/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CategoryService {
    /**
     * List categories
     * @returns any Default Response
     * @throws ApiError
     */
    public static getCategories(): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: Array<{
            id: string;
            name: string;
            accountCode?: string | null;
            userId: string;
            createdAt: string;
            updatedAt: string;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/categories/',
        });
    }
    /**
     * Create category
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postCategories(
        requestBody: {
            /**
             * Kategori adı
             */
            name: string;
            /**
             * Muhasebe hesap kodu (örn: 770.01.001)
             */
            accountCode?: string;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            name: string;
            accountCode?: string | null;
            userId: string;
            createdAt: string;
            updatedAt: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/categories/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
            },
        });
    }
    /**
     * Get category by id
     * @param id
     * @returns any Default Response
     * @throws ApiError
     */
    public static getCategories1(
        id: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            name: string;
            accountCode?: string | null;
            userId: string;
            createdAt: string;
            updatedAt: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/categories/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Default Response`,
            },
        });
    }
    /**
     * Update category
     * @param id
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static putCategories(
        id: string,
        requestBody?: {
            /**
             * Kategori adı
             */
            name?: string;
            /**
             * Muhasebe hesap kodu (örn: 770.01.001)
             */
            accountCode?: string;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            name: string;
            accountCode?: string | null;
            userId: string;
            createdAt: string;
            updatedAt: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/categories/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
            },
        });
    }
    /**
     * Delete category
     * @param id
     * @returns any Default Response
     * @throws ApiError
     */
    public static deleteCategories(
        id: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: null;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/categories/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Default Response`,
            },
        });
    }
}
