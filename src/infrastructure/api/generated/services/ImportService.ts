/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ImportService {
    /**
     * Import documents to folder from JSON/XML/ZIP. Use ?preview=true for dry-run.
     * @param folderId
     * @param preview Set to "true" to parse without saving (dry-run)
     * @returns any Default Response
     * @throws ApiError
     */
    public static postImportFolder(
        folderId: string,
        preview?: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            success: boolean;
            preview?: boolean;
            importedCount?: number;
            count?: number;
            errors?: Array<string>;
            items?: Array<{
                title: string;
                invoiceNumber?: string | null;
                issueDate?: any;
                senderName?: string | null;
                amount?: number | null;
                currency?: string;
            }>;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/import/folder/{folderId}',
            path: {
                'folderId': folderId,
            },
            query: {
                'preview': preview,
            },
        });
    }
}
