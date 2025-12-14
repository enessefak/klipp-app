/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AttachmentTypeService {
    /**
     * List attachment types
     * @returns any Default Response
     * @throws ApiError
     */
    public static getAttachmentTypes(): CancelablePromise<Array<{
        id: string;
        name: string;
        icon: string;
        color: string;
        requiresWarranty: boolean;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/attachment-types/',
        });
    }
}
