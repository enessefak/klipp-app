import { FolderSharingService } from '@/src/infrastructure/api/generated/services/FolderSharingService';
import { UserService } from '@/src/infrastructure/api/generated/services/UserService';
import {
    CreateShareDTO,
    FolderShare,
    SearchedUser,
    SharedFolder,
    ShareStatus
} from '../domain/FolderShare';

export class SharingService {
    /**
     * Search users by email for sharing
     */
    static async searchUsersByEmail(email: string): Promise<SearchedUser[]> {
        const response = await UserService.getUsersSearch(email);
        const data = (response as any).data || response;
        return Array.isArray(data) ? data : [];
    }

    /**
     * Get user by ID
     */
    static async getUserById(userId: string): Promise<SearchedUser | null> {
        try {
            const response = await UserService.getUsers(userId);
            const data = (response as any).data || response;
            return {
                id: data.id,
                name: data.name,
                email: data.email,
            };
        } catch {
            return null;
        }
    }

    /**
     * Share a folder with another user
     */
    static async shareFolder(data: CreateShareDTO): Promise<FolderShare> {
        const response = await FolderSharingService.postFolderShares({
            folderId: data.folderId,
            targetUserId: data.targetUserId,
            permission: data.permission || 'VIEW',
        });
        return (response as any).data || response;
    }

    /**
     * Get folders shared with me
     */
    static async getSharedWithMe(status?: ShareStatus): Promise<SharedFolder[]> {
        // @ts-ignore - Ignoring missing args for now to fix regression
        const response = await FolderSharingService.getFolderSharesSharedWithMe(status);
        const items = (response as any).data?.items || (response as any).data || (Array.isArray(response) ? response : []);
        return items;
    }

    /**
     * Get folders I shared with others
     */
    static async getSharedByMe(): Promise<FolderShare[]> {
        const response = await FolderSharingService.getFolderSharesSharedByMe();
        const items = (response as any).data?.items || (response as any).data || (Array.isArray(response) ? response : []);
        return items;
    }

    /**
     * Get pending share invitations count (for badge)
     */
    static async getPendingCount(): Promise<number> {
        const response = await FolderSharingService.getFolderSharesPendingCount();
        return (response as any).data?.count ?? (response as any).count ?? 0;
    }

    /**
     * Get all shares for a specific folder
     */
    static async getFolderShares(folderId: string): Promise<FolderShare[]> {
        const response = await FolderSharingService.getFolderSharesFolder(folderId);
        const items = (response as any).data?.items || (response as any).data || (Array.isArray(response) ? response : []);
        return items;
    }

    /**
     * Accept or reject a share invitation
     */
    static async respondToShare(shareId: string, accept: boolean): Promise<FolderShare> {
        const response = await FolderSharingService.patchFolderSharesRespond(shareId, {
            status: accept ? 'accepted' : 'rejected',
        });
        return (response as any).data || response;
    }

    /**
     * Update share permission
     */
    static async updateSharePermission(shareId: string, permission: CreateShareDTO['permission']): Promise<FolderShare> {
        const response = await FolderSharingService.patchFolderShares(shareId, {
            permission,
        });
        return (response as any).data || response;
    }

    /**
     * Revoke or leave a share
     */
    static async removeShare(shareId: string): Promise<void> {
        await FolderSharingService.deleteFolderShares(shareId);
    }
}
