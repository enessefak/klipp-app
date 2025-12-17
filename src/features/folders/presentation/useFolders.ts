import { AttachmentRepository } from '@/src/features/attachments/data/AttachmentRepository';
import { Attachment } from '@/src/features/attachments/domain/Attachment';
import { useCallback, useEffect, useState } from 'react';
import { CreateFolderDTO, Folder } from '../domain/Folder';
import { FolderRepository } from '../infrastructure/FolderRepository';
import { FolderEvents } from './FolderEvents';

interface UseFoldersOptions {
    isSharedFolder?: boolean;
}

export function useFolders(parentId?: string, options?: UseFoldersOptions) {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFolders = useCallback(async () => {
        try {
            setLoading(true);
            const allFolders = await FolderRepository.getFolders();

            if (parentId) {
                setFolders(allFolders.filter(f => f.parentId === parentId));
                // Fetch attachments for this folder
                // For shared folders, the API automatically checks permissions
                const folderAttachments = await AttachmentRepository.getAttachmentsByFolder(parentId);
                setAttachments(folderAttachments.items || []);
            } else {
                setFolders(allFolders.filter(f => !f.parentId));
                setAttachments([]);
            }
        } catch (err) {
            setError('Failed to load folders');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [parentId]);

    useEffect(() => {
        fetchFolders();
    }, [fetchFolders]);

    // Listen for global delete events to update state without refresh
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
            // If we are observing a parent, refresh. 
            // If we are verifying this from checking the folders list, removing it from local state avoids refresh.
            setFolders(prev => prev.filter(f => f.id !== id));
        } catch (err) {
            console.error(err);
            throw err;
        }
    }, []);

    const refresh = fetchFolders;

    return {
        folders,
        attachments,
        loading,
        error,
        createFolder,
        deleteFolder,
        refresh
    };
}
