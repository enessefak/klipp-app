import { useCallback, useState } from 'react';
import { SharingService } from '../data/SharingService';
import {
    CreateShareDTO,
    FolderShare,
    SearchedUser,
    SharedFolder,
    ShareStatus
} from '../domain/FolderShare';

export function useFolderSharing() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sharedWithMe, setSharedWithMe] = useState<SharedFolder[]>([]);
    const [sharedByMe, setSharedByMe] = useState<FolderShare[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);

    /**
     * Search users by email
     */
    const searchUsers = useCallback(async (email: string) => {
        if (!email || email.length < 3) {
            setSearchResults([]);
            return;
        }
        try {
            setLoading(true);
            const results = await SharingService.searchUsersByEmail(email);
            setSearchResults(results);
        } catch (err) {
            console.error('Failed to search users:', err);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Share a folder
     */
    const shareFolder = useCallback(async (data: CreateShareDTO): Promise<FolderShare | null> => {
        try {
            setLoading(true);
            setError(null);
            const share = await SharingService.shareFolder(data);
            return share;
        } catch (err: any) {
            console.error('Failed to share folder:', err);
            setError(err?.body?.message || 'Paylaşım başarısız oldu');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const [sharedWithMeCursor, setSharedWithMeCursor] = useState<string | undefined>(undefined);
    const [sharedWithMeHasMore, setSharedWithMeHasMore] = useState(false);
    const [loadingMoreSharedWithMe, setLoadingMoreSharedWithMe] = useState(false);

    /**
     * Load folders shared with me
     */
    const loadSharedWithMe = useCallback(async (status?: ShareStatus, isLoadMore = false, limit?: number, search?: string) => {
        try {
            setLoading(true);
            setError(null);

            // Reverting pagination: ignore isLoadMore, limit, cursor. 
            // We pass status and search (if backend supports search without pagination params, otherwise filtering client side?)
            // The user requested removing pagination/undoing recent changes but keeping filters.
            // Assuming SharingService.getSharedWithMe now ONLY takes status (as I reverted it in prev step).
            // BUT wait, I need to check if I can pass search to SharingService. 
            // In SharingService.getSharedWithMe I removed arguments. So I can only filter by status there.
            // I should filter by search client-side if the API doesn't support it anymore?
            // OR I should have kept search in SharingService.
            // Let's rely on client side filtering for search if API reverted.

            const folders = await SharingService.getSharedWithMe(status);

            let filteredFolders = folders;
            if (search) {
                const lowerSearch = search.toLowerCase();
                filteredFolders = folders.filter(f => f.name.toLowerCase().includes(lowerSearch));
            }

            setSharedWithMe(filteredFolders);
            setSharedWithMeHasMore(false);

        } catch (err) {
            console.error('Failed to load shared folders:', err);
            setError('Paylaşılan klasörler yüklenemedi');
        } finally {
            setLoading(false);
            setLoadingMoreSharedWithMe(false);
        }
    }, []);

    /**
     * Load folders I shared
     */
    const loadSharedByMe = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const shares = await SharingService.getSharedByMe();
            setSharedByMe(shares);
        } catch (err) {
            console.error('Failed to load my shares:', err);
            setError('Paylaştığınız klasörler yüklenemedi');
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Refresh pending count
     */
    const refreshPendingCount = useCallback(async () => {
        try {
            const count = await SharingService.getPendingCount();
            setPendingCount(count);
        } catch (err) {
            console.error('Failed to get pending count:', err);
        }
    }, []);

    /**
     * Accept a share invitation
     */
    const acceptShare = useCallback(async (shareId: string): Promise<boolean> => {
        try {
            setLoading(true);
            await SharingService.respondToShare(shareId, true);
            // Update local state
            setSharedWithMe(prev =>
                prev.map(f => f.shareId === shareId ? { ...f, status: 'accepted' as ShareStatus } : f)
            );
            setPendingCount(prev => Math.max(0, prev - 1));
            return true;
        } catch (err) {
            console.error('Failed to accept share:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Reject a share invitation
     */
    const rejectShare = useCallback(async (shareId: string): Promise<boolean> => {
        try {
            setLoading(true);
            await SharingService.respondToShare(shareId, false);
            // Remove from local state
            setSharedWithMe(prev => prev.filter(f => f.shareId !== shareId));
            setPendingCount(prev => Math.max(0, prev - 1));
            return true;
        } catch (err) {
            console.error('Failed to reject share:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Remove a share (revoke or leave)
     */
    const removeShare = useCallback(async (shareId: string): Promise<boolean> => {
        try {
            setLoading(true);
            await SharingService.removeShare(shareId);
            // Update local state
            setSharedByMe(prev => prev.filter(s => s.id !== shareId));
            setSharedWithMe(prev => prev.filter(f => f.shareId !== shareId));
            return true;
        } catch (err) {
            console.error('Failed to remove share:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        loadingMoreSharedWithMe,
        error,
        sharedWithMe,
        sharedByMe,
        pendingCount,
        searchResults,
        sharedWithMeHasMore,
        searchUsers,
        shareFolder,
        loadSharedWithMe,
        loadSharedByMe,
        refreshPendingCount,
        acceptShare,
        rejectShare,
        removeShare,
    };
}
