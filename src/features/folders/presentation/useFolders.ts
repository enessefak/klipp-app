import { AttachmentRepository } from '@/src/features/attachments/data/AttachmentRepository';
import { Attachment } from '@/src/features/attachments/domain/Attachment';
import { useCallback, useEffect, useState } from 'react';
import { CreateFolderDTO, Folder } from '../domain/Folder';
import { FolderRepository } from '../infrastructure/FolderRepository';
import { FolderEvents } from './FolderEvents';

interface UseFoldersOptions {
    limit?: number;
    isSharedFolder?: boolean;
    fetchMode?: 'all' | 'rootOnly';
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

            if (parentId && !searchQuery) {
                const folderAttachments = await AttachmentRepository.getAttachmentsByFolder(parentId);
                setAttachments(folderAttachments.items || []);
            } else if (!parentId && !searchQuery) {
                setAttachments([]);
            }

        } catch (err) {
            setError('Failed to load folders');
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [parentId, searchQuery]);

    // Initial load
    useEffect(() => {
        fetchFolders();
    }, [parentId, searchQuery]); // Re-fetch on parentId or search change

    // Listen for global delete events
    useEffect(() => {
        const unsubscribe = FolderEvents.subscribeToDelete((deletedId) => {
            setFolders(prev => prev.filter(f => f.id !== deletedId));
        });
        return unsubscribe;
    }, []);

    const createFolder = useCallback(async (data: CreateFolderDTO) => {
        try {
            await FolderRepository.createFolder(data);
            fetchFolders();
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
        deleteFolder,
        refresh,
        loadMore,
        hasMore,
        search
    };
}
