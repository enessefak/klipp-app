/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DashboardService {
    /**
     * Get dashboard statistics
     * Returns overview stats, folder summaries with financial data, and recent activity.
     * @returns any Default Response
     * @throws ApiError
     */
    public static getDashboardStats(): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            overview: {
                totalFolders: number;
                sharedFolders: number;
                totalAttachments: number;
                pendingApprovals: number;
                totalShares: number;
            };
            folders: Array<{
                id: string;
                name: string;
                icon: string;
                color: string;
                isOwner: boolean;
                isFinancial: boolean;
                attachmentCount: number;
                lastUpdated: string;
                summary: {
                    totalIncome?: any;
                    totalExpense?: any;
                    netBalance?: any;
                    currency: string;
                } | null;
            }>;
            recentActivity: Array<{
                id: string;
                title: string;
                amount?: any;
                currency: string | null;
                date: string;
                folderName: string;
                userName: string | null;
            }>;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/dashboard/stats',
        });
    }
}
