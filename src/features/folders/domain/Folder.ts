export interface Folder {
    id: string;
    name: string;
    icon: string;
    color: string;
    parentId?: string; // Optional for root folders
    createdAt: string;
    isShared?: boolean;
    permission?: 'VIEW' | 'EDIT' | 'CREATE' | 'FULL';
    isSystem?: boolean;
    systemType?: 'INBOX' | string;
    requiresApproval?: boolean;
    isConfidential?: boolean;
    allowedTransactionTypes?: string[];
    allowedTypeIds?: string[];
    owner?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface CreateFolderDTO {
    name: string;
    icon: string;
    color: string;
    parentId: string | null; // Null for root folders
    requiresApproval?: boolean;
    isConfidential?: boolean;
    allowedTransactionTypes?: string[];
    allowedTypeIds?: string[];
}
