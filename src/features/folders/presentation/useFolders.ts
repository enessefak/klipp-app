import { AttachmentRepository } from '@/src/features/attachments/data/AttachmentRepository';
import { Attachment, AttachmentFilters } from '@/src/features/attachments/domain/Attachment';
import { useCallback, useEffect, useState } from 'react';
import { CreateFolderDTO, Folder } from '../domain/Folder';
import { FolderRepository } from '../infrastructure/FolderRepository';
import { FolderEvents } from './FolderEvents';

interface UseFoldersOptions {
    limit?: number;
    isSharedFolder?: boolean;
    fetchMode?: 'all' | 'rootOnly';
    attachmentFilters?: Omit<AttachmentFilters, 'folderId'>;
}

export function useFolders(parentId?: string, options?: UseFoldersOptions) {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cursor, setCursor] = useState<string | undefined>(undefined);
    const [hasMore, setHasMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const limit = options?.limit || 20;
    const fetchMode = options?.fetchMode || 'all';
    const attachmentFilters = options?.attachmentFilters;

    const fetchFolders = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch all folders matching search or parent
            const isRootView = fetchMode === 'rootOnly' && !parentId && !searchQuery;

            const fetchedFolders = await FolderRepository.getFolders({
                parentId: parentId || undefined,
                search: searchQuery || undefined,
                flat: !isRootView,
                limit
            });

            const normalizedFolders = isRootView
                ? fetchedFolders.filter(folder => !folder.parentId)
                : fetchedFolders;

            setFolders(normalizedFolders);

            // Check if we have more based on some other heuristic or just disable "load more"
            setHasMore(false);
            setCursor(undefined);

            if (parentId) {
                // Pass all filters (including search) to the backend
                const folderAttachments = await AttachmentRepository.getAttachmentsByFolder(
                    parentId,
                    attachmentFilters
                );
                setAttachments(folderAttachments.items || []);
            } else if (!parentId && !searchQuery) {
                // Fetch root-level documents explicitly using the new API param
                // Note: we fetch root attachments using the new isRootLevel filter. We have to map it via AttachmentFilters format 
                // but the openapi client probably generated isRootLevel?: 'true' | 'false' in AttachmentListQuery.
                // We'll pass it manually if needed, or update our domain filter. 
                const rootAttachments = await AttachmentRepository.getAttachments({
                    ...attachmentFilters,
                    isRootLevel: 'true' as any, // Bypass strict typing in domain layer if we didn't update it yet
                });
                setAttachments(rootAttachments.items || []);
            }

        } catch (err) {
            setError('Failed to load folders');
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [parentId, searchQuery, attachmentFilters]);
    // Stringify filters for stable dependency comparison
    const filtersKey = JSON.stringify(attachmentFilters);

    // Initial load and refetch when filters change
    useEffect(() => {
        fetchFolders();
    }, [parentId, searchQuery, filtersKey]); // Re-fetch on parentId, search, or filters change

    // Listen for global delete events
    useEffect(() => {
        const unsubscribe = FolderEvents.subscribeToDelete((deletedId) => {
            setFolders(prev => prev.filter(f => f.id !== deletedId));
        });
        return unsubscribe;
    }, []);

    // Listen for global create events
    useEffect(() => {
        const unsubscribe = FolderEvents.subscribeToCreate(() => {
            fetchFolders();
        });
        return unsubscribe;
    }, [fetchFolders]);

    const createFolder = useCallback(async (data: CreateFolderDTO) => {
        try {
            const result = await FolderRepository.createFolder(data);
            fetchFolders();
            return result;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }, [fetchFolders]);

    const deleteFolder = useCallback(async (id: string) => {
        try {
            await FolderRepository.deleteFolder(id);
            setFolders(prev => prev.filter(f => f.id !== id));
        } catch (err) {
            console.error(err);
            throw err;
        }
    }, []);

    const updateFolder = useCallback(async (id: string, data: CreateFolderDTO) => {
        try {
            await FolderRepository.updateFolder(id, data);
            fetchFolders(); // Simple refresh for now
        } catch (err) {
            console.error(err);
            throw err;
        }
    }, [fetchFolders]);

    const refresh = () => fetchFolders();

    const loadMore = () => {
        // Disabled
    };

    const search = (query: string) => {
        setSearchQuery(query);
        // effect will trigger fetch
    };

    return {
        folders,
        attachments,
        loading,
        loadingMore,
        error,
        createFolder,
        updateFolder,
        deleteFolder,
        refresh,
        loadMore,
        hasMore,
        search
    };

}
