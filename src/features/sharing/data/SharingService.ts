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
        return response;
    }

    /**
     * Get user by ID
     */
    static async getUserById(userId: string): Promise<SearchedUser | null> {
        try {
            const response = await UserService.getUsers(userId);
            return {
                id: response.id,
                name: response.name,
                email: response.email,
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
        return response;
    }

    /**
     * Get folders shared with me
     */
    static async getSharedWithMe(status?: ShareStatus): Promise<SharedFolder[]> {
        // @ts-ignore - Ignoring missing args for now to fix regression
        const response = await FolderSharingService.getFolderSharesSharedWithMe(status);
        const items = Array.isArray(response) ? response : (response as any).items || (response as any).data || [];
        return items;
    }

    /**
     * Get folders I shared with others
     */
    static async getSharedByMe(): Promise<FolderShare[]> {
        const response = await FolderSharingService.getFolderSharesSharedByMe();
        const items = Array.isArray(response) ? response : (response as any).items || (response as any).data || [];
        return items;
    }

    /**
     * Get pending share invitations count (for badge)
     */
    static async getPendingCount(): Promise<number> {
        const response = await FolderSharingService.getFolderSharesPendingCount();
        return response.count;
    }

    /**
     * Get all shares for a specific folder
     */
    static async getFolderShares(folderId: string): Promise<FolderShare[]> {
        const response = await FolderSharingService.getFolderSharesFolder(folderId);
        const items = Array.isArray(response) ? response : (response as any).items || (response as any).data || [];
        return items;
    }

    /**
     * Accept or reject a share invitation
     */
    static async respondToShare(shareId: string, accept: boolean): Promise<FolderShare> {
        const response = await FolderSharingService.patchFolderSharesRespond(shareId, {
            status: accept ? 'accepted' : 'rejected',
        });
        return response;
    }

    /**
     * Update share permission
     */
    static async updateSharePermission(shareId: string, permission: CreateShareDTO['permission']): Promise<FolderShare> {
        const response = await FolderSharingService.patchFolderShares(shareId, {
            permission,
        });
        return response;
    }

    /**
     * Revoke or leave a share
     */
    static async removeShare(shareId: string): Promise<void> {
        await FolderSharingService.deleteFolderShares(shareId);
    }
}
