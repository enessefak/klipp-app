/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ChatService {
    /**
     * Send a message to the AI Chatbot
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postChatMessage(
        requestBody: {
            message: string;
            locale?: string;
            platform?: 'mobile' | 'web';
            history?: Array<{
                role: 'user' | 'assistant';
                content: string;
            }>;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            response?: any;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/chat/message',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
                500: `Default Response`,
            },
        });
    }
}
