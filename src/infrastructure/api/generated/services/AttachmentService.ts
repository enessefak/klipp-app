/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AttachmentService {
    /**
     * Request approval for an attachment via email
     * @param id
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postAttachmentsRequestApproval(
        id: string,
        requestBody: {
            reviewerEmail: string;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            message?: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/attachments/{id}/request-approval',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Default Response`,
            },
        });
    }
    /**
     * List attachments with filters and pagination
     * List all attachments for the authenticated user. Supports filtering by folder, attachment type, title, document date range, and text search across title and description. Uses cursor-based pagination.
     * @param folderId
     * @param categoryId
     * @param attachmentTypeId
     * @param tagId
     * @param transactionType
     * @param title
     * @param status
     * @param search
     * @param documentDateFrom
     * @param documentDateTo
     * @param createdAtFrom
     * @param createdAtTo
     * @param includeShared
     * @param detailsFilter
     * @param amountMin
     * @param amountMax
     * @param currency
     * @param cursor
     * @param page
     * @param skip
     * @param limit
     * @returns any Default Response
     * @throws ApiError
     */
    public static getAttachments(
        folderId?: string,
        categoryId?: string,
        attachmentTypeId?: string,
        tagId?: string,
        transactionType?: 'INCOME' | 'EXPENSE' | 'NEUTRAL',
        title?: string,
        status?: 'PENDING' | 'APPROVED' | 'REJECTED',
        search?: string,
        documentDateFrom?: string,
        documentDateTo?: string,
        createdAtFrom?: string,
        createdAtTo?: string,
        includeShared?: 'true' | 'false',
        detailsFilter?: string,
        amountMin?: number,
        amountMax?: number,
        currency?: string,
        cursor?: string,
        page?: number,
        skip?: number,
        limit?: number,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            items: Array<{
                id: string;
                userId: string;
                folderId: string;
                categoryId?: string | null;
                attachmentTypeId: string;
                title: string;
                description: string | null;
                documentDate: string;
                transactionType: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
                status: 'PENDING' | 'APPROVED' | 'REJECTED';
                rejectionReason?: string | null;
                images?: Array<{
                    id: string;
                    imageUrl: string;
                    createdAt: string;
                }>;
                attachmentType?: {
                    id: string;
                    name: string;
                    icon: string;
                    color: string;
                    expires: boolean;
                    transactionType?: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
                    category?: 'FINANCIAL' | 'IDENTITY' | 'INSURANCE' | 'CONTRACT' | 'MEDICAL' | 'VEHICLE' | 'EDUCATION' | 'PERSONNEL' | 'OTHER';
                    fieldConfig?: Array<{
                        key: string;
                        label: string;
                        type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'duration' | 'array';
                        required?: boolean;
                        placeholder?: string;
                        unit?: string;
                        options?: Array<(string | {
                            key: string;
                            label: string;
                        })>;
                        filterable?: boolean;
                        filterType?: 'text' | 'number' | 'date' | 'dateRange' | 'select' | 'amount';
                        itemConfig?: any[];
                    }> | null;
                    fieldStyle?: {
                        mobile?: {
                            gridTemplateAreas: Array<string>;
                            gap?: string;
                        };
                        desktop?: {
                            gridTemplateAreas: Array<string>;
                            gap?: string;
                        };
                    } | null;
                    defaultDetails?: Record<string, any> | null;
                };
                folder?: {
                    id: string;
                    name: string;
                    icon: string;
                    color: string;
                };
                category?: {
                    id: string;
                    name: string;
                    accountCode?: string | null;
                };
                tags?: Array<{
                    id: string;
                    name: string;
                    color: string;
                }>;
                financial?: Record<string, any> | null;
                insurance?: Record<string, any> | null;
                identity?: Record<string, any> | null;
                contract?: Record<string, any> | null;
                medical?: Record<string, any> | null;
                vehicle?: Record<string, any> | null;
                education?: Record<string, any> | null;
                personnel?: Record<string, any> | null;
                details?: Record<string, any> | null;
                customFields?: Record<string, any> | null;
                isOwner?: boolean;
                permission?: 'VIEW' | 'EDIT' | 'CREATE' | 'FULL';
                permissions?: {
                    canEdit: boolean;
                    canDelete: boolean;
                    canApprove: boolean;
                    canRequestApproval: boolean;
                };
                createdAt: string;
                updatedAt: string;
            }>;
            hasMore: boolean;
            nextCursor: string | null;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/attachments/',
            query: {
                'folderId': folderId,
                'categoryId': categoryId,
                'attachmentTypeId': attachmentTypeId,
                'tagId': tagId,
                'transactionType': transactionType,
                'title': title,
                'status': status,
                'search': search,
                'documentDateFrom': documentDateFrom,
                'documentDateTo': documentDateTo,
                'createdAtFrom': createdAtFrom,
                'createdAtTo': createdAtTo,
                'includeShared': includeShared,
                'detailsFilter': detailsFilter,
                'amountMin': amountMin,
                'amountMax': amountMax,
                'currency': currency,
                'cursor': cursor,
                'page': page,
                'skip': skip,
                'limit': limit,
            },
        });
    }
    /**
     * Create attachment
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postAttachments(
        requestBody: {
            folderId: string;
            categoryId?: string;
            attachmentTypeId: string;
            title: string;
            description?: string;
            documentDate: string;
            transactionType?: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
            amount?: number | null;
            taxAmount?: number | null;
            currency?: string | null;
            exchangeRate?: number | null;
            tagIds?: Array<string>;
            financial?: Record<string, any>;
            insurance?: Record<string, any>;
            identity?: Record<string, any>;
            contract?: Record<string, any>;
            medical?: Record<string, any>;
            vehicle?: Record<string, any>;
            education?: Record<string, any>;
            details?: Record<string, any>;
            customFields?: Record<string, any>;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            userId: string;
            folderId: string;
            categoryId?: string | null;
            attachmentTypeId: string;
            title: string;
            description: string | null;
            documentDate: string;
            transactionType: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
            status: 'PENDING' | 'APPROVED' | 'REJECTED';
            rejectionReason?: string | null;
            images?: Array<{
                id: string;
                imageUrl: string;
                createdAt: string;
            }>;
            attachmentType?: {
                id: string;
                name: string;
                icon: string;
                color: string;
                expires: boolean;
                transactionType?: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
                category?: 'FINANCIAL' | 'IDENTITY' | 'INSURANCE' | 'CONTRACT' | 'MEDICAL' | 'VEHICLE' | 'EDUCATION' | 'PERSONNEL' | 'OTHER';
                fieldConfig?: Array<{
                    key: string;
                    label: string;
                    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'duration' | 'array';
                    required?: boolean;
                    placeholder?: string;
                    unit?: string;
                    options?: Array<(string | {
                        key: string;
                        label: string;
                    })>;
                    filterable?: boolean;
                    filterType?: 'text' | 'number' | 'date' | 'dateRange' | 'select' | 'amount';
                    itemConfig?: any[];
                }> | null;
                fieldStyle?: {
                    mobile?: {
                        gridTemplateAreas: Array<string>;
                        gap?: string;
                    };
                    desktop?: {
                        gridTemplateAreas: Array<string>;
                        gap?: string;
                    };
                } | null;
                defaultDetails?: Record<string, any> | null;
            };
            folder?: {
                id: string;
                name: string;
                icon: string;
                color: string;
            };
            category?: {
                id: string;
                name: string;
                accountCode?: string | null;
            };
            tags?: Array<{
                id: string;
                name: string;
                color: string;
            }>;
            financial?: Record<string, any> | null;
            insurance?: Record<string, any> | null;
            identity?: Record<string, any> | null;
            contract?: Record<string, any> | null;
            medical?: Record<string, any> | null;
            vehicle?: Record<string, any> | null;
            education?: Record<string, any> | null;
            personnel?: Record<string, any> | null;
            details?: Record<string, any> | null;
            customFields?: Record<string, any> | null;
            isOwner?: boolean;
            permission?: 'VIEW' | 'EDIT' | 'CREATE' | 'FULL';
            permissions?: {
                canEdit: boolean;
                canDelete: boolean;
                canApprove: boolean;
                canRequestApproval: boolean;
            };
            createdAt: string;
            updatedAt: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/attachments/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
            },
        });
    }
    /**
     * Create manual attachment record
     * Create a database record for physical documents (receipts, contracts, etc.) without file upload.
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postAttachmentsRecord(
        requestBody: {
            folderId: string;
            attachmentTypeId: string;
            title: string;
            description?: string;
            documentDate: string;
            transactionType?: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
            details: Record<string, any>;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            userId: string;
            folderId: string;
            categoryId?: string | null;
            attachmentTypeId: string;
            title: string;
            description: string | null;
            documentDate: string;
            transactionType: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
            status: 'PENDING' | 'APPROVED' | 'REJECTED';
            rejectionReason?: string | null;
            images?: Array<{
                id: string;
                imageUrl: string;
                createdAt: string;
            }>;
            attachmentType?: {
                id: string;
                name: string;
                icon: string;
                color: string;
                expires: boolean;
                transactionType?: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
                category?: 'FINANCIAL' | 'IDENTITY' | 'INSURANCE' | 'CONTRACT' | 'MEDICAL' | 'VEHICLE' | 'EDUCATION' | 'PERSONNEL' | 'OTHER';
                fieldConfig?: Array<{
                    key: string;
                    label: string;
                    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'duration' | 'array';
                    required?: boolean;
                    placeholder?: string;
                    unit?: string;
                    options?: Array<(string | {
                        key: string;
                        label: string;
                    })>;
                    filterable?: boolean;
                    filterType?: 'text' | 'number' | 'date' | 'dateRange' | 'select' | 'amount';
                    itemConfig?: any[];
                }> | null;
                fieldStyle?: {
                    mobile?: {
                        gridTemplateAreas: Array<string>;
                        gap?: string;
                    };
                    desktop?: {
                        gridTemplateAreas: Array<string>;
                        gap?: string;
                    };
                } | null;
                defaultDetails?: Record<string, any> | null;
            };
            folder?: {
                id: string;
                name: string;
                icon: string;
                color: string;
            };
            category?: {
                id: string;
                name: string;
                accountCode?: string | null;
            };
            tags?: Array<{
                id: string;
                name: string;
                color: string;
            }>;
            financial?: Record<string, any> | null;
            insurance?: Record<string, any> | null;
            identity?: Record<string, any> | null;
            contract?: Record<string, any> | null;
            medical?: Record<string, any> | null;
            vehicle?: Record<string, any> | null;
            education?: Record<string, any> | null;
            personnel?: Record<string, any> | null;
            details?: Record<string, any> | null;
            customFields?: Record<string, any> | null;
            isOwner?: boolean;
            permission?: 'VIEW' | 'EDIT' | 'CREATE' | 'FULL';
            permissions?: {
                canEdit: boolean;
                canDelete: boolean;
                canApprove: boolean;
                canRequestApproval: boolean;
            };
            createdAt: string;
            updatedAt: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/attachments/record',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
            },
        });
    }
    /**
     * Get attachment by id
     * @param id
     * @returns any Default Response
     * @throws ApiError
     */
    public static getAttachments1(
        id: string,
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            userId: string;
            folderId: string;
            categoryId?: string | null;
            attachmentTypeId: string;
            title: string;
            description: string | null;
            documentDate: string;
            transactionType: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
            status: 'PENDING' | 'APPROVED' | 'REJECTED';
            rejectionReason?: string | null;
            images?: Array<{
                id: string;
                imageUrl: string;
                createdAt: string;
            }>;
            attachmentType?: {
                id: string;
                name: string;
                icon: string;
                color: string;
                expires: boolean;
                transactionType?: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
                category?: 'FINANCIAL' | 'IDENTITY' | 'INSURANCE' | 'CONTRACT' | 'MEDICAL' | 'VEHICLE' | 'EDUCATION' | 'PERSONNEL' | 'OTHER';
                fieldConfig?: Array<{
                    key: string;
                    label: string;
                    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'duration' | 'array';
                    required?: boolean;
                    placeholder?: string;
                    unit?: string;
                    options?: Array<(string | {
                        key: string;
                        label: string;
                    })>;
                    filterable?: boolean;
                    filterType?: 'text' | 'number' | 'date' | 'dateRange' | 'select' | 'amount';
                    itemConfig?: any[];
                }> | null;
                fieldStyle?: {
                    mobile?: {
                        gridTemplateAreas: Array<string>;
                        gap?: string;
                    };
                    desktop?: {
                        gridTemplateAreas: Array<string>;
                        gap?: string;
                    };
                } | null;
                defaultDetails?: Record<string, any> | null;
            };
            folder?: {
                id: string;
                name: string;
                icon: string;
                color: string;
            };
            category?: {
                id: string;
                name: string;
                accountCode?: string | null;
            };
            tags?: Array<{
                id: string;
                name: string;
                color: string;
            }>;
            financial?: Record<string, any> | null;
            insurance?: Record<string, any> | null;
            identity?: Record<string, any> | null;
            contract?: Record<string, any> | null;
            medical?: Record<string, any> | null;
            vehicle?: Record<string, any> | null;
            education?: Record<string, any> | null;
            personnel?: Record<string, any> | null;
            details?: Record<string, any> | null;
            customFields?: Record<string, any> | null;
            isOwner?: boolean;
            permission?: 'VIEW' | 'EDIT' | 'CREATE' | 'FULL';
            permissions?: {
                canEdit: boolean;
                canDelete: boolean;
                canApprove: boolean;
                canRequestApproval: boolean;
            };
            createdAt: string;
            updatedAt: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/attachments/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update attachment
     * @param id
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static putAttachments(
        id: string,
        requestBody?: {
            folderId?: string;
            categoryId?: string;
            attachmentTypeId?: string;
            title?: string;
            description?: string;
            documentDate?: string;
            transactionType?: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
            amount?: number | null;
            taxAmount?: number | null;
            currency?: string | null;
            exchangeRate?: number | null;
            tagIds?: Array<string>;
            financial?: Record<string, any>;
            insurance?: Record<string, any>;
            identity?: Record<string, any>;
            contract?: Record<string, any>;
            medical?: Record<string, any>;
            vehicle?: Record<string, any>;
            education?: Record<string, any>;
            details?: Record<string, any>;
            customFields?: Record<string, any>;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            userId: string;
            folderId: string;
            categoryId?: string | null;
            attachmentTypeId: string;
            title: string;
            description: string | null;
            documentDate: string;
            transactionType: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
            status: 'PENDING' | 'APPROVED' | 'REJECTED';
            rejectionReason?: string | null;
            images?: Array<{
                id: string;
                imageUrl: string;
                createdAt: string;
            }>;
            attachmentType?: {
                id: string;
                name: string;
                icon: string;
                color: string;
                expires: boolean;
                transactionType?: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
                category?: 'FINANCIAL' | 'IDENTITY' | 'INSURANCE' | 'CONTRACT' | 'MEDICAL' | 'VEHICLE' | 'EDUCATION' | 'PERSONNEL' | 'OTHER';
                fieldConfig?: Array<{
                    key: string;
                    label: string;
                    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'duration' | 'array';
                    required?: boolean;
                    placeholder?: string;
                    unit?: string;
                    options?: Array<(string | {
                        key: string;
                        label: string;
                    })>;
                    filterable?: boolean;
                    filterType?: 'text' | 'number' | 'date' | 'dateRange' | 'select' | 'amount';
                    itemConfig?: any[];
                }> | null;
                fieldStyle?: {
                    mobile?: {
                        gridTemplateAreas: Array<string>;
                        gap?: string;
                    };
                    desktop?: {
                        gridTemplateAreas: Array<string>;
                        gap?: string;
                    };
                } | null;
                defaultDetails?: Record<string, any> | null;
            };
            folder?: {
                id: string;
                name: string;
                icon: string;
                color: string;
            };
            category?: {
                id: string;
                name: string;
                accountCode?: string | null;
            };
            tags?: Array<{
                id: string;
                name: string;
                color: string;
            }>;
            financial?: Record<string, any> | null;
            insurance?: Record<string, any> | null;
            identity?: Record<string, any> | null;
            contract?: Record<string, any> | null;
            medical?: Record<string, any> | null;
            vehicle?: Record<string, any> | null;
            education?: Record<string, any> | null;
            personnel?: Record<string, any> | null;
            details?: Record<string, any> | null;
            customFields?: Record<string, any> | null;
            isOwner?: boolean;
            permission?: 'VIEW' | 'EDIT' | 'CREATE' | 'FULL';
            permissions?: {
                canEdit: boolean;
                canDelete: boolean;
                canApprove: boolean;
                canRequestApproval: boolean;
            };
            createdAt: string;
            updatedAt: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/attachments/{id}',
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
     * Delete attachment
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deleteAttachments(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/attachments/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Review an attachment (Approve or Reject)
     * Allows folder owners (and users with FULL permission) to approve or reject attachments uploaded with PENDING status. Rejection requires a reason.
     * @param id
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static patchAttachmentsStatus(
        id: string,
        requestBody: {
            status: 'APPROVED' | 'REJECTED';
            rejectionReason?: string;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            id: string;
            userId: string;
            folderId: string;
            categoryId?: string | null;
            attachmentTypeId: string;
            title: string;
            description: string | null;
            documentDate: string;
            transactionType: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
            status: 'PENDING' | 'APPROVED' | 'REJECTED';
            rejectionReason?: string | null;
            images?: Array<{
                id: string;
                imageUrl: string;
                createdAt: string;
            }>;
            attachmentType?: {
                id: string;
                name: string;
                icon: string;
                color: string;
                expires: boolean;
                transactionType?: 'INCOME' | 'EXPENSE' | 'NEUTRAL';
                category?: 'FINANCIAL' | 'IDENTITY' | 'INSURANCE' | 'CONTRACT' | 'MEDICAL' | 'VEHICLE' | 'EDUCATION' | 'PERSONNEL' | 'OTHER';
                fieldConfig?: Array<{
                    key: string;
                    label: string;
                    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'duration' | 'array';
                    required?: boolean;
                    placeholder?: string;
                    unit?: string;
                    options?: Array<(string | {
                        key: string;
                        label: string;
                    })>;
                    filterable?: boolean;
                    filterType?: 'text' | 'number' | 'date' | 'dateRange' | 'select' | 'amount';
                    itemConfig?: any[];
                }> | null;
                fieldStyle?: {
                    mobile?: {
                        gridTemplateAreas: Array<string>;
                        gap?: string;
                    };
                    desktop?: {
                        gridTemplateAreas: Array<string>;
                        gap?: string;
                    };
                } | null;
                defaultDetails?: Record<string, any> | null;
            };
            folder?: {
                id: string;
                name: string;
                icon: string;
                color: string;
            };
            category?: {
                id: string;
                name: string;
                accountCode?: string | null;
            };
            tags?: Array<{
                id: string;
                name: string;
                color: string;
            }>;
            financial?: Record<string, any> | null;
            insurance?: Record<string, any> | null;
            identity?: Record<string, any> | null;
            contract?: Record<string, any> | null;
            medical?: Record<string, any> | null;
            vehicle?: Record<string, any> | null;
            education?: Record<string, any> | null;
            personnel?: Record<string, any> | null;
            details?: Record<string, any> | null;
            customFields?: Record<string, any> | null;
            isOwner?: boolean;
            permission?: 'VIEW' | 'EDIT' | 'CREATE' | 'FULL';
            permissions?: {
                canEdit: boolean;
                canDelete: boolean;
                canApprove: boolean;
                canRequestApproval: boolean;
            };
            createdAt: string;
            updatedAt: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/attachments/{id}/status',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
                403: `Default Response`,
                404: `Default Response`,
            },
        });
    }
}
