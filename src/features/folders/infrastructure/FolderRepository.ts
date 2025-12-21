
import { FolderService } from '@/src/infrastructure/api/generated';
import { CreateFolderDTO, Folder } from '../domain/Folder';

export const FolderRepository = {
    getFolders: async (params?: {
        parentId?: string | null;
        cursor?: string;
        limit?: number;
        search?: string;
        flat?: boolean;
    }): Promise<Folder[]> => {
        try {
            // Fetch folders from API with pagination and filtering
            const response = await FolderService.getFolders(
                params?.flat ? 'true' : 'false',
                undefined, // cursor
                undefined, // limit
                undefined, // search
                params?.parentId || undefined
            );

            // Handle potential paginated response structure where response might be { items: [...] } instead of directly [...]
            const foldersData = Array.isArray(response) ? response : (response as any).items || (response as any).data || [];

            if (!Array.isArray(foldersData)) {
                console.error('Unexpected response format:', response);
                return [];
            }

            // Map response to domain model
            const mappedFolders: Folder[] = foldersData.map((folder: any) => ({
                id: folder.id,
                name: folder.name,
                icon: folder.icon,
                color: folder.color,
                parentId: folder.parentId || undefined,
                createdAt: folder.createdAt,
                permission: 'FULL',
            }));

            return mappedFolders;
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
                owner: {
                    id: response.userId,
                    name: '', // Not returned by API for getFolderById
                    email: ''
                }
            };
        } catch (error) {
            console.error('Failed to fetch folder:', error);
            throw error;
        }
    },

    deleteFolder: async (id: string): Promise<void> => {
        try {
            await FolderService.deleteFolders(id);
        } catch (error) {
            console.error('Failed to delete folder:', error);
            throw error;
        }
    },
};
