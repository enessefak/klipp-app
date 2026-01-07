/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ExportService {
    /**
     * List available export formats
     * @returns any Default Response
     * @throws ApiError
     */
    public static getExportFormats(): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: Array<{
            code: string;
            name: string;
            type: 'single' | 'bulk';
            extension: string;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/export/formats',
        });
    }
    /**
     * Export a single attachment in specific format (UBL-TR, ZUGFeRD, JSON, etc.)
     * @param format Export format code
     * @param id
     * @param fieldMapping JSON string mapping fields (e.g. {"amount": "custom_price"})
     * @param selectedFields JSON array of field keys to include (e.g. ["id", "amount"])
     * @returns any Default Response
     * @throws ApiError
     */
    public static getExportAttachment(
        format: 'TR_UBL' | 'DE_ZUGFERD' | 'JSON' | 'CSV' | 'XML' | 'EXCEL',
        id: string,
        fieldMapping?: string,
        selectedFields?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/export/attachment/{id}',
            path: {
                'id': id,
            },
            query: {
                'format': format,
                'fieldMapping': fieldMapping,
                'selectedFields': selectedFields,
            },
        });
    }
    /**
     * Export matching attachments to Excel, CSV, JSON, etc.
     * @param format Export format code
     * @param folderId
     * @param categoryId
     * @param attachmentTypeId
     * @param transactionType
     * @param title
     * @param search
     * @param documentDateFrom
     * @param documentDateTo
     * @param includeShared
     * @param includeSubfolders Set to "true" to include subfolders when folderId is present
     * @param fieldMapping JSON string mapping fields (e.g. {"amount": "custom_price"})
     * @param selectedFields JSON array of field keys to include (e.g. ["id", "amount"])
     * @returns any Default Response
     * @throws ApiError
     */
    public static getExportAttachments(
        format: 'TR_EXCEL' | 'DE_DATEV' | 'JSON' | 'CSV' | 'XML' | 'EXCEL',
        folderId?: string,
        categoryId?: string,
        attachmentTypeId?: string,
        transactionType?: 'INCOME' | 'EXPENSE' | 'NEUTRAL',
        title?: string,
        search?: string,
        documentDateFrom?: string,
        documentDateTo?: string,
        includeShared?: string,
        includeSubfolders?: string,
        fieldMapping?: string,
        selectedFields?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/export/attachments',
            query: {
                'folderId': folderId,
                'categoryId': categoryId,
                'attachmentTypeId': attachmentTypeId,
                'transactionType': transactionType,
                'title': title,
                'search': search,
                'documentDateFrom': documentDateFrom,
                'documentDateTo': documentDateTo,
                'includeShared': includeShared,
                'includeSubfolders': includeSubfolders,
                'format': format,
                'fieldMapping': fieldMapping,
                'selectedFields': selectedFields,
            },
        });
    }
}
