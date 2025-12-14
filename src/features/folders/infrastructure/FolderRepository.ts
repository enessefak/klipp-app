
import { FolderService, FolderSharingService } from '@/src/infrastructure/api/generated';
import { CreateFolderDTO, Folder } from '../domain/Folder';

export const FolderRepository = {
    getFolders: async (): Promise<Folder[]> => {
        try {
            // Fetch personal and shared folders in parallel
            const [personalFolders, sharedFolders] = await Promise.all([
                FolderService.getFolders('true'),
                FolderSharingService.getFolderSharesSharedWithMe()
            ]);

            // Map personal folders
            const mappedPersonalFolders: Folder[] = personalFolders.map(folder => ({
                id: folder.id,
                name: folder.name,
                icon: folder.icon,
                color: folder.color,
                parentId: folder.parentId || undefined,
                createdAt: folder.createdAt,
                permission: 'FULL',
            }));

            // Map shared folders
            const mappedSharedFolders: Folder[] = sharedFolders.map(share => ({
                id: share.id, // This is usually the folder ID in the share response, or check if it is share ID
                name: share.name,
                icon: share.icon,
                color: share.color,
                parentId: undefined, // Shared folders appear at root
                createdAt: share.createdAt,
                isShared: true,
                permission: share.permission,
                owner: share.owner,
            }));

            return [...mappedPersonalFolders, ...mappedSharedFolders];
        } catch (error) {
            console.error('Failed to fetch folders:', error);
            throw error;
        }
    },

    createFolder: async (dto: CreateFolderDTO): Promise<Folder> => {
        try {
            const response = await FolderService.postFolders({
                name: dto.name,
                icon: dto.icon,
                color: dto.color,
                parentId: dto.parentId || null,
            });

            return {
                id: response.id,
                name: response.name,
                icon: response.icon,
                color: response.color,
                parentId: response.parentId || undefined,
                createdAt: response.createdAt,
            };
        } catch (error) {
            console.error('Failed to create folder:', error);
            throw error;
        }
    },

    getFolderById: async (id: string): Promise<Folder> => {
        try {
            const response = await FolderService.getFolders1(id);

            return {
                id: response.id,
                name: response.name,
                icon: response.icon,
                color: response.color,
                parentId: response.parentId || undefined,
                createdAt: response.createdAt,
            };
        } catch (error) {
            console.error('Failed to fetch folder:', error);
            throw error;
        }
    },
};
