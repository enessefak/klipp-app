export type SharePermission = 'VIEW' | 'EDIT' | 'CREATE' | 'FULL';
export type ShareStatus = 'pending' | 'accepted' | 'rejected';

export interface ShareUser {
    id: string;
    name: string;
    email: string;
}

export interface FolderShare {
    id: string;
    folderId: string;
    folderName: string;
    sharedBy: ShareUser;
    sharedWith: ShareUser;
    permission: SharePermission;
    status: ShareStatus;
    createdAt: string;
    updatedAt: string;
}

export interface SharedFolder {
    id: string;
    name: string;
    icon: string;
    color: string;
    permission: SharePermission;
    status: ShareStatus;
    owner: ShareUser;
    shareId: string;
    attachmentCount?: number;
    createdAt: string;
}

export interface CreateShareDTO {
    folderId: string;
    targetUserId: string;
    permission?: SharePermission;
}

export interface SearchedUser {
    id: string;
    name: string;
    email: string;
}
