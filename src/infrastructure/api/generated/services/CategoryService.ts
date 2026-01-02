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
    public static getCategories(): CancelablePromise<Array<{
        id: string;
        name: string;
        accountCode?: string | null;
        userId: string;
        createdAt: string;
        updatedAt: string;
    }>> {
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
            name: string;
            accountCode?: string;
        },
    ): CancelablePromise<{
        id: string;
        name: string;
        accountCode?: string | null;
        userId: string;
        createdAt: string;
        updatedAt: string;
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
        id: string;
        name: string;
        accountCode?: string | null;
        userId: string;
        createdAt: string;
        updatedAt: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/categories/{id}',
            path: {
                'id': id,
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
            name?: string;
            accountCode?: string;
        },
    ): CancelablePromise<{
        id: string;
        name: string;
        accountCode?: string | null;
        userId: string;
        createdAt: string;
        updatedAt: string;
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
     * @returns void
     * @throws ApiError
     */
    public static deleteCategories(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/categories/{id}',
            path: {
                'id': id,
            },
        });
    }
}
