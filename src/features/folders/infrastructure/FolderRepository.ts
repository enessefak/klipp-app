
import { FolderService } from '@/src/infrastructure/api/generated';
import { CreateFolderDTO, Folder } from '../domain/Folder';

const mapFolder = (folder: any, fallbackParentId?: string | null): Folder => ({
    id: folder.id,
    name: folder.name,
    icon: folder.icon,
    color: folder.color,
    parentId: folder.parentId ?? fallbackParentId ?? undefined,
    createdAt: folder.createdAt,
    permission: folder.permission ?? 'FULL',
    requiresApproval: folder.requiresApproval,
    isConfidential: folder.isConfidential,
    allowedTransactionTypes: (folder.allowedTransactionTypes ?? []) as any,
    allowedTypeIds: folder.allowedTypeIds ?? [],
});



const flattenFolders = (items: any[], parentId?: string | null): Folder[] => {
    if (!Array.isArray(items)) return [];

    return items.reduce<Folder[]>((acc, item) => {
        const mapped = mapFolder(item, parentId);
        acc.push(mapped);

        if (Array.isArray(item.children) && item.children.length > 0) {
            acc.push(...flattenFolders(item.children, item.id));
        }

        return acc;
    }, []);
};

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
                params?.cursor,
                params?.limit,
                params?.search,
                params?.parentId || undefined
            );

            // Handle potential paginated response structure where response might be { items: [...] } instead of directly [...]
            const foldersData = (response as any).data?.items || (response as any).data || (Array.isArray(response) ? response : []);

            if (!Array.isArray(foldersData)) {
                console.error('Unexpected response format:', response);
                return [];
            }

            // Map response to domain model
            if (params?.flat) {
                return foldersData.map((folder: any) => mapFolder(folder));
            }

            return flattenFolders(foldersData);
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
                requiresApproval: dto.requiresApproval ?? false,
                isConfidential: dto.isConfidential ?? false,
                allowedTransactionTypes: (dto.allowedTransactionTypes || []) as any,
            });



            // Unwrap data if necessary (though postFolders usually returns the object directly in generated code, checking if it's wrapped)
            const folder = (response as any).data || response;

            return {
                id: folder.id,
                name: folder.name,
                icon: folder.icon,
                color: folder.color,
                parentId: folder.parentId || undefined,
                createdAt: folder.createdAt,
            };
        } catch (error) {
            console.error('Failed to create folder:', error);
            throw error;
        }
    },

    getFolderById: async (id: string): Promise<Folder> => {
        try {
            const response = await FolderService.getFolders1(id);
            const folder = (response as any).data || response;

            return {
                id: folder.id,
                name: folder.name,
                icon: folder.icon,
                color: folder.color,
                parentId: folder.parentId || undefined,
                createdAt: folder.createdAt,
                owner: {
                    id: folder.userId,
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

    updateFolder: async (id: string, dto: CreateFolderDTO): Promise<Folder> => {
        try {
            const response = await FolderService.putFolders(id, {
                name: dto.name,
                icon: dto.icon,
                color: dto.color,
                parentId: dto.parentId || null,
                requiresApproval: dto.requiresApproval ?? false,
                isConfidential: dto.isConfidential ?? false,
                allowedTransactionTypes: (dto.allowedTransactionTypes || []) as any,
            });


            const folder = (response as any).data || response;
            return {
                id: folder.id,
                name: folder.name,
                icon: folder.icon,
                color: folder.color,
                parentId: folder.parentId || undefined,
                createdAt: folder.createdAt,
                requiresApproval: folder.requiresApproval,
                isConfidential: folder.isConfidential,
                allowedTransactionTypes: (folder.allowedTransactionTypes ?? []) as any,
            };
        } catch (error) {
            console.error('Failed to update folder:', error);
            throw error;
        }
    }
};

