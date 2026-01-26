/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ImportService {
    /**
     * Import documents to folder from Excel/JSON/ZIP
     * @param folderId
     * @returns any Default Response
     * @throws ApiError
     */
    public static postImportFolder(
        folderId: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            success: boolean;
            importedCount?: number;
            errors?: Array<string>;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/import/folder/{folderId}',
            path: {
                'folderId': folderId,
            },
        });
    }
}
