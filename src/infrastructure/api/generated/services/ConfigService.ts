/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ConfigService {
    /**
     * Get application configuration
     * Returns initial app configuration including location, language, settings, and pricing.
     * @returns any Default Response
     * @throws ApiError
     */
    public static getConfig(): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            location: {
                ip: string;
                country: string;
                city?: string;
                timezone?: string;
            };
            settings: {
                language: string;
                currency: string;
                currencySymbol: string;
                theme: string;
                features: Record<string, boolean>;
            };
            pricing: {
                currency: string;
                symbol: string;
                plans: {
                    individual: {
                        monthly: {
                            price: number;
                            id: string;
                        };
                        yearly: {
                            price: number;
                            id: string;
                        };
                        items: Array<string>;
                    };
                    team: {
                        monthly: {
                            price: number;
                            id: string;
                        };
                        yearly: {
                            price: number;
                            id: string;
                        };
                        items: Array<string>;
                    };
                };
            };
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/config/',
        });
    }
}
