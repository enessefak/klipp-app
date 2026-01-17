export interface DashboardOverview {
    totalFolders: number;
    sharedFolders: number;
    totalAttachments: number;
    pendingApprovals: number;
    totalShares: number;
}

export interface FolderSummaryData {
    id: string;
    name: string;
    icon: string;
    color: string;
    isOwner: boolean;
    isFinancial: boolean;
    attachmentCount: number;
    lastUpdated: string;
    summary: {
        totalIncome?: number;
        totalExpense?: number;
        netBalance?: number;
        currency: string;
    } | null;
}

export interface DashboardRecentActivity {
    id: string;
    title: string;
    amount?: number;
    currency: string | null;
    date: string;
    folderName: string;
    userName: string | null;
}

export interface DashboardData {
    overview: DashboardOverview;
    folders: FolderSummaryData[];
    recentActivity: DashboardRecentActivity[];
}
