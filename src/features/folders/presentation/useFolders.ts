import { AttachmentRepository } from '@/src/features/attachments/data/AttachmentRepository';
import { Attachment } from '@/src/features/attachments/domain/Attachment';
import { useEffect, useState } from 'react';
import { CreateFolderDTO, Folder } from '../domain/Folder';
import { FolderRepository } from '../infrastructure/FolderRepository';

interface UseFoldersOptions {
    isSharedFolder?: boolean;
}

export function useFolders(parentId?: string, options?: UseFoldersOptions) {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFolders = async () => {
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
    };

    useEffect(() => {
        fetchFolders();
    }, [parentId]);

    const createFolder = async (data: CreateFolderDTO) => {
        try {
            await FolderRepository.createFolder(data);
            fetchFolders();
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const refresh = () => fetchFolders();

    return {
        folders,
        attachments,
        loading,
        error,
        createFolder,
        refresh
    };
}
