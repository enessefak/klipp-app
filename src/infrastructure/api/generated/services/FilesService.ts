/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FilesService {
    /**
     * Get presigned URL for file upload
     * Returns a presigned URL for uploading files (images, PDFs, documents) to R2. Supported types: JPEG, PNG, GIF, WebP, HEIC, PDF, Word, Excel.
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postFilesPresignedUrl(
        requestBody: {
            filename: string;
            contentType: string;
        },
    ): CancelablePromise<{
        uploadUrl: string;
        key: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/files/presigned-url',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
            },
        });
    }
    /**
     * Save file to attachment
     * Saves a file key to an attachment after upload. Validates ownership and key prefix.
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postFiles(
        requestBody: {
            attachmentId: string;
            key: string;
        },
    ): CancelablePromise<{
        id: string;
        attachmentId: string;
        key: string;
        viewUrl: string;
        createdAt: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/files/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
                403: `Default Response`,
                404: `Default Response`,
            },
        });
    }
    /**
     * Get files for attachment
     * Returns all files for a specific attachment with view URLs, filenames and content types. Validates ownership.
     * @param attachmentId
     * @returns any Default Response
     * @throws ApiError
     */
    public static getFilesAttachment(
        attachmentId: string,
    ): CancelablePromise<Array<{
        id: string;
        attachmentId: string;
        viewUrl: string;
        filename: string;
        contentType?: string;
        createdAt: string;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/files/attachment/{attachmentId}',
            path: {
                'attachmentId': attachmentId,
            },
            errors: {
                404: `Default Response`,
            },
        });
    }
    /**
     * View file
     * Streams the file directly for viewing. Validates ownership before serving. PDFs open inline in browser.
     * @param fileId
     * @returns void
     * @throws ApiError
     */
    public static getFilesView(
        fileId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/files/{fileId}/view',
            path: {
                'fileId': fileId,
            },
            errors: {
                404: `Default Response`,
                500: `Default Response`,
            },
        });
    }
    /**
     * Download file
     * Downloads the file as attachment (forces download dialog in browser). Validates ownership.
     * @param fileId
     * @returns void
     * @throws ApiError
     */
    public static getFilesDownload(
        fileId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/files/{fileId}/download',
            path: {
                'fileId': fileId,
            },
            errors: {
                404: `Default Response`,
                500: `Default Response`,
            },
        });
    }
    /**
     * Delete file
     * Deletes a file from storage and database. Validates ownership.
     * @param fileId
     * @returns any Default Response
     * @throws ApiError
     */
    public static deleteFiles(
        fileId: string,
    ): CancelablePromise<{
        message: string;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/files/{fileId}',
            path: {
                'fileId': fileId,
            },
            errors: {
                404: `Default Response`,
            },
        });
    }
}
